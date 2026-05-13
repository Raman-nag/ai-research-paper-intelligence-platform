import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw, Cpu, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import './ResearchAssistantPage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const messageVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

const ResearchAssistantPage = () => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [paperUploaded, setPaperUploaded] = useState(false);
  const [graphStats, setGraphStats] = useState({ nodes: 0, edges: 0 });

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'AI Research Assistant initialized. Upload a research paper to begin semantic analysis and intelligent retrieval.',
      context: ['Semantic AI', 'Research Retrieval']
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const storedAnalysis = sessionStorage.getItem("current_analysis");
    if (!storedAnalysis) return;

    const parsed = JSON.parse(storedAnalysis);
    setPaperUploaded(true);
    const graph = parsed.knowledge_graph || {};

    setGraphStats({
      nodes: graph.nodes?.length || 0,
      edges: graph.links?.length || graph.edges?.length || 0
    });

    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: `Research paper "${parsed.filename}" successfully connected to AI semantic retrieval engine. Ask questions related to the uploaded paper.`,
        context: ['Uploaded PDF', 'Semantic AI', 'Knowledge Graph']
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const askBackendAI = async (question) => {
    try {
      const response = await fetch(
        `https://ai-research-paper-intelligence-platform.onrender.com/ask?question=${encodeURIComponent(question)}`
      );
      const data = await response.json();
      return {
        text: data.answer,
        context: ['AI Retrieval', 'Semantic Search', 'Research Intelligence']
      };
    } catch (error) {
      console.error(error);
      return {
        text: 'Backend connection failed. Please ensure FastAPI server is running.',
        context: ['System Error']
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!paperUploaded) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ai',
          text: 'Please upload and analyze a research paper first before using the AI assistant.',
          context: ['No Uploaded PDF']
        }
      ]);
      return;
    }

    const userMessage = { id: Date.now(), sender: 'user', text: input, context: [] };
    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = input;
    setInput('');
    setIsTyping(true);

    setThinkingText('Searching uploaded research paper...');
    await new Promise(resolve => setTimeout(resolve, 800));
    setThinkingText('Retrieving semantic context...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setThinkingText('Analyzing engineering concepts...');
    await new Promise(resolve => setTimeout(resolve, 800));
    setThinkingText('Generating AI research response...');
    await new Promise(resolve => setTimeout(resolve, 800));

    const aiResponse = await askBackendAI(currentQuestion);

    setMessages(prev => [
      ...prev,
      { id: Date.now() + 1, sender: 'ai', text: aiResponse.text, context: aiResponse.context }
    ]);

    setIsTyping(false);
    setThinkingText('');
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: paperUploaded ? 'Conversation reset. Research assistant ready.' : 'Upload a paper to begin AI research analysis.',
        context: paperUploaded ? ['Semantic AI'] : ['No PDF']
      }
    ]);
  };

  return (
    <motion.div 
      className="assistant-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="assistant-layout">
        
        {/* CHAT SECTION */}
        <motion.div className="chat-section glass-panel" variants={itemVariants}>
          <div className="chat-header">
            <div className="assistant-identity">
              <Bot className="text-cyan" size={28} />
              <div>
                <h3>ArXiv <span className="text-gradient">Research AI</span></h3>
                <span className="status-online">
                  {paperUploaded ? 'Research Paper Connected' : 'Waiting For PDF Upload'}
                </span>
              </div>
            </div>
            <button className="icon-btn" onClick={resetChat} title="Reset Conversation">
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="chat-history">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`message-wrapper ${msg.sender}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="message-avatar">
                    {msg.sender === 'ai' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className="message-content">
                    <div
                      className="message-text"
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/### (.*$)/gim, '<h3>$1</h3>')
                          .replace(/## (.*$)/gim, '<h2>$1</h2>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                    {msg.context.length > 0 && (
                      <div className="message-context-tags">
                        {msg.context.map(tag => (
                          <Badge key={tag} variant={msg.sender === 'ai' ? "cyan" : "purple"}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  className="message-wrapper ai"
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content typing-box">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="thinking-text">{thinkingText}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ask research questions..."
            />
            <button className="send-btn" onClick={handleSend}>
              <Send size={20} />
            </button>
          </div>
        </motion.div>

        {/* CONTEXT PANEL */}
        <motion.div className="context-panel" variants={itemVariants}>
          <Card className="context-card" glowColor="purple">
            <div className="card-header">
              <BrainCircuit className="text-purple" size={24} />
              <h3>AI Retrieval Engine</h3>
            </div>
            
            <div className="context-body">
              <p className="context-desc">
                Live semantic engineering research retrieval using transformer embeddings, FAISS vector search, and AI reasoning pipelines.
              </p>
              
              <ul className="context-list">
                <li><Cpu size={14} className="inline mr-2 text-cyan"/> FAISS Vector Search</li>
                <li><Cpu size={14} className="inline mr-2 text-cyan"/> Semantic Embeddings</li>
                <li><Cpu size={14} className="inline mr-2 text-cyan"/> AI Research Retrieval</li>
                <li><Cpu size={14} className="inline mr-2 text-cyan"/> Knowledge Graph AI</li>
              </ul>
              
              <div className="context-stat-group mt-auto">
                <div className="context-stat">
                  <span>Knowledge Nodes</span>
                  <strong className="text-gradient brand-font">{graphStats.nodes}</strong>
                </div>
                <div className="context-stat">
                  <span>Graph Connections</span>
                  <strong className="text-gradient-pink brand-font">{graphStats.edges}</strong>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResearchAssistantPage;