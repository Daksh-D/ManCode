//File: hooks/use-auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import Cookies from "js-cookie"; // Import js-cookie


interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>; // Add a fetchUser function
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const res = await fetch("/api/auth", { // fetches to login
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Login failed");
        }
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true });
        return { user: data.user };
      },
      register: async (email, password, name) => {
        const res = await fetch("/api/auth", { // fetches to register
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Registration failed");
        }
        // Log in the user after successful registration
        await get().login(email, password); //login after register
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
          // Clear the cookie using js-cookie
        Cookies.remove("auth",{path:"/"});
          // Call the /api/logout endpoint to clear the cookie on the server
        fetch("/api/auth",{method: "GET"}); // Send a request to clear the cookie
      },
      fetchUser: async () => { // New function to fetch user data
        try{
            const res = await fetch("/api/user"); // New endpoint, see below
            if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true });
            } else {
            // If the request is not ok (e.g., 401), the user is not logged in.
            set({ user: null, isAuthenticated: false });
            }
        } catch(error){
            console.error("Error in fetchUser:", error);
             set({ user: null, isAuthenticated: false });
        }

      },
    }),
    { name: "auth-storage" }
  )
);