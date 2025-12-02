import { Button } from "@/components/ui/button";
import { Github, Apple } from "lucide-react";

interface SocialButtonsProps {
  onGitHubClick: () => void;
  onGoogleClick: () => void;
  onAppleClick: () => void;
  disabled?: boolean;
}

export function SocialButtons({ 
  onGitHubClick, 
  onGoogleClick, 
  onAppleClick, 
  disabled = false 
}: SocialButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      <Button
        type="button"
        variant="outline"
        onClick={onGitHubClick}
        disabled={disabled}
        className="relative w-full h-16 text-xl font-semibold text-foreground hover:bg-gray-900 hover:text-amber-50 disabled:opacity-70 transition-all duration-300 shadow-2xl hover:shadow-blue-600/40 overflow-hidden group rounded-2xl"
      >
        <span className="relative z-10">
          <Github className="h-5 w-5" />
          <span className="sr-only">GitHub</span>
        </span>
        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onGoogleClick}
        disabled={disabled}
        className="relative w-full h-16 text-xl font-semibold text-foreground hover:bg-gray-900 hover:text-amber-50 disabled:opacity-70 transition-all duration-300 shadow-2xl hover:shadow-blue-600/40 overflow-hidden group rounded-2xl"
      >
        <span className="relative z-10">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="sr-only">Google</span>
        </span>
        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onAppleClick}
        disabled={disabled}
        className="relative w-full h-16 text-xl font-semibold text-foreground hover:bg-gray-900 hover:text-amber-50 disabled:opacity-70 transition-all duration-300 shadow-2xl hover:shadow-blue-600/40 overflow-hidden group rounded-2xl"
      >
        <span className="relative z-10">
          <Apple className="h-5 w-5" />
          <span className="sr-only">Apple</span>
        </span>
        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
      </Button>
    </div>
  );
}