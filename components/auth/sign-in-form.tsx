"use client";

import { signIn } from "next-auth/react";
import { Github, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SignInFormProps {
  providers: Record<string, any> | null;
}

export function SignInForm({ providers }: SignInFormProps) {
  const handleSignIn = async () => {
    // Add a console log to verify the sign-in flow is triggered
    console.log("Initiating GitHub sign-in");
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <Card className="glass-card w-full max-w-md backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-2xl font-bold gradient-text">
          Welcome to DevFlow
        </CardTitle>
        <CardDescription className="text-indigo-200/70">
          Sign in with your GitHub account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {providers?.github && (
          <button onClick={handleSignIn} className="glass-button w-full group">
            <span className="button-glow"></span>
            <div className="flex items-center justify-center">
              <Github className="mr-2 h-5 w-5 text-indigo-200" />
              <span className="text-indigo-50">Sign in with GitHub</span>
              <Sparkles className="ml-2 h-4 w-4 text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-center text-sm text-indigo-200/50 pt-2 pb-6">
        <p>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
