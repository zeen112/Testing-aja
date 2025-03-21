
import { cva } from "class-variance-authority";
import { Button as ShadcnButton, buttonVariants } from "./button";
import { cn } from "@/lib/utils";
import React from "react";
import { ButtonProps as ShadcnButtonProps } from "./button";

const extendedButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        warning: "bg-amber-500 text-amber-50 shadow hover:bg-amber-600/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
  }
);

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "warning";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // If the variant is "warning", use our extended styles
    if (variant === "warning") {
      return (
        <button
          className={cn(extendedButtonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }
    
    // Otherwise use the standard ShadcnButton
    return (
      <ShadcnButton 
        className={className}
        variant={variant} 
        size={size} 
        asChild={asChild}
        ref={ref}
        {...props}
      />
    );
  }
);

CustomButton.displayName = "CustomButton";
