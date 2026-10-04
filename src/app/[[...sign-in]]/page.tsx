"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2"
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="" width={24} height={24} />
            SchooL
          </h1>
          <h2 className="text-gray-400">Sign in to your account</h2>
          <Clerk.GlobalError className="text-sm text-red-400" />
          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">
              Username
            </Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">
              Password
            </Clerk.Label>
            <Clerk.Input
              type="password"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <SignIn.Action
            submit
            className="bg-blue-500 text-white my-1 rounded-md text-sm p-[10px]"
          >
            Sign In
          </SignIn.Action>
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-gray-600">
            <p className="font-semibold text-yellow-700 mb-2">🔑 Demo Credentials (all use same password)</p>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-yellow-700 border-b border-yellow-200">
                  <th className="text-left pb-1 font-semibold">Role</th>
                  <th className="text-left pb-1 font-semibold">Username</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                <tr><td className="py-0.5 pr-2 text-gray-500">Admin</td><td className="font-mono font-medium">admin</td></tr>
                <tr><td className="py-0.5 pr-2 text-gray-500">Teacher</td><td className="font-mono font-medium">teacher1</td></tr>
                <tr><td className="py-0.5 pr-2 text-gray-500">Student</td><td className="font-mono font-medium">student10</td></tr>
                <tr><td className="py-0.5 pr-2 text-gray-500">Parent</td><td className="font-mono font-medium">parentId1</td></tr>
              </tbody>
            </table>
            <p className="mt-2 text-gray-500">Password: <span className="font-mono font-medium text-gray-700">Password123!</span></p>
          </div>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;