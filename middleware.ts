// middleware.ts (modified for JWT)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  if (isAdminRoute || isApiRoute) { // Protect both /admin and /api
    const token = request.cookies.get("auth")?.value;

    if (!token) {
       if (isAdminRoute){
          return NextResponse.redirect(new URL('/auth/login', request.url));
        } else { // it's an API route
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 }); // Don't redirect API routes
        }
    }


    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string, id: string, iat: number, exp: number }; // Add id

      //Admin routes are checked here
      if (isAdminRoute && decoded.role !== "admin") {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

        // Attach user to request for API routes, if needed.
        const requestHeaders = new Headers(request.headers)

        requestHeaders.set('x-user-id', decoded.id) // Add this
        requestHeaders.set('x-user-role', decoded.role) //Add this

        return NextResponse.next({
          request: {
                // New request headers
                headers: requestHeaders,
            }
        });

    } catch (error) {
      // Handle token verification errors
        if(isAdminRoute){
           console.error("Middleware JWT verification error:", error);
           return NextResponse.redirect(new URL('/auth/login', request.url));
        } else {
          return NextResponse.json({ message: "Invalid token" }, { status: 403 });
        }
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/admin/:path*', '/api/:path*'], // Protect both /admin and /api
};