"use client";

import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Bot, User, Loader2 } from "lucide-react";
import Markdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isLoading = false }: ChatMessageProps) => {
  const isAssistant = message.role === "assistant";
  const assistantAvatar = PlaceHolderImages.find(img => img.id === 'assistant-avatar');

  return (
    <div className={cn("flex items-start gap-4", isAssistant ? "" : "justify-end")}>
      {isAssistant && (
        <Avatar className="h-9 w-9 border">
          {assistantAvatar && <AvatarImage src={assistantAvatar.imageUrl} alt="Assistant" />}
          <AvatarFallback>
            <Bot />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-3 text-sm shadow-md",
          isAssistant
            ? "bg-card text-card-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-current prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0">
             <Markdown>{message.content}</Markdown>
          </div>
        )}
      </div>
      {!isAssistant && (
        <Avatar className="h-9 w-9 border">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
