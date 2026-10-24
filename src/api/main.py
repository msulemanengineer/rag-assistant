"""FastAPI layer exposing the existing RAG pipeline.

Run from the project root:
    uvicorn src.api.main:app --reload --port 8000
"""
import json
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.api.schemas import (
    ChatRequest,
    ChatResponse,
    DocumentInfo,
    DocumentsResponse,
    ErrorResponse,
    HealthResponse,
)
from src.retrieval.search import INDEX_PATH, METADATA_PATH, PROJECT_ROOT

load_dotenv(PROJECT_ROOT / ".env")

logger = logging.getLogger("rag_api")

DEFAULT_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", DEFAULT_ORIGINS).split(",")
    if origin.strip()
]

app = FastAPI(title="RAG Assistant API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def _index_ready() -> bool:
    return INDEX_PATH.exists() and METADATA_PATH.exists()


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        index_ready=_index_ready(),
        llm_configured=bool(os.getenv("GROQ_API_KEY")),
    )


@app.get("/api/documents", response_model=DocumentsResponse)
def documents() -> DocumentsResponse:
    if not METADATA_PATH.exists():
        return DocumentsResponse(documents=[], total_chunks=0)

    with METADATA_PATH.open("r", encoding="utf-8") as file:
        metadata = json.load(file)

    chunks_per_doc: dict[str, int] = {}
    pages_per_doc: dict[str, set[int]] = {}
    for chunk in metadata.get("chunks", []):
        name = chunk["source"]
        chunks_per_doc[name] = chunks_per_doc.get(name, 0) + 1
        pages_per_doc.setdefault(name, set()).add(chunk["page"])

    return DocumentsResponse(
        documents=[
            DocumentInfo(
                name=name,
                chunk_count=count,
                page_count=len(pages_per_doc[name]),
            )
            for name, count in sorted(chunks_per_doc.items())
        ],
        total_chunks=sum(chunks_per_doc.values()),
        embedding_model=metadata.get("model_name"),
    )


@app.post(
    "/api/chat",
    response_model=ChatResponse,
    responses={
        422: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
def chat(request: ChatRequest) -> ChatResponse:
    # Imported lazily: answer_generator raises at import time when
    # GROQ_API_KEY is missing, which should not take the whole API down.
    try:
        from src.generation.answer_generator import generate_answer
    except RuntimeError as error:
        logger.error("LLM not configured: %s", error)
        raise HTTPException(
            status_code=503,
            detail="The language model is not configured on the server.",
        ) from error

    try:
        result = generate_answer(request.question, top_k=request.top_k)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail="The document index has not been built yet.",
        ) from error
    except Exception as error:
        logger.exception("Answer generation failed")
        raise HTTPException(
            status_code=502,
            detail="The answer could not be generated. Please try again.",
        ) from error

    return ChatResponse(**result)
