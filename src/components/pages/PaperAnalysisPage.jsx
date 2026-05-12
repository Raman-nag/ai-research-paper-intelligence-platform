import {
    useState,
    useEffect
} from "react";

import "./PaperAnalysisPage.css";

const API_BASE =
    "https://ai-research-paper-intelligence-platform.onrender.com";

export default function PaperAnalysisPage() {

    // =========================================
    // STATES
    // =========================================

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [analysis, setAnalysis] =
        useState(null);

    // =========================================
    // LOAD CURRENT SESSION ANALYSIS
    // =========================================

    useEffect(() => {

        const storedAnalysis =

            sessionStorage.getItem(
                "current_analysis"
            );

        if (storedAnalysis) {

            const parsed =
                JSON.parse(storedAnalysis);

            setAnalysis(parsed);

        }

    }, []);

    // =========================================
    // HANDLE PDF UPLOAD
    // =========================================

    const handleUpload = async () => {

        if (!selectedFile) {

            alert("Please select a PDF");

            return;
        }

        try {

            // =====================================
            // RESET CURRENT SESSION
            // =====================================

            sessionStorage.removeItem(
                "current_analysis"
            );

            setAnalysis(null);

            setLoading(true);

            // =====================================
            // CREATE FORM DATA
            // =====================================

            const formData =
                new FormData();

            formData.append(
                "file",
                selectedFile
            );

            // =====================================
            // BACKEND REQUEST
            // =====================================

            const response = await fetch(

                `${API_BASE}/analyze-paper`,

                {

                    method: "POST",

                    body: formData

                }

            );

            const data =
                await response.json();

            console.log(
                "Analysis Response:",
                data
            );

            // =====================================
            // NORMALIZE KNOWLEDGE GRAPH
            // =====================================

            if (data.knowledge_graph) {

                if (

                    data.knowledge_graph.edges &&
                    !data.knowledge_graph.links

                ) {

                    data.knowledge_graph.links =

                        data.knowledge_graph.edges;

                }

            }

            // =====================================
            // SAVE SESSION DATA
            // =====================================

            sessionStorage.setItem(

                "current_analysis",

                JSON.stringify(data)

            );

            // =====================================
            // UPDATE STATE
            // =====================================

            setAnalysis(data);

        } catch (error) {

            console.error(error);

            alert(
                "Paper upload failed"
            );

        } finally {

            setLoading(false);

        }

    };

    // =========================================
    // SECTION CARD COMPONENT
    // =========================================

    const SectionCard = ({
        title,
        content
    }) => (

        <div className="section-card">

            <h2>
                {title}
            </h2>

            <div className="section-content">

                {

                    content
                        ? content
                        : "No section detected."

                }

            </div>

        </div>

    );

    return (

        <div className="paper-analysis-page">

            <div className="analysis-container">

                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}

                <div className="page-header">

                    <h1>

                        AI Research Paper Intelligence

                    </h1>

                    <p>

                        Upload research papers for semantic analysis,
                        intelligent summaries, semantic retrieval,
                        AI assistance, and dynamic knowledge graphs.

                    </p>

                </div>

                {/* ================================= */}
                {/* UPLOAD SECTION */}
                {/* ================================= */}

                <div className="upload-card">

                    <input

                        type="file"

                        accept=".pdf"

                        onChange={(e) =>
                            setSelectedFile(
                                e.target.files[0]
                            )
                        }

                    />

                    <button

                        onClick={handleUpload}

                        disabled={loading}

                    >

                        {

                            loading
                                ? "Analyzing Paper..."
                                : "Analyze Paper"

                        }

                    </button>

                    {

                        selectedFile && (

                            <div className="selected-file">

                                Selected:
                                {" "}
                                {selectedFile.name}

                            </div>

                        )

                    }

                </div>

                {/* ================================= */}
                {/* LOADING */}
                {/* ================================= */}

                {

                    loading && (

                        <div className="loading-card">

                            <h2>
                                Processing Research Paper
                            </h2>

                            <p>
                                Extracting text...
                            </p>

                            <p>
                                Creating semantic chunks...
                            </p>

                            <p>
                                Generating embeddings...
                            </p>

                            <p>
                                Building knowledge graph...
                            </p>

                            <p>
                                Retrieving related papers...
                            </p>

                        </div>

                    )

                }

                {/* ================================= */}
                {/* RESULTS */}
                {/* ================================= */}

                {

                    analysis && (

                        <div className="analysis-results">

                            {/* ========================= */}
                            {/* STATS */}
                            {/* ========================= */}

                            <div className="stats-grid">

                                <div className="stat-card">

                                    <h3>
                                        Uploaded Paper
                                    </h3>

                                    <p>

                                        {
                                            analysis.filename
                                        }

                                    </p>

                                </div>

                                <div className="stat-card">

                                    <h3>
                                        Semantic Chunks
                                    </h3>

                                    <p>

                                        {
                                            analysis.total_chunks
                                        }

                                    </p>

                                </div>

                                <div className="stat-card">

                                    <h3>
                                        Similar Papers
                                    </h3>

                                    <p>

                                        {

                                            analysis.similar_papers
                                            ?.length || 0

                                        }

                                    </p>

                                </div>

                                <div className="stat-card">

                                    <h3>
                                        Knowledge Nodes
                                    </h3>

                                    <p>

                                        {

                                            analysis
                                            ?.knowledge_graph
                                            ?.nodes
                                            ?.length || 0

                                        }

                                    </p>

                                </div>

                            </div>

                            {/* ========================= */}
                            {/* SECTIONS */}
                            {/* ========================= */}

                            <div className="sections-grid">

                                <SectionCard
                                    title="Abstract"
                                    content={
                                        analysis.sections?.abstract
                                    }
                                />

                                <SectionCard
                                    title="Introduction"
                                    content={
                                        analysis.sections?.introduction
                                    }
                                />

                                <SectionCard
                                    title="Methodology"
                                    content={
                                        analysis.sections?.methodology
                                    }
                                />

                                <SectionCard
                                    title="Results"
                                    content={
                                        analysis.sections?.results
                                    }
                                />

                                <SectionCard
                                    title="Conclusion"
                                    content={
                                        analysis.sections?.conclusion
                                    }
                                />

                            </div>

                            {/* ========================= */}
                            {/* SIMILAR PAPERS */}
                            {/* ========================= */}

                            <div className="similar-papers-card">

                                <h2>

                                    Similar Research Papers

                                </h2>

                                {

                                    analysis.similar_papers?.map(

                                        (paper, index) => (

                                            <div
                                                key={index}
                                                className="paper-card"
                                            >

                                                <div className="paper-top">

                                                    <div>

                                                        <h3>

                                                            {
                                                                paper.paper_id
                                                            }

                                                        </h3>

                                                        <p>

                                                            Section:
                                                            {" "}
                                                            {
                                                                paper.section
                                                            }

                                                        </p>

                                                    </div>

                                                    <div className="similarity-box">

                                                        {

                                                            Number(
                                                                paper.similarity_score
                                                            ).toFixed(3)

                                                        }

                                                    </div>

                                                </div>

                                                <div className="paper-preview">

                                                    {
                                                        paper.preview
                                                    }

                                                </div>

                                            </div>

                                        )

                                    )

                                }

                            </div>

                        </div>

                    )

                }

            </div>

        </div>
    );
}