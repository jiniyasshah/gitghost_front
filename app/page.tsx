import Link from "next/link";
import { Github, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      {/* Hero Section */}
      <header className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-900/10 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl z-0"></div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight gradient-text neon-text">
              Repository Transfer Tool
            </h1>
            <p className="text-xl text-indigo-200/80">
              Easily transfer your GitHub repositories while preserving commit
              history and contributors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/api/auth/signin" className="glass-button group">
                <span className="button-glow"></span>
                <div className="flex items-center justify-center">
                  <Github className="mr-2 h-5 w-5 text-indigo-200" />
                  <span className="text-indigo-50">Sign in with GitHub</span>
                  <Sparkles className="ml-2 h-4 w-4 text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-950/10 z-0"></div>
        <div className="container relative z-10 mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Connect",
                description: "Sign in with your GitHub account to get started.",
              },
              {
                title: "Configure",
                description:
                  "Specify source and destination repositories for transfer.",
              },
              {
                title: "Transfer",
                description:
                  "We'll handle the transfer process while preserving history.",
              },
            ].map((feature, index) => (
              <div key={index} className="glass-card p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3 gradient-text">
                  {feature.title}
                </h3>
                <p className="text-indigo-200/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-indigo-500/10 backdrop-blur-sm bg-background/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold gradient-text">DevFlow</h2>
              <p className="text-indigo-200/70">Repository Transfer Tool</p>
            </div>
            <div className="flex gap-6 text-indigo-300/80">
              <Link
                href="#"
                className="hover:text-indigo-400 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="hover:text-indigo-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-indigo-400 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-indigo-500/10 mt-8 pt-8 text-center text-indigo-200/50">
            <p>
              &copy; {new Date().getFullYear()} DevFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
