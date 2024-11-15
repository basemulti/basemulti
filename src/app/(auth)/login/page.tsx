import { Metadata } from "next";
import Link from "next/link";
import UserAuthForm from "@/components/blocks/forms/user-auth-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser, getSession } from "@/lib/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import LocaleSelector from "@/components/account-settings/locale-selector";
import { GlobeIcon, LanguagesIcon } from "lucide-react";
import ThemeSelector from "@/components/account-settings/theme-selector";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default async function AuthenticationPage() {
  const t = await getTranslations('Auth');
  const user = await getCurrentUser();

  if (user) {
    redirect('/workspaces');
  }

  // if (session.id) {
  //   const user = await User.query().find(session.id);
  //   if (user) {
  //     redirect('/workspaces');
  //   }
  // }

  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/examples/authentication"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 hidden top-4 md:right-8 md:top-8",
        )}
      >
        {t('login')}
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900 bg-[url('https://images.unsplash.com/photo-1484589065579-248aad0d8b13?q=80&w=3648&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img className="size-6 rounded-md mr-2" src="/logo.svg" />
          Basemulti
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than ever
              before.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center relative">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('signup')}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <UserAuthForm />
            </TabsContent>
            <TabsContent value="signup">
              <UserAuthForm action="signup" />
            </TabsContent>
          </Tabs>
          <p className="text-center text-sm text-muted-foreground">
            {t.rich('agree', {
              terms: (content) => <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                {content}
              </Link>,
              privacy: (content) => <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                {content}
              </Link>
            })}
          </p>
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <ThemeSelector type="icon" />
          <LocaleSelector type="icon" align="end" />
        </div>
      </div>
    </div>
  );
}
