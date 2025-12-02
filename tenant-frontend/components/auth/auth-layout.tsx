import { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { AnimatedTitle } from "@/components/animated-title";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GradientBackground } from "./gradient-background";

interface AuthLayoutProps {
  children: ReactNode;
  branding: {
    title: string;
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  formTitle: string;
  formDescription: string;
  transitionClass?: string;
}

export function AuthLayout({
  children,
  branding,
  formTitle,
  formDescription,
  transitionClass = ""
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <GradientBackground />
      
      <div className={`relative z-10 flex min-h-screen ${transitionClass}`}>
        {/* Left: Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-12">
          <div className="text-center max-w-md">
            <Logo className="w-32 h-32 mx-auto mb-8" />
            <AnimatedTitle text={branding.title} size="md" />
            <h2 className="mt-8 text-5xl font-bold text-white drop-shadow-lg">
              {branding.heading}
            </h2>
            <p className="mt-6 text-xl text-white/90 drop-shadow">
              {branding.description}
            </p>
            <Link href={branding.buttonLink}>
              <Button
                size="lg"
                variant="secondary"
                className="mt-12 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 hover:text-gray-900"
              >
                {branding.buttonText} <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-md animate-in slide-in-from-right-32 duration-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}