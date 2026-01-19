import { cn } from "@/lib/utils";

export function AuroraBackground({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative isolate min-h-screen w-full bg-background transition-colors duration-300",
        className
      )}
      {...props}
    >
      <div
        className="absolute inset-0 -z-10 size-full overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-[-20%] top-[-10%] size-[500px] rounded-full bg-primary/20 opacity-50 blur-[120px] filter animate-aurora-1"></div>
        <div className="absolute right-[-20%] top-[10%] size-[500px] rounded-full bg-blue-500/10 dark:bg-blue-900/20 opacity-50 blur-[120px] filter animate-aurora-2"></div>
        <div className="absolute bottom-[-10%] right-[10%] size-[500px] rounded-full bg-fuchsia-500/10 dark:bg-fuchsia-900/20 opacity-50 blur-[120px] filter animate-aurora-3"></div>
      </div>
      {children}
    </div>
  );
}
