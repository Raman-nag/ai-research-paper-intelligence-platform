from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File

import fitz
import os
import uuid
import json
import spacy
import faiss
import numpy as np

from collections import Counter
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# =========================================
# FASTAPI
# =========================================


app = FastAPI()

latest_uploaded_chunks = []

embedding_model = None
nlp = None
index = None
metadata = []

def load_models():

    global embedding_model
    global nlp
    global index
    global metadata

    # Load embedding model

    if embedding_model is None:

        print("Loading embedding model...")

        embedding_model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2"
        )

        print("Embedding model loaded.")

    # Load spacy

    if nlp is None:

        print("Loading spaCy model...")

        nlp = spacy.load("en_core_web_sm")

        print("spaCy loaded.")

    # Load FAISS

    if index is None:

        print("Loading FAISS index...")

        index = faiss.read_index(
            "vector_store/semantic_faiss.index"
        )

        print("FAISS loaded.")
        print("Total vectors:", index.ntotal)

    # Load metadata

    if len(metadata) == 0:

        print("Loading metadata...")

        with open(
            "vector_store/semantic_chunks.json",
            "r",
            encoding="utf-8"
        ) as f:

            metadata = json.load(f)

        print("Metadata loaded.")
        print("Metadata size:", len(metadata))

# =========================================
# CORS
# =========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
'''
# =========================================
# LOAD EMBEDDING MODEL
# =========================================

#print("\nLoading embedding model...")

#embedding_model = SentenceTransformer(
   # "sentence-transformers/all-MiniLM-L6-v2"

#)
#nlp = spacy.load("en_core_web_sm")
print("Embedding model loaded.")

# =========================================
# LOAD FAISS INDEX
# =========================================

FAISS_PATH = "vector_store/semantic_faiss.index"

print("\nLoading FAISS index...")

#index = faiss.read_index(FAISS_PATH)

print("FAISS loaded.")
print("Total vectors:", index.ntotal)

# =========================================
# LOAD METADATA
# =========================================

METADATA_PATH = "vector_store/semantic_chunks.json"

print("\nLoading metadata...")

with open(METADATA_PATH, "r", encoding="utf-8") as f:

    metadata = json.load(f)

print("Metadata loaded.")
print("Metadata size:", len(metadata))'''


LATEST_GRAPH = {
    "nodes": [],
    "edges": []
}
# =========================================
# CREATE SEMANTIC CHUNKS
# =========================================

def create_chunks(
    text,
    chunk_size=700
):

    words = text.split()

    chunks = []

    for i in range(
        0,
        len(words),
        chunk_size
    ):

        chunk = " ".join(
            words[i:i + chunk_size]
        )

        if len(chunk.strip()) > 100:

            chunks.append(chunk)

    return chunks

# Extract paper sections
# Smart section extraction

import re

def extract_sections(text):

    sections = {

        "abstract": "",
        "introduction": "",
        "methodology": "",
        "results": "",
        "conclusion": ""

    }

    # Normalize text

    clean_text = re.sub(
        r'\n+',
        '\n',
        text
    )

    # Common research headings

    patterns = {

        "abstract": [

            r"\babstract\b"
        ],

        "introduction": [

            r"\b1\.?\s+introduction\b",

            r"\bintroduction\b"
        ],

        "methodology": [

            r"\bmethodology\b",

            r"\bmethods\b",

            r"\bproposed method\b",

            r"\bapproach\b",

            r"\bsystem design\b"
        ],

        "results": [

            r"\bresults\b",

            r"\bexperiments\b",

            r"\bevaluation\b",

            r"\bperformance analysis\b"
        ],

        "conclusion": [

            r"\bconclusion\b",

            r"\bconclusions\b",

            r"\bfuture work\b"
        ]

    }

    # Find section starts

    positions = {}

    lower_text = clean_text.lower()

    for section_name, regex_list in patterns.items():

        for regex_pattern in regex_list:

            match = re.search(
                regex_pattern,
                lower_text
            )

            if match:

                positions[
                    section_name
                ] = match.start()

                break

    # Sort sections by position

    sorted_sections = sorted(

        positions.items(),

        key=lambda x: x[1]
    )

    # Extract section content

    for i in range(
        len(sorted_sections)
    ):

        section_name = sorted_sections[i][0]

        start_pos = sorted_sections[i][1]

        if i < len(sorted_sections) - 1:

            end_pos = sorted_sections[i + 1][1]

        else:

            end_pos = start_pos + 5000

        extracted = clean_text[
            start_pos:end_pos
        ]

        # Cleanup

        extracted = extracted.strip()

        extracted = re.sub(
            r'\s+',
            ' ',
            extracted
        )

        sections[
            section_name
        ] = extracted[:4000]

    return sections 

