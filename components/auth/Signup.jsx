'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";
import client from "@/api/client";
import { createProfileIfNotExists } from "@/lib/createProfile";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    const email = e.target[0]?.value;
    const password = e.target[1]?.value;

    if (!email || !password) {
      toast.error("Please enter required fields");
      return;
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error("Signup failed, please try again.");
      return;
    }

    const { data: sessionData } = await client.auth.getSession();

    if (sessionData.session?.user) {
      await createProfileIfNotExists(sessionData.session.user);
    }

    toast.success("Signup successful!");
    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Sign Up</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSignup}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>

          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Signup;
