"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "accent" | "sand";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md btn-primary",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm",
      outline:
        "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
      ghost:
        "text-foreground hover:bg-muted",
      destructive:
        "bg-error text-white hover:bg-error/90 shadow-sm",
      accent:
        "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm hover:shadow-md btn-accent font-semibold",
      sand:
        "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm hover:shadow-md btn-accent font-semibold", // Legacy alias for accent
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
