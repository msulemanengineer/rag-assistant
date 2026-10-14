
import json
from pathlib import Path

from src.ingestion.pdf_loader import extract_pages, chunk_pages


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = PROJECT_ROOT / "data" / "raw" / "university_handbook.pdf"
OUTPUT_PATH = PROJECT_ROOT / "data" / "processed" / "chunks.json"


def main():
    pages = extract_pages(PDF_PATH)
    chunks = chunk_pages(pages)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(chunks, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Pages extracted: {len(pages)}")
    print(f"Chunks created: {len(chunks)}")
    print(f"Saved to: {OUTPUT_PATH}")

    if chunks:
        print("\nFirst chunk:")
        print(json.dumps(chunks[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
