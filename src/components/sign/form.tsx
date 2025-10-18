"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiGithub, SiGoogle } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations();
  const router = useRouter();

  // 邮箱密码登录状态
  const [emailLogin, setEmailLogin] = useState({
    email: '',
    password: '',
    loading: false,
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {t("sign_modal.sign_in_title")}
          </CardTitle>
          <CardDescription>
            {t("sign_modal.sign_in_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              {process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("google", { callbackUrl: window.location.href })}
                >
                  <SiGoogle className="w-4 h-4" />
                  {t("sign_modal.google_sign_in")}
                </Button>
              )}
              {process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("github", { callbackUrl: window.location.href })}
                >
                  <SiGithub className="w-4 h-4" />
                  {t("sign_modal.github_sign_in")}
                </Button>
              )}
            </div>

            {/* 邮箱密码登录 */}
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                {t("sign_modal.email_login_divider")}
              </span>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEmailLogin({ ...emailLogin, loading: true });

                const result = await signIn('credentials', {
                  email: emailLogin.email,
                  password: emailLogin.password,
                  redirect: false,
                });

                if (result?.error) {
                  toast.error(t("sign_modal.login_failed"));
                  setEmailLogin({ ...emailLogin, loading: false });
                } else {
                  toast.success(t("sign_modal.login_success"));
                  // 刷新当前页面，保持在原位置
                  window.location.reload();
                }
              }}
              className="grid gap-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="email">{t("sign_modal.email_title")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("sign_modal.email_placeholder")}
                  value={emailLogin.email}
                  onChange={(e) => setEmailLogin({ ...emailLogin, email: e.target.value })}
                  required
                  disabled={emailLogin.loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t("sign_modal.password_title")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("sign_modal.password_placeholder")}
                  value={emailLogin.password}
                  onChange={(e) => setEmailLogin({ ...emailLogin, password: e.target.value })}
                  required
                  disabled={emailLogin.loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={emailLogin.loading}>
                {emailLogin.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("sign_modal.logging_in")}
                  </>
                ) : (
                  t("sign_modal.login_button")
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              {t("sign_modal.no_account")}{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                {t("sign_modal.register_link")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        {t("sign_modal.terms_agreement")}{" "}
        <a href="/terms-of-service" target="_blank">
          {t("sign_modal.terms_of_service")}
        </a>{" "}
        {t("sign_modal.and")}{" "}
        <a href="/privacy-policy" target="_blank">
          {t("sign_modal.privacy_policy")}
        </a>
        .
      </div>
    </div>
  );
}
