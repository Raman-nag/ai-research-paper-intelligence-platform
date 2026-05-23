import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowRight, Database, Brain, Network, Zap,
    FileText, Cpu, Search, BookOpen, BarChart3,
    Sparkles, ShieldCheck, Bot, Workflow
} from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Hero3D from "../ui/Hero3D";
import WorkflowImage from "../../assets/Arxiv_workflow.png";
import ArchitectureImage from "../../assets/Arxiv_system_arch.png";
import KnowledgeGraphImage from "../../assets/Arxiv_knowledge_graph.png";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const HomePage = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/stats")
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch((err) => console.error(err));
    }, []);

    const statCards = [
        { label: "Research Papers", value: stats ? stats.papers_indexed : "427" },
        { label: "Semantic Chunks", value: stats ? stats.semantic_chunks.toLocaleString() : "12,795" },
        { label: "Vector Dimensions", value: stats ? stats.vector_dimensions : "384" },
        { label: "Knowledge Relations", value: stats ? stats.graph_relations || 1842 : "1,842" }
    ];
    const navigate = useNavigate();

    const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
        section.scrollIntoView({
        behavior: "smooth",
        block: "start",
        });
    }
    };
    const features = [
        { icon: <Brain size={28} />, title: "Semantic AI Retrieval", description: "Uses transformer embeddings and semantic similarity instead of traditional keyword matching." },
        { icon: <Network size={28} />, title: "Dynamic Knowledge Graph", description: "Automatically generates connected scientific concepts and semantic relationships." },
        { icon: <Bot size={28} />, title: "AI Research Assistant", description: "Understands uploaded research papers and answers questions contextually." },
        { icon: <Search size={28} />, title: "FAISS Vector Search", description: "Performs ultra-fast semantic retrieval using vector similarity indexing." },
        { icon: <Workflow size={28} />, title: "Research Intelligence Pipeline", description: "Combines NLP, embeddings, chunking, graph extraction, and semantic reasoning." },
        { icon: <BarChart3 size={28} />, title: "AI Evaluation Dashboard", description: "Visualizes semantic intelligence, graph analytics, research complexity, and technology insights." }
    ];

    const workflow = [
        "Upload Research PDF", "Extract Text & IEEE Sections", "Generate Semantic Chunks", "Create Transformer Embeddings",
        "Store in FAISS Vector Database", "Generate Knowledge Graph", "Enable AI Semantic Retrieval", "Visualize AI Insights"
    ];

    return (
        <motion.div 
            className="home-page"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* HERO SECTION */}
            <section className="hero-section">
                <motion.div className="hero-left" variants={itemVariants}>
                    <div className="hero-badge">NEXT GEN AI RESEARCH INTELLIGENCE</div>
                    <h1 className="hero-title">
                        Transform Research Papers Into
                        <span className="gradient-text">{" "}Semantic AI Intelligence</span>
                    </h1>
                    <p className="hero-subtitle">
                        AI-powered research intelligence platform using NLP, semantic retrieval, transformer embeddings, vector databases, knowledge graphs, and AI-assisted reasoning to understand scientific papers contextually.
                    </p>
                    <div className="hero-actions">

                    <Button
                        variant="primary"
                        icon={<Zap size={18} />}
                        onClick={() => navigate("/paper-analysis")}
                    >
                        Launch AI Pipeline
                    </Button>

                    <Button
                        variant="ghost"
                        icon={<ArrowRight size={18} />}
                        onClick={() => scrollToSection("system-architecture")}
                    >
                        System Architecture
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => scrollToSection("workflow-section")}
                    >
                        Workflow
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => scrollToSection("knowledge-graph-section")}
                    >
                        Knowledge Graph
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => scrollToSection("features-section")}
                    >
                        AI Features
                    </Button>

                    </div>
                    <div className="hero-mini-stats">
                        <div className="mini-stat"><Cpu size={18} /><span>Transformer Embeddings</span></div>
                        <div className="mini-stat"><Database size={18} /><span>FAISS Vector Search</span></div>
                        <div className="mini-stat"><Sparkles size={18} /><span>AI Semantic Reasoning</span></div>
                    </div>
                </motion.div>

                {/* RIGHT VISUAL (3D HERO) */}
                <motion.div className="hero-right" variants={itemVariants}>
                    <Hero3D />
                </motion.div>
            </section>

            {/* STATS */}
            <motion.section className="stats-section" variants={containerVariants}>
                {statCards.map((stat, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <Card className="stat-card">
                            <h2 className="stat-value">{stat.value}</h2>
                            <p className="stat-label">{stat.label}</p>
                        </Card>
                    </motion.div>
                ))}
            </motion.section>

            {/* WHY UNIQUE */}
            <motion.section className="unique-section" variants={containerVariants}>
                <motion.div className="section-header" variants={itemVariants}>
                    <h2>Why This Platform Is Different</h2>
                    <p>Unlike traditional research search systems, this platform understands semantic meaning, contextual relationships, and engineering concepts.</p>
                </motion.div>
                <div className="unique-grid">
                    {[
                        { icon: <ShieldCheck size={34} />, title: "Contextual Understanding", desc: "AI understands meaning and relationships instead of matching simple keywords." },
                        { icon: <BookOpen size={34} />, title: "IEEE Paper Intelligence", desc: "Automatically extracts abstract, methodology, results, and conclusions." },
                        { icon: <Bot size={34} />, title: "AI Research Assistant", desc: "Conversational AI capable of answering questions directly from uploaded papers." }
                    ].map((item, idx) => (
                        <motion.div key={idx} className="unique-card" variants={itemVariants}>
                            {item.icon}
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* SYSTEM ARCHITECTURE */}
            <motion.section
                className="visual-section"
                id="system-architecture"
                variants={containerVariants}
            >
                <motion.div
                    className="section-header"
                    variants={itemVariants}
                >
                    <h2>AI Research System Architecture</h2>

                    <p>
                        Complete end-to-end architecture of the AI-powered
                        semantic research intelligence platform using NLP,
                        transformer embeddings, FAISS vector search,
                        semantic retrieval, and dynamic knowledge graphs.
                    </p>
                </motion.div>

                <motion.div
                    className="visual-card"
                    variants={itemVariants}
                >
                    <img
                        src={ArchitectureImage}
                        alt="System Architecture"
                        className="visual-image"
                    />
                </motion.div>
            </motion.section>

            {/* AI WORKFLOW */}
            <motion.section
                className="visual-section"
                id="workflow-section"
                variants={containerVariants}
            >
                <motion.div
                    className="section-header"
                    variants={itemVariants}
                >
                    <h2>Complete AI Processing Workflow</h2>

                    <p>
                        Visual representation of the complete intelligent
                        research paper analysis pipeline from PDF upload
                        to semantic intelligence generation.
                    </p>
                </motion.div>

                <motion.div
                    className="visual-card"
                    variants={itemVariants}
                >
                    <img
                        src={WorkflowImage}
                        alt="Workflow"
                        className="visual-image"
                    />
                </motion.div>
            </motion.section>

            {/* KNOWLEDGE GRAPH */}
            <motion.section
                className="visual-section"
                id="knowledge-graph-section"
                variants={containerVariants}
            >
                <motion.div
                    className="section-header"
                    variants={itemVariants}
                >
                    <h2>Dynamic Knowledge Graph Generation</h2>

                    <p>
                        AI automatically extracts scientific concepts,
                        entities, and semantic relationships to generate
                        an intelligent interactive knowledge graph.
                    </p>
                </motion.div>

                <motion.div
                    className="visual-card"
                    variants={itemVariants}
                >
                    <img
                        src={KnowledgeGraphImage}
                        alt="Knowledge Graph"
                        className="visual-image"
                    />
                </motion.div>
            </motion.section>

            {/* FEATURES */}
            <motion.section className="features-section" id="features-section" variants={containerVariants}>
                <motion.div className="section-header" variants={itemVariants}>
                    <h2>Core AI Features</h2>
                    <p>Enterprise-grade semantic research intelligence system.</p>
                </motion.div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

        </motion.div>
    );
};

export default HomePage;