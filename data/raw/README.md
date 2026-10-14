# RAG Assistant

A locally developed Retrieval-Augmented Generation (RAG) project. This
README documents the implementation completed so far: PDF text
extraction, character-based chunking, embedding generation, FAISS
indexing, and semantic search. LLM-based answer generation has **not**
been integrated yet.

## Project Status

-   [x] Local Python virtual environment
-   [x] PDF text extraction with PyMuPDF
-   [x] Character-based chunking with overlap
-   [x] Text embeddings with Sentence Transformers
-   [x] Vector similarity index with FAISS
-   [x] Semantic search over document chunks
-   [ ] LLM-based answer generation
-   [ ] FastAPI backend
-   [ ] Web interface
-   [ ] Retrieval evaluation and deployment

## Architecture So Far

``` text
PDF document
    |
    v
PyMuPDF: extract text page by page
    |
    v
Chunking: split text into overlapping chunks
    |
    v
chunks.json
    |
    v
Sentence Transformers: create embeddings
    |
    +--> embeddings.npy
    +--> embedding_metadata.json
    |
    v
FAISS IndexFlatIP vector index
    |
    v
User question --> query embedding --> similarity search
                                      |
                                      v
                              Top-k relevant chunks
```

At this stage, the application retrieves relevant passages. It does not
yet generate a natural-language answer with an LLM.

## Technology Stack

-   **Python** --- primary language
-   **venv** --- isolated local Python environment
-   **PyMuPDF** --- extracts text from PDF pages
-   **Sentence Transformers** --- creates text embeddings using
    `sentence-transformers/all-MiniLM-L6-v2`
-   **NumPy** --- stores and handles embedding arrays
-   **FAISS CPU** --- performs vector similarity search

## Project Structure

The current project structure is expected to look like this:

``` text
rag-assistant/
├── .venv/
├── data/
│   ├── raw/
│   │   └── university_handbook.pdf
│   └── processed/
│       ├── chunks.json
│       ├── embeddings.npy
│       ├── embedding_metadata.json
│       └── document_index.faiss
├── src/
│   ├── __init__.py
│   ├── test_ingestion.py
│   └── ingestion/
│       ├── __init__.py
│       └── pdf_loader.py
│   └── retrieval/
│       ├── __init__.py
│       ├── embeddings.py
│       ├── vector_store.py
│       └── search.py
├── tests/
├── requirements.txt
└── README.md
```

> The PDF filename shown above is an example. Replace it with the
> filename you actually use. Keep private or copyrighted documents out
> of public repositories unless you have permission to share them.

## 1. Create and Activate the Virtual Environment

On Windows PowerShell:

``` powershell
mkdir rag-assistant
cd rag-assistant
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
```

If PowerShell blocks activation, allow scripts for the current terminal
session only:

``` powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Verify that Python points to the project's `.venv` directory:

``` powershell
python --version
python -c "import sys; print(sys.executable)"
```

### Screenshot: Virtual environment

Save a screenshot showing the activated environment and Python
executable here:

`docs/screenshots/01-virtual-environment.png`

![Virtual environment
screenshot](docs/screenshots/01-virtual-environment.png)

## 2. Install Dependencies

Install the PDF processing dependency:

``` powershell
python -m pip install pymupdf
```

After creating the ingestion pipeline, install the embedding and vector
search dependencies:

``` powershell
python -m pip install sentence-transformers faiss-cpu numpy
```

Update the dependency file:

``` powershell
python -m pip freeze > requirements.txt
```

To install the saved dependencies in another environment later:

``` powershell
python -m pip install -r requirements.txt
```

### Screenshot: Dependencies installed

Save a screenshot showing successful package installation or package
versions here:

`docs/screenshots/02-dependencies.png`

![Dependency installation
screenshot](docs/screenshots/02-dependencies.png)

## 3. PDF Text Extraction and Chunking

**File:** `src/ingestion/pdf_loader.py`

The ingestion module contains two functions:

-   `extract_pages(pdf_path)` opens a PDF and extracts text page by
    page. Each extracted page retains the source filename and page
    number.
-   `chunk_pages(pages, chunk_size=1000, overlap=150)` splits page text
    into smaller, overlapping chunks.

Each chunk contains:

-   `source` --- original PDF filename
-   `page` --- one-based page number
-   `chunk_id` --- chunk identifier
-   `text` --- extracted chunk text

The initial chunking method uses character counts. This is a simple
baseline; token-aware or structure-aware chunking can be evaluated
later. Empty pages are skipped. A PDF with no extractable text may be
scanned and require OCR.

### Run the ingestion pipeline

Place a PDF in `data/raw/` and update the PDF filename in
`src/test_ingestion.py` if necessary. Then run from the project root:

``` powershell
python -m src.test_ingestion
```

The script reports the number of extracted pages and generated chunks,
prints the first chunk, and writes the chunks to
`data/processed/chunks.json`.

### Screenshot: PDF ingestion output

Save the terminal output showing successful extraction and chunk
creation here:

`docs/screenshots/03-pdf-ingestion.png`

![PDF ingestion screenshot](docs/screenshots/03-pdf-ingestion.png)

### Screenshot: Generated chunks

Capture the contents of `chunks.json`, including `source`, `page`,
`chunk_id`, and `text` fields:

`docs/screenshots/04-chunks-json.png`

![Chunks JSON screenshot](docs/screenshots/04-chunks-json.png)

## 4. Generate Embeddings

**File:** `src/retrieval/embeddings.py`

The embedding pipeline:

1.  Loads `data/processed/chunks.json`.
2.  Extracts the text from each chunk.
3.  loads the `sentence-transformers/all-MiniLM-L6-v2` pretrained model.
4.  Encodes each chunk into a numerical vector.
5.  Normalizes the vectors and saves them as `float32`.
6.  Saves the vectors and associated chunk metadata.

Run it from the project root:

``` powershell
python -m src.retrieval.embeddings
```

Expected output files:

-   `data/processed/embeddings.npy` --- embedding matrix
-   `data/processed/embedding_metadata.json` --- model name, embedding
    dimension, chunk count, and chunk metadata

The model produces 384-dimensional vectors. If there are `N` chunks, the
expected embedding matrix shape is `(N, 384)`. The actual chunk count
depends on the PDF.

### Screenshot: Embedding generation

Save the terminal output showing the number of chunks and embedding
shape here:

`docs/screenshots/05-embedding-generation.png`

![Embedding generation
screenshot](docs/screenshots/05-embedding-generation.png)

## 5. Build the FAISS Vector Index

**File:** `src/retrieval/vector_store.py`

The vector-store module loads `embeddings.npy` and creates a FAISS
`IndexFlatIP` index. Since the embeddings are normalized, inner-product
scores correspond to cosine similarity.

This index performs exact similarity search and is suitable as an
initial implementation for a small document collection.

Run:

``` powershell
python -m src.retrieval.vector_store
```

The index is saved to:

`data/processed/document_index.faiss`

### Screenshot: FAISS index creation

Save the terminal output showing the number of indexed chunks and vector
dimension here:

`docs/screenshots/06-faiss-index.png`

![FAISS index screenshot](docs/screenshots/06-faiss-index.png)

## 6. Search Documents Semantically

**File:** `src/retrieval/search.py`

The semantic-search module:

1.  Accepts a question from the terminal.
2.  Embeds the question using the same embedding model.
3.  Loads the FAISS index.
4.  Retrieves the top `k` matching chunks.
5.  Prints each result's similarity score, source filename, page number,
    and text.

Run:

``` powershell
python -m src.retrieval.search
```

Enter a question that the PDF is expected to answer. Type `exit` or
`quit` to close the search loop.

For example, if a handbook contains fee payment rules, ask a question
about when fees must be paid. Use questions that genuinely relate to
your own document.

**Important:** similarity scores are ranking signals, not calibrated
confidence values. A high score does not guarantee that a passage
answers the question. Check the returned passages manually.

### Screenshot: Semantic search results

Save a screenshot showing a query and its retrieved passages here:

`docs/screenshots/07-semantic-search.png`

![Semantic search screenshot](docs/screenshots/07-semantic-search.png)

## Generated Files

  -----------------------------------------------------------------------
  File                                Purpose
  ----------------------------------- -----------------------------------
  `chunks.json`                       Extracted and chunked document text
                                      with source/page metadata

  `embeddings.npy`                    Numerical vector for each chunk

  `embedding_metadata.json`           Embedding model information and
                                      chunk metadata

  `document_index.faiss`              FAISS index used for similarity
                                      search

  `requirements.txt`                  Python dependency versions
  -----------------------------------------------------------------------

## Current Limitations

-   The system retrieves passages but does not yet generate answers with
    an LLM.
-   Retrieval quality has not yet been measured against a labelled
    evaluation dataset.
-   Character-based chunking may split sentences or sections awkwardly.
-   Scanned PDFs may need OCR.
-   Similarity scores do not directly represent the probability that a
    result is correct.
-   The initial implementation is designed for local experimentation,
    not yet for multi-user production use.
-   The embedding model name is currently specified in more than one
    module; it should be centralized in configuration as the project
    grows.

## Next Steps

1.  Test semantic search with several questions grounded in the PDF.
2.  Review whether the retrieved passages actually support each
    question.
3.  Build a small retrieval evaluation dataset with expected supporting
    passages.
4.  Add LLM-based answer generation using retrieved chunks as context.
5.  Include source citations in answers and handle questions that cannot
    be answered from the documents.
6.  Add a FastAPI endpoint and a web interface.
7.  Evaluate the complete RAG pipeline and document its limitations.

## Screenshot Guide

Create this folder in the repository and place your actual screenshots
inside it:

``` text
docs/
└── screenshots/
    ├── 01-virtual-environment.png
    ├── 02-dependencies.png
    ├── 03-pdf-ingestion.png
    ├── 04-chunks-json.png
    ├── 05-embedding-generation.png
    ├── 06-faiss-index.png
    └── 07-semantic-search.png
```

The screenshot paths in this README are placeholders until you add your
captured images. GitHub will display them when the files exist at those
paths. Use screenshots of your actual terminal and output; do not
replace them with fabricated results.

## Running Order

From the project root, with the virtual environment activated:

``` powershell
python -m src.test_ingestion
python -m src.retrieval.embeddings
python -m src.retrieval.vector_store
python -m src.retrieval.search
```

Re-run ingestion whenever the source PDF or chunking configuration
changes, then regenerate embeddings and rebuild the index so all
artifacts stay in sync.
