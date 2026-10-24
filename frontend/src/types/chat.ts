import type { Source } from "@/types/api";

export interface UserMessage {
  id: string;
  role: "user";
  content: string;
}

export interface AssistantMessage {
  id: string;
  role: "assistant";
  status: "pending" | "done" | "error";
  /** The question this message answers; used for retry. */
  question: string;
  content: string;
  sources: Source[];
  model: string | null;
  error?: { message: string; retryable: boolean };
}

export type ChatMessage = UserMessage | AssistantMessage;

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}
