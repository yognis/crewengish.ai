"use client";

import React from "react";
import { Bot, User as UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ChatMessageProps {
  type: "ai" | "user" | "system";
  avatar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * ChatMessage provides consistent alignment, avatar placement, and sizing
 * for each entry in the chat timeline. It supports AI (left-aligned),
 * user (right-aligned), and system (centered) variants.
 */
function ChatMessage({
  type,
  avatar,
  children,
  className,
}: ChatMessageProps) {
  const isSystem = type === "system";
  const isUser = type === "user";

  const containerClassName = cn(
    "flex w-full items-start gap-3",
    !isSystem && "max-w-[85%] sm:max-w-[80%]",
    isUser && "ml-auto flex-row-reverse",
    isSystem && "mx-auto max-w-2xl justify-center",
    className,
  );

  const defaultAvatar =
    type === "ai" ? (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-thy-red-100 text-thy-red-600">
        <Bot className="h-5 w-5" aria-hidden />
        <span className="sr-only">AI avatar</span>
      </div>
    ) : (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <UserIcon className="h-5 w-5" aria-hidden />
        <span className="sr-only">User avatar</span>
      </div>
    );

  return (
    <div className={containerClassName}>
      {!isSystem && (
        <div className={cn("flex shrink-0", isUser && "justify-end")}>
          {avatar ?? defaultAvatar}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default React.memo(ChatMessage);
