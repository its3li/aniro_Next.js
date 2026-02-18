import { cn } from "@/lib/utils";

export function AuroraBackground({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-h-screen w-full bg-background", className)}
      {...props}
    >
      {children}
    </div>
  );
}
