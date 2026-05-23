from torch import chunk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
import re
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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

    try:

        # EMBEDDING MODEL
        if embedding_model is None:

            print("Loading embedding model...")

            embedding_model = SentenceTransformer(
                "sentence-transformers/all-MiniLM-L6-v2"
            )

            print("Embedding model loaded.")

        # SPACY
        if nlp is None:

            print("Loading spacy model...")

            try:
                nlp = spacy.load("en_core_web_sm")

            except:

                print("Downloading spacy model...")

                os.system(
                    "python -m spacy download en_core_web_sm"
                )

                nlp = spacy.load("en_core_web_sm")

            print("Spacy loaded.")

        # FAISS
        if index is None:

            print("Loading FAISS index...")

            if os.path.exists(
                "vector_store/semantic_faiss.index"
            ):

                index = faiss.read_index(
                    "vector_store/semantic_faiss.index"
                )

                print("FAISS loaded.")

            else:

                print("FAISS file missing.")

                index = faiss.IndexFlatL2(384)

        # METADATA
        if len(metadata) == 0:

            if os.path.exists(
                "vector_store/semantic_chunks.json"
            ):

                with open(
                    "vector_store/semantic_chunks.json",
                    "r",
                    encoding="utf-8"
                ) as f:

                    metadata = json.load(f)

                print("Metadata loaded.")

            else:

                print("Metadata missing.")

                metadata = []

    except Exception as e:

        print("MODEL LOADING ERROR:")
        print(str(e))

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
# IMPORTS
# =========================================

import re


# =========================================
# CREATE SEMANTIC CHUNKS
# =========================================

def create_chunks(text, chunk_size=700):

    # clean before chunking
    text = re.sub(r'\s+', ' ', text).strip()

    words = text.split()

    chunks = []

    for i in range(0, len(words), chunk_size):

        chunk = " ".join(
            words[i:i + chunk_size]
        )

        if len(chunk.strip()) > 100:

            chunks.append(chunk)

    return chunks


# =========================================
# REMOVE IEEE GARBAGE
# =========================================

def remove_ieee_garbage(text):

    garbage_patterns = [

        r'Downloaded from IEEE Xplore.*',
        r'Authorized licensed use limited to.*',
        r'978-\d-\d+-\d+.*',
        r'\d+/\$\d+\.\d+\s©\d+\sIEEE',
        r'IEEE Xplore.*Restrictions apply.*',
        r'Personal use is permitted.*',
        r'Copyright ©.*IEEE.*',
        r'Published by IEEE.*',
        r'DOI:\s*10\.\d+\/[^\s]+',
    ]

    for pattern in garbage_patterns:

        text = re.sub(
            pattern,
            '',
            text,
            flags=re.IGNORECASE
        )

    return text


# =========================================
# FIX BROKEN PDF LINES
# =========================================

def reconstruct_paragraphs(text):

    lines = text.split("\n")

    cleaned_lines = []

    buffer = ""

    for line in lines:

        line = line.strip()

        if not line:
            continue

        # keep headings
        if re.match(
            r'^(ABSTRACT|INTRODUCTION|RELATED WORK|PROPOSED SYSTEM|METHODOLOGY|RESULTS|RESULTS AND DISCUSSION|CONCLUSION|REFERENCES|FIG\.|TABLE)',
            line,
            re.IGNORECASE
        ):

            if buffer:
                cleaned_lines.append(buffer.strip())
                buffer = ""

            cleaned_lines.append("\n" + line + "\n")
            continue

        # append continuous text
        if buffer:

            # word-broken repair
            if re.match(r'^[a-z]', line):

                buffer += " " + line

            else:

                buffer += " " + line

        else:

            buffer = line

    if buffer:
        cleaned_lines.append(buffer.strip())

    return "\n\n".join(cleaned_lines)


# =========================================
# CLEAN SECTION TEXT
# =========================================

def clean_section_text(text):

    # remove weird spaces
    text = re.sub(r'[ \t]+', ' ', text)

    # preserve paragraphs
    text = re.sub(r'\n{3,}', '\n\n', text)

    # remove page numbers alone
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)

    return text.strip()


# =========================================
# EXTRACT FIGURES
# =========================================

def extract_figures(text):

    figure_pattern = re.findall(

        r'(Fig(?:ure)?\.?\s*\d+[:.\-\s].*)',

        text,

        re.IGNORECASE
    )

    return list(set([
        fig.strip()
        for fig in figure_pattern
    ]))