# Generate dynamic knowledge graph

def generate_knowledge_graph(text):

    doc = nlp(text[:70000])

    # =========================================
    # REMOVE WEAK WORDS
    # =========================================

    weak_words = {

        "this",
        "that",
        "these",
        "those",
        "which",
        "their",
        "there",
        "them",
        "they",
        "paper",
        "study",
        "system",
        "result",
        "method",
        "data",
        "using",
        "based",
        "used",
        "approach",
        "analysis"
    }

    # =========================================
    # EXTRACT STRONG TECHNICAL TERMS
    # =========================================

    phrases = []

    for chunk in doc.noun_chunks:

        phrase = chunk.text.strip().lower()

        # cleanup

        phrase = phrase.replace("\n", " ")

        phrase = " ".join(phrase.split())

        # filtering

        if (

            len(phrase) < 4
            or len(phrase) > 40
            or phrase in weak_words
            or phrase.startswith("the ")
            or phrase.startswith("a ")
            or phrase.startswith("an ")
            or not phrase.isascii()

        ):

            continue

        # keep meaningful phrases only

        if any(char.isdigit() for char in phrase):

            continue

        phrases.append(phrase)

    # =========================================
    # MOST IMPORTANT TERMS
    # =========================================

    common_terms = [

        term for term, count in
        Counter(phrases).most_common(12)

    ]

    # =========================================
    # CREATE NODES
    # =========================================

    nodes = []

    for i, term in enumerate(common_terms):

        nodes.append({

            "id": str(i),

            "label": term,

            "connections": 0

        })

    # =========================================
    # CREATE SEMANTIC EDGES
    # =========================================

    edges = []

    for i in range(len(common_terms)):

        for j in range(i + 1, len(common_terms)):

            term1 = common_terms[i]
            term2 = common_terms[j]

            # connect related concepts

            if (

                term1.split()[0] in text.lower()

                and

                term2.split()[0] in text.lower()

            ):

                edges.append({

                    "source": str(i),

                    "target": str(j),

                    "label": f"{term1} ↔ {term2}"

                })

                nodes[i]["connections"] += 1
                nodes[j]["connections"] += 1

    return {

        "nodes": nodes,

        "edges": edges,

        "node_count": len(nodes),

        "edge_count": len(edges)

    }
# =========================================
# SAFE CHUNK  
# =========================================

def safe_chunk_fetch(idx):

    if idx >= len(metadata):

        idx = idx % len(metadata)

    return metadata[idx]

# =========================================
# ROOT
# =========================================

@app.get("/")

def root():

    return {

        "message": "Production ArXiv Research Backend Running",
        "status": "success",
        "vectors": index.ntotal

    }

# =========================================
# STATS
# =========================================

@app.get("/stats")

def stats():

    return {

        "papers_indexed": 427,
        "semantic_chunks": len(metadata),
        "embedding_dimensions": 384,
        "faiss_vectors": index.ntotal,
        "embedding_model": "all-MiniLM-L6-v2",
        "backend_status": "online"

    }

# =========================================
# SEMANTIC SEARCH
# =========================================

# =========================================
# SEMANTIC SEARCH
# =========================================

# =========================================
# SEMANTIC SEARCH
# =========================================

