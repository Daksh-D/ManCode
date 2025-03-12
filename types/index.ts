// File: types/index.ts
import { Document } from 'mongoose'; // Import Document

export interface Product extends Document { // Extend Document
  id: string; // Keep this for frontend convenience (virtual field)
  _id: string; // Add _id: string;  This is the MongoDB ID.
  name: string;
  description?: string; // String can be undefined
  price: number;
  images: string[];
  category: string;
  rating?: number;  // rating can be undefined
  reviews?: Review[]; //reviews can be undefined
  sizes?: string[];  //sizes can be undefined
  colors?: string[]; // colors can be undefined
  inStock?: boolean;  // instock can be undefined
  createdAt?: string; // createdAt can be undefined
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}
//Extend the other interfaces in the same way.
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User extends Document {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  address?: Address;
}


export interface Order extends Document{
  _id: string;
  userId: string; // Link to User
  items: {
    productId: string; // Link to Product (using string for frontend convenience)
    name: string;
    quantity: number;
    price: number;
    image: string; // Keep image URL for display
    size?: string; // Optional size
    color?: string; // Optional color
  }[];
  total: number;
  shippingAddress: {  // Basic address (expand as needed)
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}