// app/api/user/route.ts (CORRECTED)

import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db'; // Adjust path if needed
import { headers } from 'next/headers';


connectDB();
export const dynamic = 'force-dynamic';

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