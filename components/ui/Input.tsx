import React from "react";
import { TextInput, type TextInputProps, View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  className,
  containerClassName,
  label,
  error,
  ...props
}: InputProps) {
  return (
    <View className={cn("w-full", containerClassName)}>
      {label && (
        <Text className="text-sm font-sans text-muted-foreground mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          "w-full h-12 px-4 rounded-xl bg-input border-2 border-border text-foreground font-sans",
          "focus:border-ring",
          error && "border-destructive",
          className
        )}
        placeholderTextColor="#a1a1aa"
        {...props}
      />
      {error && (
        <Text className="text-sm font-sans text-destructive mt-1">{error}</Text>
      )}
    </View>
  );
}
