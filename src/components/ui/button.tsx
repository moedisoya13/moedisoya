import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
      secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80",
      destructive: "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90",
      outline: "border border-[var(--border)] bg-transparent hover:bg-[var(--accent)]",
      ghost: "hover:bg-[var(--accent)]",
    };

    const sizes = {
      default: "h-11 px-4 py-2 text-sm",
      sm: "h-9 px-3 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-11 w-11",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
