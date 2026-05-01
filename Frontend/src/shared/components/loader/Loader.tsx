"use client";

interface LoaderProps {
  message: string;
  description: string;
}

const CnasLoader = ({ message, description }: LoaderProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div
        className="flex flex-col items-center gap-6 px-12 py-10
                 bg-white/80 dark:bg-zinc-900/80
                 backdrop-blur-xl
                 rounded-2xl shadow-2xl border border-white/30"
      >
        {/* Logo container */}
        <div className="relative flex items-center justify-center">
          {/* Soft glow ring */}
          <div className="absolute h-15 w-15 rounded-full bg-blueCnas/20 animate-ping" />

          {/* Logo */}
          <img src="/logo_cnas.png" alt="Company Logo" className="relative z-10 w-20 h-20 object-contain animate-pulse" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-xl font-semibold tracking-tight">{message}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="w-64 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full w-4/3 bg-gradient-to-r
                     from-orangeCnas  to-blueCnas
                     animate-[loader-slide_1s_ease-in-out_infinite]"
          />
        </div>
      </div>
    </div>
  );
};

export default CnasLoader;
