import { API_BASE_URL } from "@/lib/config";
import type {
  ChatRequest,
  ChatResponse,
  DocumentsResponse,
  HealthResponse,
} from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    /** Whether trying the same request again could plausibly succeed. */
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** FastAPI returns `detail` as a string, or a list for validation errors. */
function extractDetail(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("detail" in body)) return null;
  const { detail } = body as { detail: unknown };
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return "Please check your question and try again.";
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      "Can't reach the server. Check that the backend is running.",
      null,
      true,
    );
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new ApiError(
      extractDetail(body) ?? `Request failed (${response.status}).`,
      response.status,
      response.status >= 500,
    );
  }
  return (await response.json()) as T;
}

export const getHealth = () => request<HealthResponse>("/api/health");

export const getDocuments = () => request<DocumentsResponse>("/api/documents");

export const sendChat = (payload: ChatRequest, signal?: AbortSignal) =>
  request<ChatResponse>("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
