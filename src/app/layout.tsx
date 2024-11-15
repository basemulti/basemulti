import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/sonner";
import "@uploadthing/react/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {NextIntlClientProvider} from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

dayjs.extend(utc);
dayjs.extend(timezone);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Basemulti",
  description: "Basic dashboard with Next.js and Shadcn",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers session={null}>
            <Toaster richColors />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
