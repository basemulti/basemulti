// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { User } from './database';
 
// 1. Specify protected and public routes
const protectedRoutes = ['/workspaces', '/bases', '/invite']
const publicRoutes = ['/login', '/signup', '/share', '/']

function getIsProtectedRoute(path: string) {
  let isProtectedRoute = false;
  for (let route of protectedRoutes) {
    if (path.startsWith(route)) {
      isProtectedRoute = true;
    }
  }
  return isProtectedRoute;
}

function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const queryString = url.split('?')[1];
  if (!queryString) return params;

  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  return params;
}
 
export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = getIsProtectedRoute(path);
  const isPublicRoute = publicRoutes.includes(path);
  const fullPath = req.nextUrl.pathname + req.nextUrl.search;
 
  // 3. Decrypt the session from the cookie
  // const cookie = cookies().get('session')?.value
  // const session = await decrypt(cookie)
  const session = await getSession();

  // await sleep(1000);
  if (path === '/') {
    if (session?.id) {
      return NextResponse.redirect(new URL('/workspaces', req.nextUrl));
    } else {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
  }
 
  // 5. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(fullPath)}`, req.nextUrl))
  }

  // if (isProtectedRoute && session?.id) {
  //   const user = await User.query().find(session.id);
  //   if (!user) {
  //     return NextResponse.redirect(new URL('/login', req.nextUrl));
  //   }
  // }
 
  // 6. Redirect to /dashboard if the user is authenticated
  // if (
  //   isPublicRoute &&
  //   session?.id &&
  //   !req.nextUrl.pathname.startsWith('/workspaces')
  // ) {
  //   const params = parseUrlParams(fullPath);

  //   if (params.callbackUrl) {
  //     return NextResponse.redirect(new URL(params.callbackUrl, req.nextUrl));
  //   }
  //   return NextResponse.redirect(new URL('/workspaces', req.nextUrl))
  // }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
