import React, { useState } from 'react';

import {
  Search,
  Filter
} from 'lucide-react';

import Card from '../ui/Card';
import Badge from '../ui/Badge';

import './SemanticSearchPage.css';

const SemanticSearchPage = () => {

  // =========================================
  // STATES
  // =========================================

  const [query, setQuery] = useState('');

  const [uploadedResults, setUploadedResults] = useState([]);

  const [relatedResults, setRelatedResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [searched, setSearched] = useState(false);

  // =========================================
  // HIGHLIGHT QUERY
  // =========================================

  const highlightText = (text, query) => {

    if (!query) return text;

    const regex = new RegExp(
      `(${query})`,
      'gi'
    );

    return text.replace(

      regex,

      `<span class="highlight-query">$1</span>`

    );

  };

  // =========================================
  // SEARCH
  // =========================================

  const runSearch = async () => {

    if (!query.trim()) return;

    setLoading(true);

    setSearched(true);

    try {

      const response = await fetch(

        `http://127.0.0.1:8000/search?query=${encodeURIComponent(query)}`

      );

      const data = await response.json();

      // =====================================
      // SORT BY AI MATCH
      // =====================================

      const sortedResults = (data.results || []).sort(

        (a, b) =>

          b.similarity_score - a.similarity_score

      );

      setUploadedResults(
        data.uploaded_pdf_matches || []
      );

      setRelatedResults(
        sortedResults
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  // =========================================
  // ENTER SEARCH
  // =========================================

  const handleKeyDown = (e) => {

    if (e.key === 'Enter') {

      runSearch();

    }

  };

  return (

    <div className="search-page animate-fade-in">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="search-header">

        <h2 className="page-title">

          Semantic Search

        </h2>

        <p className="page-subtitle">

          Search inside uploaded research paper first,
          then retrieve related papers from vector database.

        </p>

      </div>

      {/* ===================================== */}
      {/* SEARCH BAR */}
      {/* ===================================== */}

      <div className="search-bar-container glass-panel">

        <Search
          className="search-icon"
          size={24}
        />

        <input

          type="text"

          className="search-input brand-font"

          placeholder="Search concepts, methods, models, results..."

          value={query}

          onChange={(e) => setQuery(e.target.value)}

          onKeyDown={handleKeyDown}

        />

        <button

          className="filter-btn"

          onClick={runSearch}

        >

          <Filter size={20} />

        </button>

      </div>

      {/* ===================================== */}
      {/* META */}
      {/* ===================================== */}

      <div className="results-meta">

        <span>

          {

            loading

              ? 'Searching uploaded paper and research database...'

              : searched

                ? `Retrieved ${relatedResults.length} related papers`

                : 'Enter query to begin semantic retrieval'

          }

        </span>

        <span className="query-time">

          FAISS Retrieval Active

        </span>

      </div>

      {/* ===================================== */}
      {/* UPLOADED PAPER RESULTS */}
      {/* ===================================== */}

      {

        searched && (

          <div>

            <h3 className="uploaded-result-title">

              Uploaded PDF Results

            </h3>

            {

              uploadedResults.length > 0 ? (

                <div className="results-list">

                  {

                    uploadedResults.map((result, index) => (

                      <Card
                        key={index}
                        className="result-card"
                      >

                        <div className="result-header">

                          <div>

                            <h3 className="result-title">

                              Uploaded Research Paper

                            </h3>

                            <div className="result-id">

                              Section:
                              {result.section}

                            </div>

                          </div>

                        </div>

                        <p

                          className="result-abstract"

                          dangerouslySetInnerHTML={{
                            __html: highlightText(
                              result.text,
                              query
                            )
                          }}

                        />

                      </Card>

                    ))

                  }

                </div>

              ) : (

                <Card className="result-card">

                  <h3
                    style={{
                      color: 'var(--neon-pink)',
                      marginBottom: '1rem'
                    }}
                  >

                    No relevant content found in uploaded PDF

                  </h3>

                  <p className="page-subtitle">

                    Retrieving related papers from research database...

                  </p>

                </Card>

              )

            }

          </div>

        )

      }

      {/* ===================================== */}
      {/* RELATED PAPERS */}
      {/* ===================================== */}

      {

        relatedResults.length > 0 && (

          <div>

            <h3 className="related-paper-title">

              Related Research Papers

            </h3>

            <div className="results-list">

              {

                relatedResults.map((paper, index) => (

                  <Card

                    key={index}

                    className="result-card"

                  >

                    {/* HEADER */}

                    <div className="result-header">

                      <div>

                        <h3 className="result-title">

                          {paper.paper_id}

                        </h3>

                        <div className="result-id">

                          Section:
                          {paper.section}

                        </div>

                      </div>

                      <div className="similarity-badge">

                        <span className="sim-label">

                          AI MATCH

                        </span>

                        <span className="sim-value text-gradient">

                          {

                            paper.similarity_score
                              ? paper.similarity_score.toFixed(3)
                              : "0.90"

                          }

                        </span>

                      </div>

                    </div>

                    {/* TEXT */}

                    <p

                      className="result-abstract"

                      dangerouslySetInnerHTML={{

                        __html: highlightText(

                          paper.text,

                          query

                        )

                      }}

                    />

                    {/* FOOTER */}

                    <div className="result-footer">

                      <div className="result-tags">

                        <Badge variant="cyan">

                          Semantic AI

                        </Badge>

                        <Badge variant="purple">

                          FAISS

                        </Badge>

                        <Badge variant="cyan">

                          Research

                        </Badge>

                      </div>

                    </div>

                  </Card>

                ))

              }

            </div>

          </div>

        )

      }

    </div>

  );

};

export default SemanticSearchPage;