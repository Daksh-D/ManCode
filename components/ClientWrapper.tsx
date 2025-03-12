//File: /components/ClientWrapper.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth"; // Import useAuth

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const { fetchUser } = useAuth(); // Get fetchUser

  useEffect(() => {
    setIsMounted(true);
    fetchUser(); // Fetch user data on mount
  }, [fetchUser]); // Add fetchUser as a dependency

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}