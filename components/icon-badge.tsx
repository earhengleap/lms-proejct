import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const backgroundVariants = cva(
    "rounded-full flex items-center justify-center",
    {
        variants: {
            variant: {
                default: "bg-sky-100",
                sucess: "bg-emerald-100",
            },
            iconVariant: {
                default: "text-sky-700",
                success: "text-emerald-700",
            },
            size: {
                variant: "default",
                size: "deafult",
            }
        }, 
    }
)

const iconVariants = cva(
    "",
    {
        variants: {
            varaint: {
                default: "text-sky-700",
                success: "text-emerald-700",
            },
            size: {
                default: "h-8 w-8",
                sm: 'h-4 w-4'
            },
            defaultVariants: {
                varaint: "default",
                size: "default",
            }
        }
    }
)

type BackgroundVariantsProps = VariantProps<typeof backgroundVariants>;
type IconVariantsProps = VariantProps<typeof iconVariants>;