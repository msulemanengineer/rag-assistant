
from pathlib import Path

import faiss
import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parents[2]
EMBEDDINGS_PATH = PROJECT_ROOT / "data" / "processed" / "embeddings.npy"
INDEX_PATH = PROJECT_ROOT / "data" / "processed" / "document_index.faiss"


def build_index():
    if not EMBEDDINGS_PATH.exists():
        raise FileNotFoundError(
            "Embeddings not found. Run the embedding pipeline first."
        )

    embeddings = np.load(EMBEDDINGS_PATH).astype(np.float32)

    if embeddings.ndim != 2 or embeddings.shape[0] == 0:
        raise ValueError("Embeddings must be a non-empty 2D array.")

    # Inner product on normalized vectors equals cosine similarity.
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(INDEX_PATH))

    print(f"Indexed {index.ntotal} document chunks.")
    print(f"Vector dimension: {index.d}")
    print(f"Saved index: {INDEX_PATH}")


if __name__ == "__main__":
    build_index()
