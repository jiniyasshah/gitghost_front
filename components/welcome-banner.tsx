"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Coins } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function WelcomeBanner() {
  const { data: session } = useSession();
  const [showBanner, setShowBanner] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userCoins, setUserCoins] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;

    // Check if this is a new user by looking at localStorage
    const hasSeenWelcome = localStorage.getItem(
      `welcome-seen-${session.user.email}`
    );

    const checkUserStatus = async () => {
      try {
        // Fetch user's coins to determine if they're new
        const response = await fetch("/api/user/coins");
        if (response.ok) {
          const data = await response.json();
          setUserCoins(data.coins);

          // If no welcome seen record and we have coins data, show the banner
          if (!hasSeenWelcome) {
            console.log("Showing welcome banner for user:", session.user.email);
            setShowBanner(true);
            setIsNewUser(true);
            // Mark as seen
            localStorage.setItem(`welcome-seen-${session.user.email}`, "true");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    checkUserStatus();
  }, [session?.user?.email]);

  if (!showBanner) return null;

  return (
    <Alert className="mb-6 border border-indigo-500/20 bg-indigo-500/10 text-indigo-100">
      <Coins className="h-5 w-5 text-amber-400" />
      <AlertTitle className="ml-2 text-lg font-semibold">
        Welcome to DevFlow!
      </AlertTitle>
      <AlertDescription className="ml-7">
        {isNewUser ? (
          <div className="mt-2">
            <p className="mb-2">
              You've been awarded{" "}
              <span className="font-bold text-amber-400">10 coins</span> as a
              welcome bonus!
            </p>
            <p className="text-sm text-indigo-200/80">
              Use your coins to access premium features like custom dates and
              contributors.
            </p>
          </div>
        ) : (
          <p className="mt-2">Welcome back to DevFlow!</p>
        )}
        <Button
          variant="outline"
          className="mt-3 border-indigo-500/30 hover:bg-indigo-500/20 hover:text-indigo-100"
          onClick={() => setShowBanner(false)}
        >
          Dismiss
        </Button>
      </AlertDescription>
    </Alert>
  );
}
