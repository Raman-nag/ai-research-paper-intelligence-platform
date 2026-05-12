import React, {
  useEffect,
  useRef,
  useState
} from 'react';

import {
  Filter,
  Layers,
  Maximize,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

import Card from '../ui/Card';

import './KnowledgeGraphPage.css';

const KnowledgeGraphPage = () => {

  const canvasRef = useRef(null);

  const [graphData, setGraphData] = useState({

    nodes: [],
    links: []

  });

  const [graphStats, setGraphStats] = useState({

    nodes: 0,
    edges: 0,
    selectedEntity: null

  });

  // =========================================
  // LOAD GRAPH FROM SESSION
  // =========================================

  useEffect(() => {

    const storedAnalysis =

      sessionStorage.getItem(
        "current_analysis"
      );

    if (!storedAnalysis) {

      setGraphData({

        nodes: [],
        links: []

      });

      return;
    }

    const parsedAnalysis =
      JSON.parse(storedAnalysis);

    const graph =
      parsedAnalysis.knowledge_graph || {};

    // normalize graph

    if (
      graph.edges &&
      !graph.links
    ) {

      graph.links = graph.edges;

    }

    setGraphData({

      nodes: graph.nodes || [],
      links: graph.links || []

    });

    setGraphStats({

      nodes:
        graph.nodes?.length || 0,

      edges:
        graph.links?.length || 0,

      selectedEntity:
        graph.nodes?.[0] || null

    });

  }, []);

  // =========================================
  // DRAW GRAPH
  // =========================================

  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    if (graphData.nodes.length === 0) return;

    const ctx =
      canvas.getContext('2d');

    let animationFrameId;

    // =====================================
    // RESIZE
    // =====================================

    const resizeCanvas = () => {

      const parent =
        canvas.parentElement;

      canvas.width =
        parent.clientWidth;

      canvas.height =
        parent.clientHeight;

    };

    resizeCanvas();

    window.addEventListener(
      'resize',
      resizeCanvas
    );

    // =====================================
    // NODE POSITIONS
    // =====================================

    const visualNodes =
      graphData.nodes.map((node) => ({

        ...node,

        x:
          Math.random()
          * (canvas.width - 200)
          + 100,

        y:
          Math.random()
          * (canvas.height - 200)
          + 100,

        vx:
          (Math.random() - 0.5) * 0.8,

        vy:
          (Math.random() - 0.5) * 0.8,

        radius: 12

      }));

    // =====================================
    // CLICK DETECTION
    // =====================================

    canvas.onclick = (event) => {

      const rect =
        canvas.getBoundingClientRect();

      const mouseX =
        event.clientX - rect.left;

      const mouseY =
        event.clientY - rect.top;

      visualNodes.forEach((node) => {

        const dx = mouseX - node.x;

        const dy = mouseY - node.y;

        const distance =
          Math.sqrt(dx * dx + dy * dy);

        if (distance < node.radius + 8) {

          setGraphStats(prev => ({

            ...prev,

            selectedEntity: node

          }));

        }

      });

    };

    // =====================================
    // DRAW LOOP
    // =====================================

    const draw = () => {

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // ==============================
      // LINKS
      // ==============================

      graphData.links.forEach((edge) => {

        const source =
          visualNodes.find(
            n => n.id === edge.source
          );

        const target =
          visualNodes.find(
            n => n.id === edge.target
          );

        if (!source || !target) return;

        ctx.beginPath();

        ctx.moveTo(
          source.x,
          source.y
        );

        ctx.lineTo(
          target.x,
          target.y
        );

        ctx.strokeStyle =
          'rgba(0,243,255,0.22)';

        ctx.lineWidth = 1.2;

        ctx.shadowBlur = 10;

        ctx.shadowColor =
          '#00f3ff';

        ctx.stroke();

      });

      // ==============================
      // NODES
      // ==============================

      visualNodes.forEach((node) => {

        node.x += node.vx;

        node.y += node.vy;

        // bounce

        if (
          node.x < 60 ||
          node.x > canvas.width - 60
        ) {

          node.vx *= -1;

        }

        if (
          node.y < 60 ||
          node.y > canvas.height - 60
        ) {

          node.vy *= -1;

        }

        const isSelected =

          graphStats.selectedEntity?.id
          === node.id;

        ctx.beginPath();

        ctx.arc(

          node.x,
          node.y,

          isSelected
            ? 16
            : node.radius,

          0,
          Math.PI * 2

        );

        ctx.fillStyle =

          isSelected
            ? '#ff00ff'
            : '#00f3ff';

        ctx.shadowBlur =

          isSelected
            ? 28
            : 18;

        ctx.shadowColor =

          isSelected
            ? '#ff00ff'
            : '#00f3ff';

        ctx.fill();

        // labels

        ctx.font =
          isSelected
            ? 'bold 14px Arial'
            : '13px Arial';

        ctx.fillStyle = '#ffffff';

        ctx.fillText(

          node.label,

          node.x + 18,

          node.y + 5

        );

      });

      animationFrameId =
        requestAnimationFrame(draw);

    };

    draw();

    return () => {

      window.removeEventListener(
        'resize',
        resizeCanvas
      );

      cancelAnimationFrame(
        animationFrameId
      );

    };

  }, [graphData, graphStats.selectedEntity]);

  return (

    <div className="graph-page animate-fade-in">

      {/* HEADER */}

      <div className="graph-header">

        <h2 className="page-title">

          Dynamic Knowledge Graph

        </h2>

        <div className="graph-controls">

          <button className="control-btn">
            <ZoomIn size={18} />
          </button>

          <button className="control-btn">
            <ZoomOut size={18} />
          </button>

          <button className="control-btn">
            <Maximize size={18} />
          </button>

        </div>

      </div>

      {/* MAIN LAYOUT */}

      <div className="graph-layout">

        {/* ================================= */}
        {/* LEFT SIDEBAR */}
        {/* ================================= */}

        <div className="graph-sidebar glass-panel">

          {/* ANALYTICS */}

          <div className="sidebar-section">

            <h3 className="section-title">

              <Filter size={18} />

              Graph Analytics

            </h3>

            <div className="filter-group">

              <label className="checkbox-label">

                <input
                  type="checkbox"
                  defaultChecked
                />

                <span className="checkbox-custom"></span>

                Dynamic Nodes

              </label>

              <label className="checkbox-label">

                <input
                  type="checkbox"
                  defaultChecked
                />

                <span className="checkbox-custom"></span>

                Semantic Links

              </label>

            </div>

          </div>

          {/* STATS */}

          <div className="sidebar-section">

            <Card className="entity-card">

              <h4 className="entity-name">
                Graph Statistics
              </h4>

              <div className="entity-stats">

                <div className="stat">

                  <span>Nodes</span>

                  <strong>
                    {graphStats.nodes}
                  </strong>

                </div>

                <div className="stat">

                  <span>Edges</span>

                  <strong>
                    {graphStats.edges}
                  </strong>

                </div>

              </div>

            </Card>

          </div>

          {/* NODES */}

          <div className="sidebar-section">

            <Card className="entity-card">

              <h4 className="entity-name">
                Knowledge Nodes
              </h4>

              <div className="entity-list">

                {

                  graphData.nodes.map((node) => (

                    <div
                      key={node.id}
                      className="entity-item"
                    >

                      {node.label}

                    </div>

                  ))

                }

              </div>

            </Card>

          </div>

          {/* ACTIVE ENTITY */}

          <div className="sidebar-section mt-auto">

            <h3 className="section-title">

              <Layers size={18} />

              Active Entity

            </h3>

            <Card
              className="entity-card"
              glowColor="cyan"
            >

              <h4 className="entity-name">

                {

                  graphStats.selectedEntity
                    ? graphStats.selectedEntity.label
                    : 'No Entity'

                }

              </h4>

              <p className="entity-type">

                AI Knowledge Node

              </p>

            </Card>

          </div>

        </div>

        {/* ================================= */}
        {/* GRAPH AREA */}
        {/* ================================= */}

        <div className="graph-visualization-area">

          {

            graphData.nodes.length === 0 ? (

              <div className="empty-graph-message">

                <h2>
                  No Knowledge Graph Yet
                </h2>

                <p>
                  Upload and analyze a PDF
                  to generate semantic
                  entity visualization.
                </p>

              </div>

            ) : (

              <>

                <canvas
                  ref={canvasRef}
                  className="graph-canvas"
                ></canvas>

                <div className="graph-overlay">

                  <div className="overlay-badge">

                    LIVE PAPER GRAPH

                  </div>

                </div>

              </>

            )

          }

        </div>

      </div>

    </div>

  );

};

export default KnowledgeGraphPage;