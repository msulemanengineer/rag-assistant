
from pathlib import Path

import pymupdf


def extract_pages(pdf_path: str | Path) -> list[dict]:
    """Extract text from a PDF while preserving page numbers."""
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    pages = []

    with pymupdf.open(pdf_path) as document:
        for page_number, page in enumerate(document, start=1):
            text = page.get_text("text").strip()

            if text:
                pages.append(
                    {
                        "source": pdf_path.name,
                        "page": page_number,
                        "text": text,
                    }
                )

    if not pages:
        raise ValueError(
            "No extractable text found. The PDF may be scanned "
            "and require OCR."
        )

    return pages


def chunk_pages(
    pages: list[dict],
    chunk_size: int = 1000,
    overlap: int = 150,
) -> list[dict]:
    """Split each page into overlapping character-based chunks."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive.")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size.")

    chunks = []

    for page in pages:
        text = page["text"]
        start = 0

        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append(
                    {
                        "source": page["source"],
                        "page": page["page"],
                        "chunk_id": len(chunks),
                        "text": chunk_text,
                    }
                )

            if end == len(text):
                break

            start = end - overlap

    return chunks
