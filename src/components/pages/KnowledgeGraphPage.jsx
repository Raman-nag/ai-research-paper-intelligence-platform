import React, { useEffect, useRef, useState } from 'react';
import { Filter, Layers, Maximize, ZoomIn, ZoomOut, Share2, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import './KnowledgeGraphPage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const KnowledgeGraphPage = () => {
  const canvasRef = useRef(null);
  const visualNodesRef = useRef([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [graphStats, setGraphStats] = useState({ nodes: 0, edges: 0, selectedEntity: null });

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("current_analysis");
    if (!storedAnalysis) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    const parsedAnalysis = JSON.parse(storedAnalysis);
    const graph = parsedAnalysis.knowledge_graph || {};

    if (graph.edges && !graph.links) {
      graph.links = graph.edges;
    }

    setGraphData({ nodes: graph.nodes || [], links: graph.links || [] });
    setGraphStats({
      nodes: graph.nodes?.length || 0,
      edges: graph.links?.length || 0,
      selectedEntity: graph.nodes?.[0] || null
    });
  }, []);

  useEffect(() => {
    if (graphData.nodes.length > 0 && visualNodesRef.current.length === 0) {
      visualNodesRef.current = graphData.nodes.map((node) => ({
        ...node,
        x: Math.random() * 500 + 100, // Safe default positions
        y: Math.random() * 400 + 100,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: 12
      }));
    }
  }, [graphData.nodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || graphData.nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.onclick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      visualNodesRef.current.forEach((node) => {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < node.radius + 8) {
          setGraphStats(prev => ({ ...prev, selectedEntity: node }));
        }
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // LINKS
      graphData.links.forEach((edge) => {
        const source = visualNodesRef.current.find(n => n.id === edge.source);
        const target = visualNodesRef.current.find(n => n.id === edge.target);

        if (!source || !target) return;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = 'rgba(0,243,255,0.22)';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f3ff';
        ctx.stroke();
      });

      // NODES
      visualNodesRef.current.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges with bounds checking
        if (node.x < 60) { node.x = 60; node.vx *= -1; }
        else if (node.x > canvas.width - 60 && canvas.width > 120) { node.x = canvas.width - 60; node.vx *= -1; }
        
        if (node.y < 60) { node.y = 60; node.vy *= -1; }
        else if (node.y > canvas.height - 60 && canvas.height > 120) { node.y = canvas.height - 60; node.vy *= -1; }

        const isSelected = graphStats.selectedEntity?.id === node.id;

        ctx.beginPath();
        ctx.arc(node.x, node.y, isSelected ? 16 : node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#9d00ff' : '#00f3ff';
        ctx.shadowBlur = isSelected ? 28 : 18;
        ctx.shadowColor = isSelected ? '#9d00ff' : '#00f3ff';
        ctx.fill();

        ctx.font = isSelected ? 'bold 14px Rajdhani' : '13px Rajdhani';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(node.label, node.x + 18, node.y + 5);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [graphData, graphStats.selectedEntity]);

  return (
    <motion.div 
      className="graph-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="graph-header flex-between">
        <motion.h2 className="page-title" variants={itemVariants}>
          Dynamic <span className="text-gradient">Knowledge Graph</span>
        </motion.h2>

        <motion.div className="graph-controls glass-panel" variants={itemVariants}>
          <button className="control-btn"><ZoomIn size={18} /></button>
          <button className="control-btn"><ZoomOut size={18} /></button>
          <button className="control-btn"><Maximize size={18} /></button>
          <button className="control-btn"><Share2 size={18} /></button>
        </motion.div>
      </div>

      <div className="graph-layout">
        {/* LEFT SIDEBAR */}
        <motion.div className="graph-sidebar glass-panel" variants={containerVariants}>
          {/* ANALYTICS */}
          <motion.div className="sidebar-section" variants={itemVariants}>
            <h3 className="section-title"><Filter size={18} /> Graph Analytics</h3>
            <div className="filter-group">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span className="checkbox-custom"></span> Dynamic Nodes
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span className="checkbox-custom"></span> Semantic Links
              </label>
            </div>
          </motion.div>

          {/* STATS */}
          <motion.div className="sidebar-section" variants={itemVariants}>
            <Card className="entity-card" glowColor="cyan">
              <h4 className="entity-name">Graph Statistics</h4>
              <div className="entity-stats">
                <div className="stat">
                  <span>Nodes</span>
                  <strong className="text-gradient">{graphStats.nodes}</strong>
                </div>
                <div className="stat">
                  <span>Edges</span>
                  <strong className="text-gradient">{graphStats.edges}</strong>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* NODES */}
          <motion.div className="sidebar-section" variants={itemVariants}>
            <Card className="entity-card" glowColor="cyan">
              <h4 className="entity-name">Knowledge Nodes</h4>
              <div className="entity-list">
                {graphData.nodes.map((node) => (
                  <div key={node.id} className="entity-item">
                    {node.label}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* ACTIVE ENTITY */}
          <motion.div className="sidebar-section mt-auto" variants={itemVariants}>
            <h3 className="section-title"><Layers size={18} /> Active Entity</h3>
            <Card className="entity-card" glowColor="purple">
              <h4 className="entity-name text-gradient-pink">
                {graphStats.selectedEntity ? graphStats.selectedEntity.label : 'No Entity Selected'}
              </h4>
              <p className="entity-type">AI Knowledge Node</p>
            </Card>
          </motion.div>
        </motion.div>

        {/* GRAPH AREA */}
        <motion.div className="graph-visualization-area glass-panel" variants={itemVariants}>
          {graphData.nodes.length === 0 ? (
            <div className="empty-graph-message flex-center flex-col">
              <Network size={48} className="text-muted mb-4" />
              <h2>No Knowledge Graph Yet</h2>
              <p className="text-muted">Upload and analyze a PDF to generate semantic entity visualization.</p>
              <Button variant="primary" className="mt-4" onClick={() => window.location.href='/paper-analysis'}>Go to Analysis</Button>
            </div>
          ) : (
            <>
              <canvas ref={canvasRef} className="graph-canvas"></canvas>
              <div className="graph-overlay">
                <div className="overlay-badge">LIVE PAPER GRAPH</div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default KnowledgeGraphPage;