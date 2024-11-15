import { getRequestConfig } from 'next-intl/server';
import { getLocale } from '@/actions/locale';
 
export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const locale = await getLocale();
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});