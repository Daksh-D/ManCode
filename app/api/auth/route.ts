// File: app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from "zod";


connectDB();

const UserSchemaValidator = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export async function POST(request: Request) {
    const data =  await request.json();
    if (request.url.includes("register")) {
        return await register(data);

    } else if(request.url.includes("login")){
        return await login(data);
    }

}

//logout
export async function GET(request: Request) {
    try {
        const response = NextResponse.json(
            {
              message: "Logout successful",
              success: true,
            },
            { status: 200 }
        );

        // Set the cookie with an empty value and expiration in the past.
        response.cookies.set("auth", "", {
          httpOnly: true,
          path: "/",
          expires: new Date(0), // Expire immediately
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}
//login
async function login(data: any){
    try {
        const { email, password } = data;
        if (!email || !password)
          return NextResponse.json({ message: "Missing required fields" }, {status: 400});

        const user = await User.findOne({ email });
        if (!user) return NextResponse.json({ message: "User not found" }, {status: 400});

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return NextResponse.json({ message: "Invalid credentials" }, {status: 400});

        // Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
          expiresIn: "1h", // Set a reasonable expiration time
        });

        // Set the JWT in an HttpOnly cookie
        const response = NextResponse.json({
            user: { id: user._id, email: user.email, name: user.name, role: user.role, address: user.address },
          }, {status: 200});

          response.cookies.set("auth", token, {
            httpOnly: true, // Important: Makes the cookie inaccessible to client-side JavaScript
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production (HTTPS)
            sameSite: "strict", // Protect against CSRF attacks
            path: "/", // Make the cookie available to the entire site
            maxAge: 60 * 60 * 1, // 1 hour expiration (match JWT expiration)
          });

        return response;
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, {status: 500});
      }
}


//register
async function register(data: any){
    try {
        const validatedData = UserSchemaValidator.parse(data); // Validate
        const { email, password, name } = validatedData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return NextResponse.json({ message: "User already exists" }, {status: 400});
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({
          email,
          name,
          passwordHash,
          role: "user",
        });
        await newUser.save();

        // Auto-login after registration.
        return await login(data);

      } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ message: error.message }, {status: 500});
      }
}