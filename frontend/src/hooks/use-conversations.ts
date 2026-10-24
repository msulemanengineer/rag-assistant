"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ApiError, sendChat } from "@/lib/api";
import type { AssistantMessage, ChatMessage, Conversation } from "@/types/chat";

// Deterministic ids: random/time APIs are not allowed while prerendering.
let idCounter = 0;
const uid = () => `id-${++idCounter}`;

const newConversation = (): Conversation => ({
  id: uid(),
  title: "New chat",
  messages: [],
});

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/**
 * In-memory conversations. Nothing is persisted: a page reload clears them.
 * Responses are written to the conversation they were asked in, so switching
 * chats while a request is running is safe.
 */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    newConversation(),
  ]);
  const [activeId, setActiveId] = useState(() => conversations[0].id);
  // Synchronous guard against double submits (state updates are async).
  const inFlight = useRef(new Set<string>());

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const isPending = active.messages.some(
    (m) => m.role === "assistant" && m.status === "pending",
  );

  const patchConversation = useCallback(
    (id: string, update: (c: Conversation) => Conversation) =>
      setConversations((all) => all.map((c) => (c.id === id ? update(c) : c))),
    [],
  );

  const patchAssistant = useCallback(
    (convId: string, msgId: string, patch: Partial<AssistantMessage>) =>
      patchConversation(convId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === msgId && m.role === "assistant" ? { ...m, ...patch } : m,
        ),
      })),
    [patchConversation],
  );

  const ask = useCallback(
    async (convId: string, question: string, assistantId: string) => {
      inFlight.current.add(convId);
      try {
        const res = await sendChat({ question });
        patchAssistant(convId, assistantId, {
          status: "done",
          content: res.answer,
          sources: res.sources,
          model: res.model,
        });
      } catch (err) {
        const error =
          err instanceof ApiError
            ? { message: err.message, retryable: err.retryable }
            : { message: "Something went wrong.", retryable: true };
        patchAssistant(convId, assistantId, { status: "error", error });
      } finally {
        inFlight.current.delete(convId);
      }
    },
    [patchAssistant],
  );

  const send = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question || inFlight.current.has(activeId)) return;

      const assistantId = uid();
      const messages: ChatMessage[] = [
        { id: uid(), role: "user", content: question },
        {
          id: assistantId,
          role: "assistant",
          status: "pending",
          question,
          content: "",
          sources: [],
          model: null,
        },
      ];
      patchConversation(activeId, (c) => ({
        ...c,
        title: c.messages.length === 0 ? truncate(question, 40) : c.title,
        messages: [...c.messages, ...messages],
      }));
      void ask(activeId, question, assistantId);
    },
    [activeId, ask, patchConversation],
  );

  const retry = useCallback(
    (messageId: string) => {
      if (inFlight.current.has(activeId)) return;
      const msg = active.messages.find((m) => m.id === messageId);
      if (!msg || msg.role !== "assistant") return;
      patchAssistant(activeId, messageId, { status: "pending", error: undefined });
      void ask(activeId, msg.question, messageId);
    },
    [active, activeId, ask, patchAssistant],
  );

  const startNew = useCallback(() => {
    if (active.messages.length === 0) return;
    const fresh = newConversation();
    setConversations((all) => [fresh, ...all.filter((c) => c.messages.length > 0)]);
    setActiveId(fresh.id);
  }, [active]);

  const recent = useMemo(
    () => conversations.filter((c) => c.messages.length > 0),
    [conversations],
  );

  return { active, recent, isPending, send, retry, startNew, select: setActiveId };
}
