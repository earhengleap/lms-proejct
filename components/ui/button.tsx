import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, cx, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import clsx from "clsx";

const neonClasses =
  "w-full px-3.5 py-5 border-2 relative z-20 text-lg hover:transform hover:translate-y-[-2px] transition-transform duration-200";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-emerald-600 text-white hover:bg-emerald-600/80",
        neon: cn(neonClasses, "bg-[#11182B] text-white border-[#11182B]"),
        neonOutline: cn(
          neonClasses,
          "bg-[#0369A1] text-white border-[#0369A5]"
        ),
        neonSuccess: cn(
          neonClasses,
          "bg-green-500 text-white border-green-600"
        ),
        neonDanger: cn(neonClasses, "bg-red-500 text-white border-red-600"),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "rounded-[1px] h-10 px-6 py-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const spanVariants = cva(
  "absolute h-10 bottom-[-6px] w-full left-0 z-10",
  {
    variants: {
      variant: {
        default: "hidden",
        destructive: "hidden",
        outline: "hidden",
        secondary: "hidden",
        ghost: "hidden",
        link: "hidden",
        success: "hidden",
        neon: "bg-[#030406]",
        neonOutline: "bg-[#02507B]",
        neonSuccess: "border-green-500 bg-green-600",
        neonDanger: "border-red-500 bg-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const containerClasses = clsx({
      relative: variant === "neon" || "neonOutline" || "neonDanger" || "neonSuccess",
    });

    const borderRound = clsx({
      "rounded-[5px]": variant === "neon" || "neonOutline" || "neonDanger" || "neonSuccess",
    });
    return (
      <div className={containerClasses}>
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
        <span className={cx(spanVariants({ variant }), borderRound)}></span>
      </div>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
