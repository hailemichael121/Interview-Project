export function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="wave-light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2C3E50" />
            <stop offset="45%" stopColor="#5D768B" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="wave-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        <path
          fill="url(#wave-light)"
          className="dark:hidden"
          fillOpacity="0.9"
          d="M0,450L80,420C160,390,320,330,480,310C640,290,800,310,960,340C1120,370,1280,410,1360,430L1440,450L1440,900L0,900Z"
        />
        <path
          fill="url(#wave-dark)"
          className="hidden dark:block"
          fillOpacity="0.9"
          d="M0,450L80,420C160,390,320,330,480,310C640,290,800,310,960,340C1120,370,1280,410,1360,430L1440,450L1440,900L0,900Z"
        />
      </svg>
    </div>
  );
}