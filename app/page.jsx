'use client';

import { useRouter } from "next/navigation";
import useAuth from "../hooks/useAuth";
import Auth from "../components/auth/Auth";
import HomeScreen from "../components/auth/HomeScreen";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() =>{ 
    if(!loading && user){
      router.push("/");
    }
  },[user, loading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {loading ? <h1>Loading...</h1> : <HomeScreen/>}
    </div>
  );
}
