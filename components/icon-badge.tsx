import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const backgroundVariants = cva(
  "flex items-center justify-center shrink-0",
  {
    variants: {
      variant: {
        default: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
        success: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
        warning: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
        slate: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
      },
      size: {
        default: "p-2.5 rounded-xl",
        sm: "p-2 rounded-lg",
        lg: "p-3 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "text-sky-600",
      success: "text-emerald-600",
      warning: "text-amber-600",
      slate: "text-slate-600",
    },
    size: {
      default: "h-5 w-5",
      sm: "h-4 w-4",
      lg: "h-6 w-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type BackgroundVariantsProps = VariantProps<typeof backgroundVariants>;
type IconVariantsProps = VariantProps<typeof iconVariants>;

interface IconBadgeProps extends BackgroundVariantsProps, IconVariantsProps {
  icon: LucideIcon;
}

export const IconBadge = ({ icon: Icon, variant, size }: IconBadgeProps) => {
  return (
    <div className={cn(backgroundVariants({ variant, size }))}>
      <Icon className={cn(iconVariants({ variant, size }))} />
    </div>
  );
};
