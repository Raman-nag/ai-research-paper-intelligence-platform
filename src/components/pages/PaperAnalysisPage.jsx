import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Loader2, BrainCircuit } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import "./PaperAnalysisPage.css";

const API_BASE = "https://ai-research-paper-intelligence-platform.onrender.com";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function PaperAnalysisPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const storedAnalysis = sessionStorage.getItem("current_analysis");
        if (storedAnalysis) {
            setAnalysis(JSON.parse(storedAnalysis));
        }
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a PDF");
            return;
        }

        try {
            sessionStorage.removeItem("current_analysis");
            setAnalysis(null);
            setLoading(true);

            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch(`${API_BASE}/analyze-paper`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.knowledge_graph) {
                if (data.knowledge_graph.edges && !data.knowledge_graph.links) {
                    data.knowledge_graph.links = data.knowledge_graph.edges;
                }
            }

            sessionStorage.setItem("current_analysis", JSON.stringify(data));
            setAnalysis(data);

        } catch (error) {
            console.error(error);
            alert("Paper upload failed");
        } finally {
            setLoading(false);
        }
    };

    const SectionCard = ({ title, content }) => (
        <Card className="section-card" glowColor="purple">
            <h2 className="section-title">{title}</h2>
            <div className="section-content">
                {content ? content : <span className="text-muted">No section detected.</span>}
            </div>
        </Card>
    );

    return (
        <motion.div 
            className="paper-analysis-page"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="analysis-container">
                <motion.div className="page-header" variants={itemVariants}>
                    <h1 className="page-title">AI Research <span className="text-gradient">Paper Intelligence</span></h1>
                    <p className="page-subtitle">
                        Upload research papers for semantic analysis, intelligent summaries, semantic retrieval, AI assistance, and dynamic knowledge graphs.
                    </p>
                </motion.div>

                {/* UPLOAD SECTION */}
                <motion.div variants={itemVariants}>
                    <Card className="upload-card">
                        <div className="upload-zone" onClick={triggerFileInput}>
                            <input
                                type="file"
                                accept=".pdf"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <UploadCloud size={48} className="upload-icon" />
                            <h3>{selectedFile ? selectedFile.name : "Drag & Drop or Click to Upload PDF"}</h3>
                            <p className="text-muted">Maximum file size: 50MB</p>
                        </div>
                        
                        <div className="upload-actions flex-center">
                            <Button 
                                variant="primary" 
                                icon={loading ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
                                onClick={handleUpload}
                                disabled={loading || !selectedFile}
                            >
                                {loading ? "Analyzing Paper..." : "Analyze Paper"}
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* LOADING */}
                {loading && (
                    <motion.div variants={itemVariants} className="loading-container flex-center">
                        <Card className="loading-card" glowColor="cyan">
                            <Loader2 size={48} className="animate-spin text-cyan mb-4" />
                            <h2>Processing Research Paper</h2>
                            <div className="loading-steps">
                                <p>Extracting text...</p>
                                <p>Creating semantic chunks...</p>
                                <p>Generating embeddings...</p>
                                <p>Building knowledge graph...</p>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* RESULTS */}
                {analysis && !loading && (
                    <motion.div className="analysis-results" variants={containerVariants}>
                        
                        {/* STATS */}
                        <div className="stats-grid">
                            <Card className="stat-card" variants={itemVariants}>
                                <h3>Uploaded Paper</h3>
                                <p className="text-gradient truncate" title={analysis.filename}>{analysis.filename}</p>
                            </Card>
                            <Card className="stat-card" variants={itemVariants}>
                                <h3>Semantic Chunks</h3>
                                <p className="text-gradient">{analysis.total_chunks}</p>
                            </Card>
                            <Card className="stat-card" variants={itemVariants}>
                                <h3>Similar Papers</h3>
                                <p className="text-gradient">{analysis.similar_papers?.length || 0}</p>
                            </Card>
                            <Card className="stat-card" variants={itemVariants}>
                                <h3>Knowledge Nodes</h3>
                                <p className="text-gradient">{analysis?.knowledge_graph?.nodes?.length || 0}</p>
                            </Card>
                        </div>

                        {/* SECTIONS */}
                        <motion.div className="sections-grid" variants={containerVariants}>
                            <SectionCard title="Abstract" content={analysis.sections?.abstract} />
                            <SectionCard title="Introduction" content={analysis.sections?.introduction} />
                            <SectionCard title="Methodology" content={analysis.sections?.methodology} />
                            <SectionCard title="Results" content={analysis.sections?.results} />
                            <SectionCard title="Conclusion" content={analysis.sections?.conclusion} />
                        </motion.div>

                        {/* SIMILAR PAPERS */}
                        {analysis.similar_papers && analysis.similar_papers.length > 0 && (
                            <motion.div className="similar-papers-container" variants={itemVariants}>
                                <h2 className="section-title mb-6">Similar Research Papers</h2>
                                <div className="similar-papers-grid">
                                    {analysis.similar_papers.map((paper, index) => (
                                        <Card key={index} className="paper-card" glowColor="cyan">
                                            <div className="paper-top">
                                                <div className="paper-info">
                                                    <h3><FileText size={18} /> {paper.paper_id}</h3>
                                                    <span className="badge-outline">Section: {paper.section}</span>
                                                </div>
                                                <div className="similarity-box">
                                                    {Number(paper.similarity_score).toFixed(3)}
                                                </div>
                                            </div>
                                            <div className="paper-preview">
                                                {paper.preview}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}