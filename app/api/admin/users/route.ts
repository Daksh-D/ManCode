// File: app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { connectDB, User} from '@/lib/db';
import { headers } from 'next/headers';

connectDB();

export async function GET(request: Request) {
  try {
     const headersList = headers();
    const userRole = headersList.get("x-user-role");
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, {status: 403});
    }

    const users = await User.find().select("-passwordHash"); //Don't send password
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}