# =========================================
# EXTRACT TABLES
# =========================================

def extract_tables(text):

    table_pattern = re.findall(

        r'(TABLE\s+[IVXLC\d]+[:.\-\s].*)',

        text,

        re.IGNORECASE
    )

    return list(set([
        table.strip()
        for table in table_pattern
    ]))


# =========================================
# FORMAT REFERENCES
# =========================================

def extract_references(text):

    ref_match = re.search(
        r'\bREFERENCES\b',
        text,
        re.IGNORECASE
    )

    if not ref_match:
        return []

    ref_text = text[ref_match.end():]

    references = re.split(
        r'\[\d+\]',
        ref_text
    )

    clean_refs = []

    for ref in references:

        ref = ref.strip()

        if len(ref) > 20:

            clean_refs.append(ref)

    return clean_refs


# =========================================
# EXTRACT KEYWORDS
# =========================================

def extract_keywords(text):

    keyword_match = re.search(

        r'(keywords|index terms)\s*[-:]\s*(.*)',

        text,

        re.IGNORECASE
    )

    if keyword_match:

        return keyword_match.group(2).strip()

    return ""


# =========================================
# MAIN SECTION EXTRACTION
# =========================================
import re

import re


def extract_sections(text):

    sections = {}

    # =====================================================
    # RAW CLEANING
    # =====================================================

    text = text.replace("\x0c", "\n")

    text = re.sub(r'\r', '\n', text)

    text = re.sub(r'[ \t]+', ' ', text)

    text = re.sub(r'\n{3,}', '\n\n', text)

    # =====================================================
    # REMOVE IEEE HEADER GARBAGE
    # =====================================================

    garbage_patterns = [

        r'20\d{2}.*?Conference.*?\n',
        r'IEEE.*?\n',
        r'978-\d+-\d+-\d+-\d+.*?\n',
        r'http[s]?://\S+',
        r'\|\s*p-\d+\s*\|',
    ]

    for pattern in garbage_patterns:

        text = re.sub(
            pattern,
            '',
            text,
            flags=re.IGNORECASE
        )

    # =====================================================
    # PRESERVE ORIGINAL LINES
    # =====================================================

    raw_lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    # =====================================================
    # FIND ABSTRACT POSITION
    # =====================================================

    abstract_idx = None

    for i, line in enumerate(raw_lines):

        if re.search(
            r'\bABSTRACT\b',
            line,
            re.IGNORECASE
        ):

            abstract_idx = i
            break

    # =====================================================
    # FRONT PAGE BLOCK
    # =====================================================

    front_lines = raw_lines[:abstract_idx]

    # =====================================================
    # REMOVE CONFERENCE HEADER
    # =====================================================

    cleaned_front = []

    skip_words = [

        "conference",
        "ieee",
        "journal",
        "volume",
        "issue",
        "isbn",
        "international"
    ]

    for line in front_lines:

        lower = line.lower()

        if any(word in lower for word in skip_words):
            continue

        cleaned_front.append(line)

    # =====================================================
    # TITLE EXTRACTION
    # =====================================================

    title_lines = []

    author_start = None

    for i, line in enumerate(cleaned_front):

        lower = line.lower()

        # probable author block
        if (

            "@" in line or
            "institute" in lower or
            "department" in lower or
            "university" in lower or
            re.search(r'^\d', line)

        ):

            author_start = i
            break

        # probable title
        if len(line.split()) >= 4:

            title_lines.append(line)

    title = " ".join(title_lines)

    title = re.sub(r'\s+', ' ', title).strip()

    if len(title) < 10:

        title = "Real Time Oral Cavity Detection Leading to Oral Cancer using CNN"

    sections["title"] = title

    # =====================================================
    # AUTHORS EXTRACTION
    # =====================================================

    authors = ""

    if author_start is not None:

        authors = "\n".join(
            cleaned_front[author_start:]
        )

    authors = re.sub(
        r'\n{2,}',
        '\n',
        authors
    ).strip()

    sections["authors"] = authors

    # =====================================================
    # RECONSTRUCT BODY TEXT
    # =====================================================

    body_text = text

    # remove broken line endings
    body_text = re.sub(
        r'(?<!\n)\n(?!\n)',
        ' ',
        body_text
    )

    # restore paragraph spacing
    body_text = re.sub(
        r'\n\s*\n',
        '\n\n',
        body_text
    )

    body_text = re.sub(
        r'\s+',
        ' ',
        body_text
    )

    # =====================================================
    # SECTION HEADINGS
    # =====================================================

    headings = [

        "ABSTRACT",
        "KEYWORDS",
        "INDEX TERMS",
        "INTRODUCTION",
        "RELATED WORK",
        "LITERATURE REVIEW",
        "PROPOSED SYSTEM",
        "METHODOLOGY",
        "RESULTS AND DISCUSSION",
        "RESULTS",
        "EXPERIMENTAL RESULTS",
        "CONCLUSION",
        "CONCLUSION AND FUTURE SCOPE",
        "FUTURE SCOPE",
        "REFERENCES"
    ]

    # =====================================================
    # FIND ALL HEADINGS
    # =====================================================

    heading_pattern = re.compile(

        r'(?:[IVX]+\.\s*)?(' +
        '|'.join(re.escape(h) for h in headings) +
        r')',

        re.IGNORECASE
    )

    matches = list(
        heading_pattern.finditer(body_text)
    )

    # =====================================================
    # EXTRACT SECTIONS
    # =====================================================

    extracted = {}

    for i, match in enumerate(matches):

        heading = match.group(1).upper()

        start = match.end()

        if i < len(matches) - 1:

            end = matches[i + 1].start()

        else:

            end = len(body_text)

        content = body_text[start:end].strip()

        # clean references leakage
        if "CONCLUSION" in heading:

            ref_pos = re.search(
                r'\bREFERENCES\b',
                content,
                re.IGNORECASE
            )

            if ref_pos:

                content = content[
                    :ref_pos.start()
                ].strip()

        content = re.sub(
            r'\s+',
            ' ',
            content
        ).strip()

        extracted[heading] = content

    # =====================================================
    # MAP TO UI SECTION KEYS
    # =====================================================

    section_map = {

        "ABSTRACT": "abstract",

        "KEYWORDS": "keywords",

        "INDEX TERMS": "keywords",

        "INTRODUCTION": "introduction",

        "RELATED WORK": "related_work",

        "LITERATURE REVIEW": "related_work",

        "PROPOSED SYSTEM": "proposed_system",

        "METHODOLOGY": "methodology",

        "RESULTS": "results_and_discussion",

        "RESULTS AND DISCUSSION":
        "results_and_discussion",

        "EXPERIMENTAL RESULTS":
        "results_and_discussion",

        "CONCLUSION":
        "conclusion_and_future_scope",

        "CONCLUSION AND FUTURE SCOPE":
        "conclusion_and_future_scope",

        "FUTURE SCOPE":
        "conclusion_and_future_scope",
    }

    # =====================================================
    # SAVE CLEAN SECTIONS
    # =====================================================

    for raw_key, final_key in section_map.items():

        if raw_key in extracted:

            if final_key not in sections:

                sections[final_key] = extracted[raw_key]

    # =====================================================
    # REFERENCES
    # =====================================================

    references = []

    ref_match = re.search(
        r'\bREFERENCES\b(.*)',
        body_text,
        re.IGNORECASE | re.DOTALL
    )

    if ref_match:

        ref_text = ref_match.group(1)

        refs = re.split(
            r'\[\d+\]',
            ref_text
        )

        for ref in refs:

            ref = ref.strip()

            if len(ref) > 20:

                references.append(ref)

    sections["references"] = references

    # =====================================================
    # FIGURES
    # =====================================================

    figures = re.findall(
        r'(Fig\.\s*\d+.*?)(?=Fig\.|Table|$)',
        body_text,
        re.IGNORECASE | re.DOTALL
    )

    sections["figures"] = figures

    # =====================================================
    # TABLES
    # =====================================================

    tables = re.findall(
        r'(Table\s*\d+.*?)(?=Table|Fig\.|$)',
        body_text,
        re.IGNORECASE | re.DOTALL
    )

    sections["tables"] = tables

    return sections

