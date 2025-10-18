import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers/index";
import { User } from "@/types/user";
import { getClientIp } from "@/lib/ip";
import { getIsoTimestr } from "@/lib/time";
import { getUuid } from "@/lib/hash";
import { saveUser } from "@/services/user";
import { handleSignInUser } from "./handler";
import { verifyPassword } from '@/lib/password';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

let providers: Provider[] = [];

// Email & Password Auth
providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "邮箱密码",
    credentials: {
      email: { 
        label: "邮箱", 
        type: "email", 
        placeholder: "[email protected]" 
      },
      password: { 
        label: "密码", 
        type: "password" 
      },
    },

    async authorize(credentials, req) {
      try {
        if (!credentials?.email || !credentials?.password) {
          console.log("[登录] 缺少邮箱或密码");
          return null;
        }

        // 查找用户
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.email, (credentials.email as string).toLowerCase()))
          .limit(1);

        if (userResult.length === 0) {
          console.log("[登录] 用户不存在:", credentials.email);
          return null;
        }

        const user = userResult[0];

        // 检查是否有密码（防止OAuth用户用密码登录）
        if (!user.password_encrypted) {
          console.log("[登录] OAuth用户尝试用密码登录");
          return null;
        }

        // 验证密码
        const isValidPassword = verifyPassword(
          credentials.password as string,
          user.password_encrypted
        );

        if (!isValidPassword) {
          console.log("[登录] 密码错误");
          return null;
        }

        console.log("[登录成功]", { email: user.email });

        // 返回用户信息
        return {
          id: user.uuid,
          email: user.email,
          name: user.nickname || user.email.split('@')[0],
          image: user.avatar_url,
        };
      } catch (error) {
        console.error("[登录异常]", error);
        return null;
      }
    },
  })
);

// Google One Tap Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true" &&
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
) {
  providers.push(
    CredentialsProvider({
      id: "google-one-tap",
      name: "google-one-tap",

      credentials: {
        credential: { type: "text" },
      },

      async authorize(credentials, req) {
        const googleClientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
        if (!googleClientId) {
          console.log("invalid google auth config");
          return null;
        }

        const token = credentials!.credential;

        const response = await fetch(
          "https://oauth2.googleapis.com/tokeninfo?id_token=" + token
        );
        if (!response.ok) {
          console.log("Failed to verify token");
          return null;
        }

        const payload = await response.json();
        if (!payload) {
          console.log("invalid payload from token");
          return null;
        }

        const {
          email,
          sub,
          given_name,
          family_name,
          email_verified,
          picture: image,
        } = payload;
        if (!email) {
          console.log("invalid email in payload");
          return null;
        }

        const user = {
          id: sub,
          name: [given_name, family_name].join(" "),
          email,
          image,
          emailVerified: email_verified ? new Date() : null,
        };

        return user;
      },
    })
  );
}

// Google Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
  process.env.AUTH_GOOGLE_ID &&
  process.env.AUTH_GOOGLE_SECRET
) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

// Github Auth
if (
  process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" &&
  process.env.AUTH_GITHUB_ID &&
  process.env.AUTH_GITHUB_SECRET
) {
  providers.push(
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "google-one-tap");

export const authOptions: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token, user }) {
      if (token && token.user && token.user) {
        session.user = token.user;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      try {
        if (!user || !account) {
          return token;
        }

        const userInfo = await handleSignInUser(user, account);
        if (!userInfo) {
          throw new Error("save user failed");
        }

        token.user = {
          uuid: userInfo.uuid,
          email: userInfo.email,
          nickname: userInfo.nickname,
          avatar_url: userInfo.avatar_url,
          created_at: userInfo.created_at,
        };

        return token;
      } catch (e) {
        console.error("jwt callback error:", e);
        return token;
      }
    },
  },
};