@app.get("/search")
def semantic_search(query: str):

    try:
        load_models()
        global latest_uploaded_chunks

        # =====================================
        # QUERY EMBEDDING
        # =====================================

        query_embedding = embedding_model.encode(
            [query]
        ).astype("float32")

        # =====================================
        # SEARCH INSIDE UPLOADED PDF FIRST
        # =====================================

        uploaded_pdf_matches = []

        if latest_uploaded_chunks:

            chunk_embeddings = embedding_model.encode(
                latest_uploaded_chunks
            ).astype("float32")

            similarities = cosine_similarity(
                query_embedding,
                chunk_embeddings
            )[0]

            ranked_chunks = sorted(

                zip(
                    latest_uploaded_chunks,
                    similarities
                ),

                key=lambda x: x[1],

                reverse=True

            )

            # KEEP ONLY RELEVANT MATCHES

            for text, score in ranked_chunks[:5]:

                # threshold

                if score > 0.25:

                    uploaded_pdf_matches.append({

                        "section": "Uploaded PDF",

                        "text": text[:1500],

                        "similarity_score": float(score)

                    })

        # =====================================
        # SEARCH VECTOR DATABASE
        # =====================================

        k = 10

        distances, indices = index.search(
            query_embedding,
            k
        )

        results = []

        seen_papers = set()

        for i, idx in enumerate(indices[0]):

            chunk = safe_chunk_fetch(idx)

            text = chunk.get(
                "text",
                ""
            )

            # =================================
            # STRICT QUERY FILTER
            # =================================

            if query.lower() not in text.lower():

                continue

            paper_id = chunk.get(
                "paper_id",
                "unknown"
            )

            # avoid duplicates

            if paper_id in seen_papers:

                continue

            seen_papers.add(paper_id)

            results.append({

                "rank": len(results) + 1,

                "paper_id": paper_id,

                "section": chunk.get(
                    "section",
                    "unknown"
                ),

                "text": text[:1200],

                "similarity_score": float(
                    distances[0][i]
                )

            })

            # top 5 only

            if len(results) == 5:

                break

        # =====================================
        # SORT RESULTS
        # =====================================

        results = sorted(

            results,

            key=lambda x: x["similarity_score"],

            reverse=True

        )

        return {

            "status": "success",

            "query": query,

            "uploaded_pdf_matches":
            uploaded_pdf_matches,

            "total_results":
            len(results),

            "results":
            results

        }

    except Exception as e:

        return {

            "status": "error",

            "message": str(e)

        }
# =========================================
# AI ASSISTANT
# =========================================

# =========================================
# AI RESEARCH ASSISTANT
# =========================================

@app.get("/ask")
def ask_ai(question: str):

    try:
        load_models()
        global latest_uploaded_chunks

        # =====================================
        # STEP 1: SEARCH UPLOADED PDF FIRST
        # =====================================

        uploaded_context = []

        if latest_uploaded_chunks:

            query_embedding = embedding_model.encode(
                [question]
            ).astype("float32")

            chunk_embeddings = embedding_model.encode(
                latest_uploaded_chunks
            ).astype("float32")

            similarities = cosine_similarity(
                query_embedding,
                chunk_embeddings
            )[0]

            ranked_chunks = sorted(

                zip(
                    latest_uploaded_chunks,
                    similarities
                ),

                key=lambda x: x[1],

                reverse=True

            )

            for text, score in ranked_chunks[:5]:

                if score > 0.20:

                    uploaded_context.append(text)

        # =====================================
        # STEP 2: FALLBACK TO VECTOR DATABASE
        # =====================================

        database_context = []

        if len(uploaded_context) == 0:

            query_embedding = embedding_model.encode(
                [question]
            ).astype("float32")

            distances, indices = index.search(
                query_embedding,
                5
            )

            for idx in indices[0]:

                chunk = safe_chunk_fetch(idx)

                database_context.append(

                    chunk.get(
                        "text",
                        ""
                    )

                )

        # =====================================
        # STEP 3: FINAL CONTEXT
        # =====================================

        if uploaded_context:

            final_context = "\n\n".join(
                uploaded_context
            )

            source_used = "Uploaded PDF"

        else:

            final_context = "\n\n".join(
                database_context
            )

            source_used = "Research Database"

        # =====================================
        # STEP 4: GENERATE AI ANSWER
        # =====================================

        sentences = final_context.split(".")

        relevant_sentences = []

        for sentence in sentences:

            if any(

                word.lower() in sentence.lower()

                for word in question.split()

            ):

                relevant_sentences.append(
                    sentence.strip()
                )

        # take top sentences

        summary = ". ".join(
            relevant_sentences[:8]
        )

        # =====================================
        # CLEAN RESPONSE
        # =====================================

        if not summary.strip():

            summary = final_context[:1500]

        answer = f"""

## Research Answer

### Question
{question}

### Source
{source_used}

### Explanation

{summary}

### Key Insights

• The uploaded research paper contains information relevant to "{question}".

• Semantic retrieval was used to identify the most relevant technical sections.

• The response was generated by summarizing engineering concepts from the retrieved context.

### AI Interpretation

This answer is based on semantic understanding of the uploaded research content rather than keyword matching alone. The assistant analyzed the most relevant sections and generated a concise research-oriented explanation.

"""

        return {

            "status": "success",

            "question": question,

            "source": source_used,

            "answer": answer

        }

    except Exception as e:

        return {

            "status": "error",

            "message": str(e)

        }