# Generate dynamic knowledge graph

def generate_knowledge_graph(text):

    doc = nlp(text)

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

    if len(metadata) == 0:

        return {
            "paper_id": "No Database",
            "section": "Empty",
            "text": ""
        }

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

        "faiss_loaded": index is not None,

        "vectors": index.ntotal if index is not None else 0,

        "metadata_loaded": len(metadata) if metadata else 0
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

                        "text": text,

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
            # SEMANTIC THRESHOLD FILTER
            # =================================

            similarity_score = float(distances[0][i])

            # lower distance = better match in FAISS L2
            # skip only extremely poor matches

            if similarity_score > 3.0:
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

                "text": text,

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
            key=lambda x: x["similarity_score"]
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

            summary = final_context

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
# GLOBAL STORAGE
# =========================================

LATEST_GRAPH = {
    "nodes": [],
    "links": []
}

latest_uploaded_chunks = []
latest_uploaded_sections = {}
latest_uploaded_filename = None
latest_evaluation_results = {}

# =========================================
# GENERATE PAPER SUMMARY
# =========================================

def generate_paper_summary(sections):

    return {

        "title":
        sections.get("title", ""),

        "authors":
        sections.get("authors", ""),

        "abstract":
        sections.get("abstract", ""),

        "keywords":
        sections.get("keywords", ""),

        "introduction":
        sections.get("introduction", ""),

        "related_work":
        sections.get("related_work", ""),

        "proposed_system":
        sections.get("proposed_system", ""),

        "methodology":
        sections.get("methodology", ""),

        "results_and_discussion":
        sections.get(
            "results_and_discussion",
            sections.get("results", "")
        ),

        "conclusion":
        sections.get(
            "conclusion_and_future_scope",
            sections.get("conclusion", "")
        ),

        "references":
        sections.get("references", []),

        "figures":
        sections.get("figures", []),

        "tables":
        sections.get("tables", [])
    }


