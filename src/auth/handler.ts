import { AdapterUser } from "next-auth/adapters";
import { Account, User } from "next-auth";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { saveUser } from "@/services/user";
import { User as UserType } from "@/types/user";
import { getClientIp } from "@/lib/ip";
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function handleSignInUser(
  user: User | AdapterUser,
  account: Account
): Promise<UserType | null> {
  try {
    if (!user.email) {
      throw new Error("invalid signin user");
    }

    // 邮箱密码登录特殊处理
    if (account.provider === "credentials") {
      // 邮箱密码登录时，用户已在数据库中，直接查询返回
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email.toLowerCase()))
        .limit(1);

      if (userResult.length === 0) {
        throw new Error("User not found");
      }

      console.log("[认证处理] 邮箱密码登录:", user.email);
      const dbUser = userResult[0];
      return {
        id: dbUser.id,
        uuid: dbUser.uuid,
        email: dbUser.email,
        created_at: dbUser.created_at || undefined,
        nickname: dbUser.nickname || '',
        avatar_url: dbUser.avatar_url || '',
        locale: dbUser.locale || undefined,
        signin_type: dbUser.signin_type || undefined,
        signin_ip: dbUser.signin_ip || undefined,
        signin_provider: dbUser.signin_provider || undefined,
        signin_openid: dbUser.signin_openid || undefined,
        invite_code: dbUser.invite_code || undefined,
      };
    }

    // OAuth 登录逻辑
    if (!account.type || !account.provider || !account.providerAccountId) {
      throw new Error("invalid signin account");
    }

    const userInfo: UserType = {
      uuid: getUuid(),
      email: user.email,
      nickname: user.name || "",
      avatar_url: user.image || "",
      signin_type: account.type,
      signin_provider: account.provider,
      signin_openid: account.providerAccountId,
      created_at: new Date(),
      signin_ip: await getClientIp(),
    };

    const savedUser = await saveUser(userInfo);

    return savedUser;
  } catch (e) {
    console.error("handle signin user failed:", e);
    throw e;
  }
}
