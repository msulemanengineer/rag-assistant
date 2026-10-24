from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)


class Source(BaseModel):
    label: str
    document: str
    page: int
    similarity: float
    text: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    model: str | None = None


class HealthResponse(BaseModel):
    status: str
    index_ready: bool
    llm_configured: bool


class DocumentInfo(BaseModel):
    name: str
    chunk_count: int
    page_count: int


class DocumentsResponse(BaseModel):
    documents: list[DocumentInfo]
    total_chunks: int
    embedding_model: str | None = None


class ErrorResponse(BaseModel):
    detail: str
