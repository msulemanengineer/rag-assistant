
import json
from pathlib import Path

import faiss
from sentence_transformers import SentenceTransformer


PROJECT_ROOT = Path(__file__).resolve().parents[2]
INDEX_PATH = PROJECT_ROOT / "data" / "processed" / "document_index.faiss"
METADATA_PATH = PROJECT_ROOT / "data" / "processed" / "embedding_metadata.json"

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def search_documents(query: str, top_k: int = 5) -> list[dict]:
    if not query.strip():
        raise ValueError("Query cannot be empty.")

    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    if not INDEX_PATH.exists() or not METADATA_PATH.exists():
        raise FileNotFoundError(
            "Index or metadata missing. Build the embeddings and FAISS index first."
        )

    with METADATA_PATH.open("r", encoding="utf-8") as file:
        metadata = json.load(file)

    model = SentenceTransformer(MODEL_NAME)
    query_embedding = model.encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    query_embedding = query_embedding.astype("float32")

    index = faiss.read_index(str(INDEX_PATH))
    k = min(top_k, index.ntotal)

    scores, indices = index.search(query_embedding, k)

    results = []

    for score, idx in zip(scores[0], indices[0]):
        if idx < 0:
            continue

        chunk = metadata["chunks"][int(idx)]

        results.append(
            {
                "score": float(score),
                "source": chunk["source"],
                "page": chunk["page"],
                "chunk_id": chunk["chunk_id"],
                "text": chunk["text"],
            }
        )

    return results


def main():
    print("Document semantic search. Type 'exit' to quit.")

    while True:
        query = input("\nAsk a question: ").strip()

        if query.lower() in {"exit", "quit"}:
            break

        try:
            results = search_documents(query)

            for rank, result in enumerate(results, start=1):
                print(f"\n--- Result {rank} ---")
                print(f"Similarity: {result['score']:.4f}")
                print(f"Source: {result['source']}")
                print(f"Page: {result['page']}")
                print(result["text"])

        except (ValueError, FileNotFoundError) as error:
            print(f"Error: {error}")


if __name__ == "__main__":
    main()