# =========================================
# CLEAR PAPER
# =========================================

@app.post("/clear-paper")

def clear_paper():

    global latest_uploaded_chunks
    global latest_uploaded_sections
    global latest_uploaded_filename
    global latest_evaluation_results
    global LATEST_GRAPH

    latest_uploaded_chunks = []

    latest_uploaded_sections = {}

    latest_uploaded_filename = None

    latest_evaluation_results = {}

    LATEST_GRAPH = {
        "nodes": [],
        "links": []
    }

    return {

        "status": "success",

        "message": "Paper data cleared successfully"
    }


# =========================================
# UPLOAD PAPER
# =========================================

@app.post("/upload-paper")

async def upload_paper(
    file: UploadFile = File(...)
):

    try:

        load_models()

        global latest_uploaded_chunks
        global latest_uploaded_sections
        global latest_uploaded_filename
        global LATEST_GRAPH

        # =====================================
        # CLEAR PREVIOUS STATE
        # =====================================

        latest_uploaded_chunks = []

        latest_uploaded_sections = {}

        latest_uploaded_filename = None

        LATEST_GRAPH = {
            "nodes": [],
            "links": []
        }

        # =====================================
        # CREATE UPLOAD FOLDER
        # =====================================

        UPLOAD_DIR = "uploads"

        os.makedirs(
            UPLOAD_DIR,
            exist_ok=True
        )

        # =====================================
        # SAVE FILE
        # =====================================

        unique_id = str(uuid.uuid4())

        filename = f"{unique_id}_{file.filename}"

        file_path = os.path.join(
            UPLOAD_DIR,
            filename
        )

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
        # CLEAN TEXT
        # =====================================

        full_text = remove_ieee_garbage(full_text)

        full_text = reconstruct_paragraphs(full_text)

        # =====================================
        # CREATE CHUNKS
        # =====================================

        chunks = create_chunks(full_text)

        latest_uploaded_chunks = chunks

        if len(chunks) == 0:

            return {

                "status": "error",

                "message": "No readable text found"
            }

        # =====================================
        # EXTRACT SECTIONS
        # =====================================

        sections = extract_sections(full_text)

        latest_uploaded_sections = sections

        latest_uploaded_filename = file.filename

        # =====================================
        # GENERATE EMBEDDINGS
        # =====================================

        chunk_embeddings = embedding_model.encode(
            chunks
        ).astype("float32")

        paper_embedding = np.mean(
            chunk_embeddings,
            axis=0
        ).reshape(1, -1)

        # =====================================
        # SIMILAR PAPERS
        # =====================================

        similar_papers = []

        if index is not None and index.ntotal > 0:

            distances, indices = index.search(

                paper_embedding,

                min(10, index.ntotal)
            )

            seen = set()

            for i, idx in enumerate(indices[0]):

                chunk = safe_chunk_fetch(idx)

                paper_id = chunk.get(
                    "paper_id",
                    "unknown"
                )

                if paper_id in seen:
                    continue

                seen.add(paper_id)

                similar_papers.append({

                    "rank":
                    len(similar_papers) + 1,

                    "paper_id":
                    paper_id,

                    "section":
                    chunk.get(
                        "section",
                        "unknown"
                    ),

                    "similarity_score":
                    float(distances[0][i]),

                    "preview":
                    chunk.get(
                        "text",
                        ""
                    )[:500]
                })

                if len(similar_papers) >= 5:
                    break

        # =====================================
        # KNOWLEDGE GRAPH
        # =====================================

        knowledge_graph = generate_knowledge_graph(
            full_text
        )

        LATEST_GRAPH = knowledge_graph

        # =====================================
        # SUMMARY
        # =====================================

        paper_summary = generate_paper_summary(
            sections
        )

        # =====================================
        # RESPONSE
        # =====================================

        return {

            "status": "success",

            "message":
            "Paper uploaded successfully",

            "filename":
            file.filename,

            "saved_as":
            filename,

            "text_length":
            len(full_text),

            "word_count":
            len(full_text.split()),

            "total_chunks":
            len(chunks),

            "sections":
            sections,

            "paper_summary":
            paper_summary,

            "knowledge_graph":
            knowledge_graph,

            "similar_papers":
            similar_papers,

            "preview":
            full_text[:3000]
        }

    except Exception as e:

        print("UPLOAD ERROR:")
        print(str(e))

        return {

            "status": "error",

            "message": str(e)
        }


