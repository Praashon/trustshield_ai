import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center w-8 h-8">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
        >
          <path
            d="M16 2L4 8V16C4 23.2 9.12 29.84 16 30C22.88 29.84 28 23.2 28 16V8L16 2Z"
            className="fill-foreground"
          />
          <path
            d="M16 4L6 9V16C6 22.08 10.52 27.84 16 28C21.48 27.84 26 22.08 26 16V9L16 4Z"
            className="fill-background"
          />
          <path
            d="M16 8L9 11.5V16C9 20.48 12 24.84 16 25C20 24.84 23 20.48 23 16V11.5L16 8Z"
            className="fill-amber"
            opacity="0.9"
          />
          <path
            d="M14 16.5L12.5 15L11.5 16L14 18.5L20.5 12L19.5 11L14 16.5Z"
            className="fill-background"
          />
        </svg>
      </div>
      <span className="font-bold text-lg tracking-tight">
        TrustShield<span className="text-[var(--amber)]"> AI</span>
      </span>
    </Link>
  );
}
