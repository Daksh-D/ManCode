// File: app/api/admin/users/[id]/route.ts

import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db'; // Adjust path
import mongoose from 'mongoose';
import { headers } from 'next/headers';

connectDB();

export async function DELETE(request: Request, { params }: { params: { id: string } }){
    //add authentication if necessary
    try {
    const headersList = headers();
    const userRole = headersList.get("x-user-role");

    if (userRole !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, {status: 403});
    }

    const { id } = params;
    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ message: "Invalid User ID" }, {status: 400});
    }
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
        return NextResponse.json({ message: "User not found" }, {status: 404});
    }
    return NextResponse.json({ message: "User deleted successfully" });
    } catch (error: any) {
    console.error("Error deleting User:", error);
        return NextResponse.json({ message: error.message }, {status: 500});
    }
}