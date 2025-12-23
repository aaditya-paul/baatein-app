import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
} from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-xl active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border-2 border-border bg-transparent",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4",
        lg: "h-14 px-8",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("font-sans font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ButtonProps
  extends Omit<PressableProps, "children">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  loading?: boolean;
  textClassName?: string;
}

export function Button({
  className,
  textClassName,
  variant,
  size,
  children,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size }),
        disabled && "opacity-50",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "default" ? "#09090b" : "#f4f4f5"}
          size="small"
        />
      ) : typeof children === "string" ? (
        <Text
          className={cn(buttonTextVariants({ variant, size }), textClassName)}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
