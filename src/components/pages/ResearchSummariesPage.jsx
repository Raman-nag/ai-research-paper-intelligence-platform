import React, { useEffect, useState } from "react";
import { FileText, Brain, BookOpen, Database, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import "./ResearchSummariesPage.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function ResearchSummariesPage() {
  const [paperData, setPaperData] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("current_analysis");
    if (stored) {
      setPaperData(JSON.parse(stored));
    }
  }, []);

  if (!paperData) {
    return (
      <motion.div 
        className="summaries-page"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="summaries-header">
          <motion.h2 className="page-title" variants={itemVariants}>
            AI Research <span className="text-gradient">Summaries</span>
          </motion.h2>
          <motion.p className="page-subtitle" variants={itemVariants}>
            Upload and analyze a research paper to generate semantic IEEE-style summaries.
          </motion.p>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="empty-summary-card" glowColor="pink">
            <AlertCircle size={48} className="text-pink mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gradient-pink">No Uploaded Paper Found</h2>
            <p className="text-muted text-center max-w-md">
              Go to the Paper Analysis page, upload a PDF, and generate AI-powered semantic summaries.
            </p>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  const sections = paperData.sections || {};
  const graph = paperData.knowledge_graph || {};
  const nodes = graph.nodes?.length || 0;
  const edges = graph.links?.length || graph.edges?.length || 0;
  const chunks = paperData.total_chunks || 0;

  return (
    <motion.div 
      className="summaries-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="summaries-header">
        <motion.h2 className="page-title" variants={itemVariants}>
          AI Research <span className="text-gradient">Summary</span>
        </motion.h2>
        <motion.p className="page-subtitle" variants={itemVariants}>
          Intelligent semantic summary generated from uploaded engineering research paper.
        </motion.p>
      </div>

      {/* TOP STATS */}
      <motion.div className="summary-stats-grid" variants={containerVariants}>
        <Card className="summary-stat-card" variants={itemVariants}>
          <FileText size={26} className="text-cyan mb-3" />
          <h3>Uploaded Paper</h3>
          <p className="summary-small-text text-muted">{paperData.filename}</p>
        </Card>

        <Card className="summary-stat-card" variants={itemVariants}>
          <Database size={26} className="text-purple mb-3" />
          <h3>Semantic Chunks</h3>
          <p className="text-2xl font-bold text-gradient">{chunks}</p>
        </Card>

        <Card className="summary-stat-card" variants={itemVariants}>
          <BookOpen size={26} className="text-pink mb-3" />
          <h3>Knowledge Nodes</h3>
          <p className="text-2xl font-bold text-gradient-pink">{nodes}</p>
        </Card>

        <Card className="summary-stat-card" variants={itemVariants}>
          <Brain size={26} className="text-cyan mb-3" />
          <h3>Graph Relations</h3>
          <p className="text-2xl font-bold text-gradient">{edges}</p>
        </Card>
      </motion.div>

      {/* MAIN SUMMARY */}
      <motion.div variants={itemVariants}>
        <Card className="summary-main-card" glowColor="cyan">
          <div className="summary-top">
            <div>
              <h2 className="text-2xl font-bold text-gradient mb-1">{paperData.filename}</h2>
              <p className="paper-type text-muted">IEEE Research Intelligence Summary</p>
            </div>
            <Badge variant="cyan">AI Generated</Badge>
          </div>

          <div className="summary-content">
            {['abstract', 'introduction', 'methodology', 'results', 'conclusion'].map((sectionName) => (
              <div key={sectionName} className="summary-section">
                <h3 className="section-title text-cyan capitalize mb-2">{sectionName}</h3>
                <p className="section-text text-muted leading-relaxed">
                  {sections[sectionName] || "Not detected"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}