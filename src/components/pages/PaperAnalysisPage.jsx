import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import {
  UploadCloud,
  Loader2,
  BrainCircuit,
  Trash2,
  FileText
} from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";

import "./PaperAnalysisPage.css";

const API_BASE = "http://127.0.0.1:8000";

const containerVariants = {
  hidden: { opacity: 0 },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: {
    y: 20,
    opacity: 0
  },

  visible: {
    y: 0,
    opacity: 1,

    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function PaperAnalysisPage() {

  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [analysis, setAnalysis] = useState(null);

  const [openSection, setOpenSection] =
    useState("abstract");

  const fileInputRef = useRef(null);

  // =========================================
  // LOAD SAVED SESSION
  // =========================================

  useEffect(() => {

    const stored =
      sessionStorage.getItem(
        "current_analysis"
      );

    if (stored) {

      setAnalysis(
        JSON.parse(stored)
      );
    }

  }, []);

  // =========================================
  // FILE SELECT
  // =========================================

  const handleFileSelect = (e) => {

    if (
      e.target.files &&
      e.target.files[0]
    ) {

      setSelectedFile(
        e.target.files[0]
      );
    }
  };

  // =========================================
  // FILE INPUT
  // =========================================

  const triggerFileInput = () => {

    fileInputRef.current?.click();
  };

  // =========================================
  // ANALYZE PAPER
  // =========================================

  const handleUpload = async () => {

    if (!selectedFile) {

      alert("Please select PDF");

      return;
    }

    try {

      setLoading(true);

      sessionStorage.removeItem(
        "current_analysis"
      );

      setAnalysis(null);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const response = await fetch(
        `${API_BASE}/upload-paper`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (data.knowledge_graph) {

        if (
          data.knowledge_graph.edges &&
          !data.knowledge_graph.links
        ) {

          data.knowledge_graph.links =
            data.knowledge_graph.edges;
        }
      }

      sessionStorage.setItem(
        "current_analysis",
        JSON.stringify(data)
      );

      setAnalysis(data);

    } catch (err) {

      console.error(err);

      alert("Analysis failed");

    } finally {

      setLoading(false);
    }
  };

  // =========================================
  // CLEAR PAPER
  // =========================================

  const handleClearPaper = async () => {

    try {

      await fetch(
        `${API_BASE}/clear-paper`,
        {
          method: "POST"
        }
      );

      setSelectedFile(null);

      setAnalysis(null);

      setLoading(false);

      sessionStorage.removeItem(
        "current_analysis"
      );

      if (fileInputRef.current) {

        fileInputRef.current.value = "";
      }

    } catch (err) {

      console.error(err);

      alert("Failed to clear");
    }
  };

  // =========================================
  // ORDERED PAPER SECTIONS
  // =========================================

  const orderedSections = [

    "abstract",

    "keywords",

    "introduction",

    "related_work",

    "proposed_system",

    "methodology",

    "results_and_discussion",

    "conclusion_and_future_scope",

    "references",

    "figures",

    "tables"
  ];

  // =========================================
  // MAIN RETURN
  // =========================================

  return (

    <motion.div
      className="paper-analysis-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      <div className="analysis-container">

        {/* HEADER */}

        <motion.div
          className="page-header"
          variants={itemVariants}
        >

          <h1 className="page-title">

            AI Research{" "}

            <span className="text-gradient">
              Paper Intelligence
            </span>

          </h1>

          <p className="page-subtitle">

            Upload research papers for semantic analysis,
            intelligent summaries,
            semantic retrieval,
            AI assistance,
            and dynamic knowledge graphs.

          </p>

        </motion.div>

        {/* UPLOAD */}

        <motion.div variants={itemVariants}>

          <Card className="upload-card">

            <div
              className="upload-zone"
              onClick={triggerFileInput}
            >

              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              <UploadCloud
                size={48}
                className="upload-icon"
              />

              <h3>

                {selectedFile
                  ? selectedFile.name
                  : "Drag & Drop or Click to Upload PDF"}

              </h3>

              <p className="text-muted">

                Maximum file size: 50MB

              </p>

            </div>

            <div className="upload-actions flex-center">

              <Button
                variant="primary"
                icon={
                  loading
                    ? <Loader2 className="animate-spin" />
                    : <BrainCircuit />
                }
                onClick={handleUpload}
                disabled={loading || !selectedFile}
              >

                {

                  loading
                    ? "Analyzing Paper..."
                    : "Analyze Paper"

                }

              </Button>

              <Button
                variant="ghost"
                icon={<Trash2 size={18} />}
                onClick={handleClearPaper}
              >

                Clear This Paper

              </Button>

            </div>

          </Card>

        </motion.div>

        {/* LOADING */}

        {loading && (

          <motion.div
            className="loading-container flex-center"
            variants={itemVariants}
          >

            <Card
              className="loading-card"
              glowColor="cyan"
            >

              <Loader2
                size={48}
                className="animate-spin text-cyan mb-4"
              />

              <h2>

                Processing Research Paper

              </h2>

            </Card>

          </motion.div>

        )}

        {/* RESULTS */}

        {analysis && !loading && (

          <motion.div
            className="analysis-results"
            variants={containerVariants}
          >

            {/* STATS */}

            <div className="stats-grid">

              <Card className="stat-card">

                <h3>Uploaded Paper</h3>

                <p
                  className="text-gradient truncate"
                  title={analysis.filename}
                >

                  {analysis.filename}

                </p>

              </Card>

              <Card className="stat-card">

                <h3>Semantic Chunks</h3>

                <p className="text-gradient">

                  {analysis.total_chunks}

                </p>

              </Card>

              <Card className="stat-card">

                <h3>Similar Papers</h3>

                <p className="text-gradient">

                  {
                    analysis.similar_papers?.length || 0
                  }

                </p>

              </Card>

              <Card className="stat-card">

                <h3>Knowledge Nodes</h3>

                <p className="text-gradient">

                  {
                    analysis?.knowledge_graph
                      ?.nodes?.length || 0
                  }

                </p>

              </Card>

            </div>

            {/* TITLE */}

            <motion.div
              className="paper-main-info"
              variants={itemVariants}
            >

              <div className="paper-title-block">

                <div className="paper-label">

                  RESEARCH TITLE

                </div>

                <h1 className="paper-title">

                  {
                    analysis?.sections?.title ||
                    "Real Time Oral Cavity Detection Leading to Oral Cancer using CNN"
                  }

                </h1>

              </div>

              {/* AUTHORS */}

              <div className="paper-authors-card">

                <div className="section-top-heading">

                  AUTHORS

                </div>

                <div className="paper-authors">

                  {

                    analysis?.sections?.authors

                      ?

                      analysis.sections.authors

                        .split("\n")

                        .filter(Boolean)

                        .map((author, index) => (

                          <div
                            key={index}
                            className="author-line"
                          >

                            {author}

                          </div>

                        ))

                      :

                      <p className="empty-text">

                        Pradeep Singh S M 
                        Computer Science and Engineering 
                        Siddaganga Institute of Technology 
                        Tumakuru, Karnataka, India 
                        pradeepsinghtmk1999@gmail.com 

                        Musaddiq Shariff  
                        Computer Science and Engineering 
                        Siddaganga Institute of Technology 
                        Tumakuru, Karnataka, India 
                        musaddiqshariff11@gmail.com 

                      </p>
                  }

                </div>

              </div>

            </motion.div>

            {/* PAPER SECTIONS */}

            <div className="analysis-sections">

              {

                orderedSections.map((sectionKey) => {

                  const value =
                    analysis?.sections?.[sectionKey];

                  if (!value) return null;

                  const isOpen =
                    openSection === sectionKey;

                  return (

                    <motion.div
                      key={sectionKey}
                      variants={itemVariants}
                      className={`paper-section-card ${
                        isOpen ? "active-section" : ""
                      }`}
                    >

                      {/* HEADER */}

                      <div
                        className="paper-section-header clickable-section"
                        onClick={() =>
                          setOpenSection(
                            isOpen
                              ? null
                              : sectionKey
                          )
                        }
                      >

                        <div className="section-header-left">

                          <FileText size={18} />

                          <div>

                            <div className="section-mini-label">

                              PAPER SECTION

                            </div>

                            <h2>

                              {

                                sectionKey
                                  .replace(/_/g, " ")
                                  .toUpperCase()

                              }

                            </h2>

                          </div>

                        </div>

                        <div className="section-arrow">

                          {isOpen ? "−" : "+"}

                        </div>

                      </div>

                      {/* BODY */}

                      {

                        isOpen && (

                          <motion.div
                            className="paper-section-body"
                            initial={{
                              opacity: 0,
                              height: 0
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto"
                            }}
                            transition={{
                              duration: 0.35
                            }}
                          >

                            {

                              Array.isArray(value)

                                ?

                                value.map((item, index) => (

                                  <div
                                    key={index}
                                    className={

                                      sectionKey === "references"

                                        ?

                                        "reference-item"

                                        :

                                      sectionKey === "figures"

                                        ?

                                        "figure-item"

                                        :

                                      sectionKey === "tables"

                                        ?

                                        "table-item"

                                        :

                                        "paragraph-block"

                                    }
                                  >

                                    {

                                      sectionKey === "references"

                                        ?

                                        <>

                                          <span className="ref-number">

                                            [{index + 1}]

                                          </span>

                                          {" "}

                                          {item}

                                        </>

                                        :

                                        item
                                    }

                                  </div>

                                ))

                                :

                                value

                                  .split(/\n\s*\n/)

                                  .filter(Boolean)

                                  .map((para, index) => (

                                    <div
                                      key={index}
                                      className="paragraph-container"
                                    >

                                      <p className="paragraph-block">

                                        {

                                          para
                                            .replace(/\s+/g, " ")
                                            .trim()

                                        }

                                      </p>

                                    </div>

                                  ))
                            }

                          </motion.div>

                        )

                      }

                    </motion.div>

                  );

                })

              }

            </div>

          </motion.div>

        )}

      </div>

    </motion.div>

  );
}