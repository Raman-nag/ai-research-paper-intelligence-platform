import React, { useEffect, useState } from "react";

import {
    ArrowRight,
    Database,
    Brain,
    Network,
    Zap,
    FileText,
    Cpu,
    Search,
    BookOpen,
    BarChart3,
    Sparkles,
    ShieldCheck,
    Bot,
    Workflow
} from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";

import "./HomePage.css";

const HomePage = () => {

    const [stats, setStats] = useState(null);

    useEffect(() => {

        fetch("https://ai-research-paper-intelligence-platform.onrender.com/stats")
            .then((res) => res.json())
            .then((data) => {
                setStats(data);
            })
            .catch((err) => {
                console.error(err);
            });

    }, []);

    const statCards = [
        {
            label: "Research Papers",
            value: stats
                ? stats.papers_indexed
                : "427"
        },
        {
            label: "Semantic Chunks",
            value: stats
                ? stats.semantic_chunks.toLocaleString()
                : "12,795"
        },
        {
            label: "Vector Dimensions",
            value: stats
                ? stats.vector_dimensions
                : "384"
        },
        {
            label: "Knowledge Relations",
            value: stats
                ? stats.graph_relations || 1842
                : "1,842"
        }
    ];

    const features = [
        {
            icon: <Brain size={28} />,
            title: "Semantic AI Retrieval",
            description:
                "Uses transformer embeddings and semantic similarity instead of traditional keyword matching."
        },
        {
            icon: <Network size={28} />,
            title: "Dynamic Knowledge Graph",
            description:
                "Automatically generates connected scientific concepts and semantic relationships."
        },
        {
            icon: <Bot size={28} />,
            title: "AI Research Assistant",
            description:
                "Understands uploaded research papers and answers questions contextually."
        },
        {
            icon: <Search size={28} />,
            title: "FAISS Vector Search",
            description:
                "Performs ultra-fast semantic retrieval using vector similarity indexing."
        },
        {
            icon: <Workflow size={28} />,
            title: "Research Intelligence Pipeline",
            description:
                "Combines NLP, embeddings, chunking, graph extraction, and semantic reasoning."
        },
        {
            icon: <BarChart3 size={28} />,
            title: "AI Evaluation Dashboard",
            description:
                "Visualizes semantic intelligence, graph analytics, research complexity, and technology insights."
        }
    ];

    const workflow = [
        "Upload Research PDF",
        "Extract Text & IEEE Sections",
        "Generate Semantic Chunks",
        "Create Transformer Embeddings",
        "Store in FAISS Vector Database",
        "Generate Knowledge Graph",
        "Enable AI Semantic Retrieval",
        "Visualize AI Insights"
    ];

    return (

        <div className="home-page">

            {/* HERO SECTION */}

            <section className="hero-section">

                <div className="hero-left">

                    <div className="hero-badge">
                        NEXT GEN AI RESEARCH INTELLIGENCE
                    </div>

                    <h1 className="hero-title">

                        Transform Research Papers Into

                        <span className="gradient-text">
                            {" "}Semantic AI Intelligence
                        </span>

                    </h1>

                    <p className="hero-subtitle">

                        AI-powered research intelligence platform using
                        NLP, semantic retrieval, transformer embeddings,
                        vector databases, knowledge graphs, and AI-assisted reasoning
                        to understand scientific papers contextually.

                    </p>

                    <div className="hero-actions">

                        <Button
                            variant="primary"
                            icon={<Zap size={18} />}
                        >
                            Launch AI Pipeline
                        </Button>

                        <Button
                            variant="ghost"
                            icon={<ArrowRight size={18} />}
                        >
                            Explore Features
                        </Button>

                    </div>

                    <div className="hero-mini-stats">

                        <div className="mini-stat">

                            <Cpu size={18} />

                            <span>
                                Transformer Embeddings
                            </span>

                        </div>

                        <div className="mini-stat">

                            <Database size={18} />

                            <span>
                                FAISS Vector Search
                            </span>

                        </div>

                        <div className="mini-stat">

                            <Sparkles size={18} />

                            <span>
                                AI Semantic Reasoning
                            </span>

                        </div>

                    </div>

                </div>

                {/* RIGHT VISUAL */}

                <div className="hero-right">

                    <div className="ai-visual-container">

                        <div className="central-core">

                            <Brain size={40} />

                        </div>

                        <div className="orbit orbit-one">
                            <div className="orbit-node cyan-node">
                                <FileText size={20} />
                            </div>
                        </div>

                        <div className="orbit orbit-two">
                            <div className="orbit-node pink-node">
                                <Search size={20} />
                            </div>
                        </div>

                        <div className="orbit orbit-three">
                            <div className="orbit-node purple-node">
                                <Network size={20} />
                            </div>
                        </div>

                        <div className="floating-card card-one">
                            NLP
                        </div>

                        <div className="floating-card card-two">
                            LLM
                        </div>

                        <div className="floating-card card-three">
                            VECTOR AI
                        </div>

                    </div>

                </div>

            </section>

            {/* STATS */}

            <section className="stats-section">

                {statCards.map((stat, index) => (

                    <Card
                        key={index}
                        className="stat-card"
                    >

                        <h2 className="stat-value">
                            {stat.value}
                        </h2>

                        <p className="stat-label">
                            {stat.label}
                        </p>

                    </Card>

                ))}

            </section>

            {/* WHY UNIQUE */}

            <section className="unique-section">

                <div className="section-header">

                    <h2>
                        Why This Platform Is Different
                    </h2>

                    <p>
                        Unlike traditional research search systems,
                        this platform understands semantic meaning,
                        contextual relationships, and engineering concepts.
                    </p>

                </div>

                <div className="unique-grid">

                    <div className="unique-card">

                        <ShieldCheck size={34} />

                        <h3>
                            Contextual Understanding
                        </h3>

                        <p>
                            AI understands meaning and relationships
                            instead of matching simple keywords.
                        </p>

                    </div>

                    <div className="unique-card">

                        <BookOpen size={34} />

                        <h3>
                            IEEE Paper Intelligence
                        </h3>

                        <p>
                            Automatically extracts abstract,
                            methodology, results, and conclusions.
                        </p>

                    </div>

                    <div className="unique-card">

                        <Bot size={34} />

                        <h3>
                            AI Research Assistant
                        </h3>

                        <p>
                            Conversational AI capable of answering
                            questions directly from uploaded papers.
                        </p>

                    </div>

                </div>

            </section>

            {/* WORKFLOW */}

            <section className="workflow-section">

                <div className="section-header">

                    <h2>
                        AI Processing Workflow
                    </h2>

                    <p>
                        End-to-end intelligent semantic research pipeline.
                    </p>

                </div>

                <div className="workflow-grid">

                    {workflow.map((step, index) => (

                        <div
                            className="workflow-card"
                            key={index}
                        >

                            <div className="workflow-number">
                                {index + 1}
                            </div>

                            <p>
                                {step}
                            </p>

                        </div>

                    ))}

                </div>

            </section>

            {/* FEATURES */}

            <section className="features-section">

                <div className="section-header">

                    <h2>
                        Core AI Features
                    </h2>

                    <p>
                        Enterprise-grade semantic research intelligence system.
                    </p>

                </div>

                <div className="features-grid">

                    {features.map((feature, index) => (

                        <Card
                            key={index}
                            className="feature-card"
                        >

                            <div className="feature-icon">
                                {feature.icon}
                            </div>

                            <h3>
                                {feature.title}
                            </h3>

                            <p>
                                {feature.description}
                            </p>

                        </Card>

                    ))}

                </div>

            </section>

        </div>

    );
};

export default HomePage;