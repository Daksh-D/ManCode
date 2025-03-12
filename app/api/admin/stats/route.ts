// File: app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { connectDB, User, Product, Order } from '@/lib/db';
import { headers } from 'next/headers';

connectDB();

export async function GET(request: Request) {
  try {
     const headersList = headers();
    const userRole = headersList.get("x-user-role");
    if (userRole !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, {status: 403});
    }
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);

    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedRevenueData = monthlyRevenue.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      revenue: item.revenue,
    }));

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
      revenueData: formattedRevenueData,
    });

  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}