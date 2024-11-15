"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import GoogleSignInButton from "../github-auth-button";
import { toast } from "sonner";
import { login, signUp } from "@/actions/auth";
import ButtonLoading from "@/components/button-loading";
import { useTranslations } from "next-intl";

const formSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm({ action = 'login' }: {
  action?: 'login' | 'signup'
}) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [loading, setLoading] = useState(false);
  const defaultValues = {
  };
  const t = useTranslations('Auth');
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = form.getValues();
    setLoading(true);

    if (action === 'signup') {
      await signUp(
        data.email,
        data.password,
      ).then(result => {
        if (result.error) {
          throw new Error(result.error);
        }
  
        toast.success('Sign up successful!');
        form.reset({
          email: '',
          password: '',
        });
      }).catch(error => {
        toast.error(error.message);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      await login({
        email: data.email,
        password: data.password,
        callbackUrl: callbackUrl ?? "/workspaces",
      }).then(result => {
        if (result?.error) {
          throw new Error(result.error);
        }
      }).catch(error => {
        setLoading(false);
        toast.error(error.message);
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="space-y-2 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('email_placeholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('password_placeholder')}
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className="ml-auto w-full gap-2" type="submit">
            <ButtonLoading loading={loading} />
            {t(action === 'login' ? 'login' : 'signup')}
          </Button>
        </form>
      </Form>
      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <GoogleSignInButton /> */}
    </>
  );
}