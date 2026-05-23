import React, { useState } from 'react';
import { Search, Filter, Database, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import './SemanticSearchPage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const SemanticSearchPage = () => {
  const [query, setQuery] = useState('');
  const [uploadedResults, setUploadedResults] = useState([]);
  const [relatedResults, setRelatedResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, `<span class="highlight-query">$1</span>`);
  };

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      const sortedResults = (data.results || []).sort(
        (a, b) => a.similarity_score - b.similarity_score
      );

      setUploadedResults(data.uploaded_pdf_matches || []);
      setRelatedResults(sortedResults);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      runSearch();
    }
  };

  return (
    <motion.div 
      className="search-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="search-header">
        <motion.h2 className="page-title" variants={itemVariants}>
          Semantic <span className="text-gradient">Search</span>
        </motion.h2>
        <motion.p className="page-subtitle" variants={itemVariants}>
          Search inside uploaded research paper first, then retrieve related papers from vector database.
        </motion.p>
      </div>

      <motion.div className="search-bar-container glass-panel" variants={itemVariants}>
        <Search className="search-icon" size={24} />
        <input
          type="text"
          className="search-input brand-font"
          placeholder="Search concepts, methods, models, results..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="filter-btn" onClick={runSearch}>
          <Filter size={20} />
        </button>
      </motion.div>

      <motion.div className="results-meta" variants={itemVariants}>
        <span>
          {loading
            ? 'Searching uploaded paper and research database...'
            : searched
              ? `Retrieved ${relatedResults.length} related papers`
              : 'Enter query to begin semantic retrieval'}
        </span>
        <span className="query-time">FAISS Retrieval Active</span>
      </motion.div>

      {/* UPLOADED PAPER RESULTS */}
      {searched && (
        <motion.div variants={containerVariants} className="results-section">
          <motion.h3 className="section-title mb-6 flex items-center gap-2" variants={itemVariants}>
            <BookOpen size={24} className="text-pink" /> Uploaded PDF Results
          </motion.h3>

          {uploadedResults.length > 0 ? (
            <div className="results-list">
              {uploadedResults.map((result, index) => (
                <Card key={index} className="result-card" glowColor="pink" variants={itemVariants}>
                  <div className="result-header">
                    <div>
                      <h3 className="result-title text-gradient-pink">Uploaded Research Paper</h3>
                      <div className="result-id">Section: {result.section}</div>
                    </div>
                  </div>
                  <p
                    className="result-abstract"
                    dangerouslySetInnerHTML={{
                      __html: highlightText(result.text, query)
                    }}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <Card className="result-card" variants={itemVariants}>
              <h3 style={{ color: 'var(--neon-pink)', marginBottom: '1rem' }}>
                No relevant content found in uploaded PDF
              </h3>
              <p className="page-subtitle">Retrieving related papers from research database...</p>
            </Card>
          )}
        </motion.div>
      )}

      {/* RELATED PAPERS */}
      {relatedResults.length > 0 && (
        <motion.div variants={containerVariants} className="results-section mt-8">
          <motion.h3 className="section-title mb-6 flex items-center gap-2" variants={itemVariants}>
            <Database size={24} className="text-cyan" /> Related Research Papers
          </motion.h3>

          <div className="results-list">
            {relatedResults.map((paper, index) => (
              <Card key={index} className="result-card" glowColor="cyan" variants={itemVariants}>
                <div className="result-header">
                  <div>
                    <h3 className="result-title text-gradient">{paper.paper_id}</h3>
                    <div className="result-id">Section: {paper.section}</div>
                  </div>
                  <div className="similarity-badge">
                    <span className="sim-label">AI MATCH</span>
                    <span className="sim-value text-gradient">
                      {paper.similarity_score ? paper.similarity_score.toFixed(3) : "0.90"}
                    </span>
                  </div>
                </div>

                <p
                  className="result-abstract"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(paper.text, query)
                  }}
                />

                <div className="result-footer">
                  <div className="result-tags">
                    <Badge variant="cyan">Semantic AI</Badge>
                    <Badge variant="purple">FAISS</Badge>
                    <Badge variant="cyan">Research</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SemanticSearchPage;