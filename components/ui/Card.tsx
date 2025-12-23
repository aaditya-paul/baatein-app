import React from "react";
import { View, Text, Pressable, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <Pressable
      className={cn(
        "bg-card border border-border rounded-2xl p-4 active:opacity-90",
        className
      )}
      {...props}
    >
      {children}
    </Pressable>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <View className={cn("mb-2", className)}>{children}</View>;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <Text
      className={cn(
        "text-lg font-heading font-semibold text-card-foreground",
        className
      )}
    >
      {children}
    </Text>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
  numberOfLines?: number;
}

export function CardDescription({
  children,
  className,
  numberOfLines = 2,
}: CardDescriptionProps) {
  return (
    <Text
      className={cn("text-sm font-sans text-muted-foreground", className)}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <View className={cn("", className)}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <View className={cn("flex-row items-center mt-4", className)}>
      {children}
    </View>
  );
}