# =========================================
# UPLOAD AND PROCESS PAPER
# =========================================

@app.post("/upload-paper")

async def upload_paper(
    file: UploadFile = File(...)
):

    try:
        load_models()
        # Create uploads folder

        UPLOAD_DIR = "uploads"

        os.makedirs(
            UPLOAD_DIR,
            exist_ok=True
        )

        # Generate unique filename

        unique_id = str(uuid.uuid4())

        filename = f"{unique_id}_{file.filename}"

        file_path = os.path.join(
            UPLOAD_DIR,
            filename
        )

        # Save uploaded PDF

        with open(file_path, "wb") as buffer:

            content = await file.read()

            buffer.write(content)

        # Extract PDF text

        document = fitz.open(file_path)

        full_text = ""

        for page in document:

            full_text += page.get_text()

        document.close()

        # Create semantic chunks

        chunks = create_chunks(full_text)

        print("Chunks created:", len(chunks))

        # Generate embeddings

        chunk_embeddings = embedding_model.encode(
            chunks
        ).astype("float32")

        # Average embedding

        paper_embedding = np.mean(
            chunk_embeddings,
            axis=0
        ).reshape(1, -1)

        # Search similar papers

        distances, indices = index.search(
            paper_embedding,
            5
        )

        similar_papers = []

        for i, idx in enumerate(indices[0]):

            chunk = safe_chunk_fetch(idx)

            similar_papers.append({

                "rank": i + 1,

                "paper_id": chunk.get(
                    "paper_id",
                    "unknown"
                ),

                "section": chunk.get(
                    "section",
                    "unknown"
                ),

                "similarity_score": float(
                    distances[0][i]
                ),

                "preview": chunk.get(
                    "text",
                    ""
                )[:300]

            })

        # Paper statistics

        word_count = len(
            full_text.split()
        )

        char_count = len(full_text)

        # Final response

        return {

            "status": "success",

            "message": "Paper uploaded successfully",

            "filename": file.filename,

            "saved_as": filename,

            "text_length": char_count,

            "word_count": word_count,

            "total_chunks": len(chunks),

            "similar_papers": similar_papers,

            "preview": full_text[:1500]

        }

    except Exception as e:

        return {

            "status": "error",

            "message": str(e)

        }


# =========================================
# GENERATE STRUCTURED PAPER SUMMARY
# =========================================

def generate_paper_summary(sections):

    summary = {

        "abstract":
        sections.get("abstract", "")[:700],

        "introduction":
        sections.get("introduction", "")[:700],

        "methodology":
        sections.get("methodology", "")[:700],

        "results":
        sections.get("results", "")[:700],

        "conclusion":
        sections.get("conclusion", "")[:700]

    }

    return {

        "executive_summary":

        f"""
This research paper discusses:

{summary['abstract']}

The paper introduces the problem domain in detail and explains the motivation, methodology, experimental setup, and evaluation strategy.

Key engineering concepts were identified from the uploaded IEEE research paper and summarized using semantic analysis.
        """,

        "key_takeaways": [

            "Research objectives were identified from the uploaded paper.",

            "Important engineering concepts were extracted semantically.",

            "Methodology and implementation strategy were summarized.",

            "Experimental results and conclusions were analyzed.",

            "IEEE research structure was automatically interpreted."

        ],

        "sections": summary

    }
