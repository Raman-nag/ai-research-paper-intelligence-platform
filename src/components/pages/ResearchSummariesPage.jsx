import React, {
    useEffect,
    useState
} from "react";

import {
    FileText,
    Brain,
    BookOpen,
    Database
} from "lucide-react";

import "./ResearchSummariesPage.css";

export default function ResearchSummariesPage() {

    const [paperData, setPaperData] =
        useState(null);

    // =========================================
    // LOAD CURRENT SESSION
    // =========================================

    useEffect(() => {

        const stored =
            sessionStorage.getItem(
                "current_analysis"
            );

        if (stored) {

            setPaperData(
                JSON.parse(stored)
            );

        }

    }, []);

    // =========================================
    // EMPTY STATE
    // =========================================

    if (!paperData) {

        return (

            <div className="summaries-page">

                <div className="summary-empty-state">

                    <Brain
                        size={60}
                        className="empty-summary-icon"
                    />

                    <h1>
                        AI Research Summaries
                    </h1>

                    <p>
                        Upload and analyze a
                        research paper to generate
                        semantic IEEE-style summaries.
                    </p>

                    <div className="empty-summary-card">

                        <div className="empty-icon">

                            📄

                        </div>

                        <h2>
                            No Uploaded Paper Found
                        </h2>

                        <p>
                            Go to the Paper Analysis page,
                            upload a PDF, and generate
                            AI-powered semantic summaries.
                        </p>

                    </div>

                </div>

            </div>

        );

    }

    // =========================================
    // EXTRACT DATA
    // =========================================

    const sections =
        paperData.sections || {};

    const graph =
        paperData.knowledge_graph || {};

    const nodes =
        graph.nodes?.length || 0;

    const edges =
        graph.links?.length ||
        graph.edges?.length || 0;

    const chunks =
        paperData.total_chunks || 0;

    return (

        <div className="summaries-page">

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="summaries-header">

                <h1>
                    AI Research Summary
                </h1>

                <p>
                    Intelligent semantic summary
                    generated from uploaded
                    engineering research paper.
                </p>

            </div>

            {/* ================================= */}
            {/* TOP STATS */}
            {/* ================================= */}

            <div className="summary-stats-grid">

                <div className="summary-stat-card">

                    <FileText
                        size={26}
                        className="summary-icon"
                    />

                    <h3>
                        Uploaded Paper
                    </h3>

                    <p className="summary-small-text">

                        {paperData.filename}

                    </p>

                </div>

                <div className="summary-stat-card">

                    <Database
                        size={26}
                        className="summary-icon"
                    />

                    <h3>
                        Semantic Chunks
                    </h3>

                    <p>
                        {chunks}
                    </p>

                </div>

                <div className="summary-stat-card">

                    <BookOpen
                        size={26}
                        className="summary-icon"
                    />

                    <h3>
                        Knowledge Nodes
                    </h3>

                    <p>
                        {nodes}
                    </p>

                </div>

                <div className="summary-stat-card">

                    <Brain
                        size={26}
                        className="summary-icon"
                    />

                    <h3>
                        Graph Relations
                    </h3>

                    <p>
                        {edges}
                    </p>

                </div>

            </div>

            {/* ================================= */}
            {/* MAIN SUMMARY */}
            {/* ================================= */}

            <div className="summary-main-card">

                <div className="summary-top">

                    <div>

                        <h2>
                            {paperData.filename}
                        </h2>

                        <p className="paper-type">

                            IEEE Research Intelligence Summary

                        </p>

                    </div>

                    <div className="summary-badge">

                        AI Generated

                    </div>

                </div>

                {/* ABSTRACT */}

                <div className="summary-section">

                    <h3>
                        Abstract
                    </h3>

                    <p>
                        {
                            sections.abstract ||
                            "Not detected"
                        }
                    </p>

                </div>

                {/* INTRODUCTION */}

                <div className="summary-section">

                    <h3>
                        Introduction
                    </h3>

                    <p>
                        {
                            sections.introduction ||
                            "Not detected"
                        }
                    </p>

                </div>

                {/* METHODOLOGY */}

                <div className="summary-section">

                    <h3>
                        Methodology
                    </h3>

                    <p>
                        {
                            sections.methodology ||
                            "Not detected"
                        }
                    </p>

                </div>

                {/* RESULTS */}

                <div className="summary-section">

                    <h3>
                        Results
                    </h3>

                    <p>
                        {
                            sections.results ||
                            "Not detected"
                        }
                    </p>

                </div>

                {/* CONCLUSION */}

                <div className="summary-section">

                    <h3>
                        Conclusion
                    </h3>

                    <p>
                        {
                            sections.conclusion ||
                            "Not detected"
                        }
                    </p>

                </div>

            </div>

        </div>
    );
}