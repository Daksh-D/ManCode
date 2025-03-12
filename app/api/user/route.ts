//File: /app/api/user/route.ts

import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db'; // Adjust path if needed
import { headers } from 'next/headers';


connectDB();

export async function GET(request: Request) {
    try {
      const headersList = headers();
      const userId = headersList.get('x-user-id');

      if (!userId) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
      }

      const user = await User.findById(userId).select('-passwordHash'); // Exclude passwordHash

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ user }); // Return user data
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {

    try {
        const headersList = headers();
        const userId = headersList.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
          }
      const { street, city, state, zip, country } = await request.json();
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { address: { street, city, state, zip, country } },
        { new: true, runValidators: true }
      );
      if (!updatedUser) {
        return NextResponse.json({ message: "User not found" } , {status: 404});
      }
      return NextResponse.json(updatedUser);
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, {status: 500});
    }
  }