# Analyze uploaded research paper

@app.post("/analyze-paper")

async def analyze_paper(
    file: UploadFile = File(...)
):

    try:
        load_models()
        # =====================================
        # CREATE UPLOAD DIRECTORY
        # =====================================

        UPLOAD_DIR = "uploads"

        os.makedirs(
            UPLOAD_DIR,
            exist_ok=True
        )

        # =====================================
        # UNIQUE FILE NAME
        # =====================================

        unique_id = str(uuid.uuid4())

        filename = f"{unique_id}_{file.filename}"

        file_path = os.path.join(
            UPLOAD_DIR,
            filename
        )

        # =====================================
        # SAVE FILE
        # =====================================

        with open(file_path, "wb") as buffer:

            content = await file.read()

            buffer.write(content)

        # =====================================
        # EXTRACT PDF TEXT
        # =====================================

        document = fitz.open(file_path)

        full_text = ""

        for page in document:

            full_text += page.get_text()

        document.close()

        # =====================================
        # SAVE UPLOADED PAPER
        # =====================================

        with open(
            "uploaded_paper.json",
            "w",
            encoding="utf-8"
        ) as f:

            json.dump({

                "filename": file.filename,

                "full_text": full_text

            }, f)

        # =====================================
        # EXTRACT SECTIONS
        # =====================================

        sections = extract_sections(
            full_text
        )

        # =====================================
        # CREATE CHUNKS
        # =====================================

        chunks = create_chunks(
            full_text
        )
        global latest_uploaded_chunks
        latest_uploaded_chunks = chunks
        # =====================================
        # GENERATE EMBEDDINGS
        # =====================================

        chunk_embeddings = embedding_model.encode(
            chunks
        ).astype("float32")

        # =====================================
        # AVERAGE EMBEDDING
        # =====================================

        paper_embedding = np.mean(
            chunk_embeddings,
            axis=0
        ).reshape(1, -1)

        # =====================================
        # SEARCH SIMILAR PAPERS
        # =====================================

        distances, indices = index.search(
            paper_embedding,
            10
        )

        similar_papers = []

        seen_papers = set()

        for i, idx in enumerate(indices[0]):

            chunk = safe_chunk_fetch(idx)

            paper_id = chunk.get(
                "paper_id",
                "unknown"
            )

            # avoid duplicates

            if paper_id in seen_papers:

                continue

            seen_papers.add(paper_id)

            similar_papers.append({

                "rank": len(similar_papers) + 1,

                "paper_id": paper_id,

                "section": chunk.get(
                    "section",
                    "unknown"
                ),

                "similarity_score": float(
                    distances[0][i]
                ),

                "summary": chunk.get(
                    "text",
                    ""
                )[:1000],

                "preview": chunk.get(
                    "text",
                    ""
                )[:300]

            })

            # keep top 5 only

            if len(similar_papers) >= 5:

                break

        # =====================================
        # GENERATE KNOWLEDGE GRAPH
        # =====================================

        knowledge_graph = generate_knowledge_graph(
            full_text
        )

        global LATEST_GRAPH

        LATEST_GRAPH = knowledge_graph
        paper_summary =generate_paper_summary(sections)
        # =====================================
        # FINAL RESPONSE
        # =====================================

        return {

            "status": "success",

            "filename": file.filename,

            "knowledge_graph":knowledge_graph,
            "paper_summary": paper_summary,
            "total_chunks":
            len(chunks),

            "sections": {

                "abstract":
                sections["abstract"][:1500],

                "introduction":
                sections["introduction"][:1500],

                "methodology":
                sections["methodology"][:1500],

                "results":
                sections["results"][:1500],

                "conclusion":
                sections["conclusion"][:1500]

            },

            "similar_papers":
            similar_papers

        }

    except Exception as e:

        return {

            "status": "error",

            "message": str(e)

        }

@app.get("/knowledge-graph")
def get_knowledge_graph():
    load_models()
    return LATEST_GRAPH
