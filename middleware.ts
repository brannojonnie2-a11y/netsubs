import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pages that are always accessible without solving CAPTCHA
const PUBLIC_PATHS = ['/admin', '/api'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths and API routes
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For captcha page and allowed paths, let them through
  if (pathname === '/') {
    return NextResponse.next();
  }

  // For other protected paths, check if captcha was solved
  const captchaSolved = request.cookies.get('nf_captcha_solved')?.value === '1';
  
  if (!captchaSolved) {
    // Redirect to captcha page
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
