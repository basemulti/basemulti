'use server';

import {cookies} from 'next/headers';
import {Locale, defaultLocale} from '@/i18n/config';
import { appString } from '@/lib/utils';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = appString('locale');

export async function getLocale() {
  return cookies().get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setLocale(locale: Locale) {
  cookies().set(COOKIE_NAME, locale);
}