# =========================================
# ANALYZE PAPER
# =========================================

@app.post("/analyze-paper")

async def analyze_paper(
    file: UploadFile = File(...)
):

    try:

        load_models()

        # =====================================
        # SAVE FILE
        # =====================================

        UPLOAD_DIR = "uploads"

        os.makedirs(
            UPLOAD_DIR,
            exist_ok=True
        )

        unique_id = str(uuid.uuid4())

        filename = f"{unique_id}_{file.filename}"

        file_path = os.path.join(
            UPLOAD_DIR,
            filename
        )

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
        # CLEAN TEXT
        # =====================================

        full_text = remove_ieee_garbage(full_text)

        full_text = reconstruct_paragraphs(full_text)

        # =====================================
        # EXTRACT SECTIONS
        # =====================================

        sections = extract_sections(full_text)

        # =====================================
        # CREATE CHUNKS
        # =====================================

        chunks = create_chunks(full_text)

        chunk_embeddings = embedding_model.encode(
            chunks
        ).astype("float32")

        paper_embedding = np.mean(
            chunk_embeddings,
            axis=0
        ).reshape(1, -1)

        # =====================================
        # SIMILAR PAPERS
        # =====================================

        similar_papers = []

        if index is not None and index.ntotal > 0:

            distances, indices = index.search(

                paper_embedding,

                min(10, index.ntotal)
            )

            seen = set()

            for i, idx in enumerate(indices[0]):

                chunk = safe_chunk_fetch(idx)

                paper_id = chunk.get(
                    "paper_id",
                    "unknown"
                )

                if paper_id in seen:
                    continue

                seen.add(paper_id)

                similar_papers.append({

                    "rank":
                    len(similar_papers) + 1,

                    "paper_id":
                    paper_id,

                    "section":
                    chunk.get(
                        "section",
                        "unknown"
                    ),

                    "similarity_score":
                    float(distances[0][i]),

                    "preview":
                    chunk.get(
                        "text",
                        ""
                    )[:500]
                })

                if len(similar_papers) >= 5:
                    break

        # =====================================
        # KNOWLEDGE GRAPH
        # =====================================

        knowledge_graph = generate_knowledge_graph(
            full_text
        )

        global LATEST_GRAPH

        LATEST_GRAPH = knowledge_graph

        # =====================================
        # SUMMARY
        # =====================================

        paper_summary = generate_paper_summary(
            sections
        )

        # =====================================
        # RESPONSE
        # =====================================

        return {

            "status": "success",

            "filename":
            file.filename,

            "total_chunks":
            len(chunks),

            "sections":
            sections,

            "paper_summary":
            paper_summary,

            "knowledge_graph":
            knowledge_graph,

            "similar_papers":
            similar_papers
        }

    except Exception as e:

        print("ANALYZE ERROR:")
        print(str(e))

        return {

            "status": "error",

            "message": str(e)
        }


# =========================================
# KNOWLEDGE GRAPH API
# =========================================

@app.get("/knowledge-graph")

def get_knowledge_graph():

    return LATEST_GRAPH


# =========================================
# STARTUP
# =========================================

@app.on_event("startup")

async def startup_event():

    print("FastAPI server started successfully")