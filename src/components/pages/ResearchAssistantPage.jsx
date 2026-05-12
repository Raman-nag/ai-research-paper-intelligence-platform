import React, {
  useState,
  useEffect,
  useRef
} from 'react';

import {
  Send,
  Bot,
  User,
  RefreshCw,
  Cpu
} from 'lucide-react';

import Card from '../ui/Card';
import Badge from '../ui/Badge';

import './ResearchAssistantPage.css';

const ResearchAssistantPage = () => {

  // =========================================
  // STATES
  // =========================================

  const [input, setInput] = useState('');

  const [isTyping, setIsTyping] =
    useState(false);

  const [thinkingText, setThinkingText] =
    useState('');

  const [paperUploaded, setPaperUploaded] =
    useState(false);

  // =========================================
  // GRAPH STATS
  // =========================================

  const [graphStats, setGraphStats] =
    useState({

      nodes: 0,
      edges: 0

    });

  // =========================================
  // CHAT
  // =========================================

  const [messages, setMessages] =
    useState([

      {

        id: 1,

        sender: 'ai',

        text:
          'AI Research Assistant initialized. Upload a research paper to begin semantic analysis and intelligent retrieval.',

        context: [
          'Semantic AI',
          'Research Retrieval'
        ]

      }

    ]);

  const chatEndRef = useRef(null);

  // =========================================
  // LOAD SESSION DATA
  // =========================================

  useEffect(() => {

    const storedAnalysis =

      sessionStorage.getItem(
        "current_analysis"
      );

    if (!storedAnalysis) return;

    const parsed =
      JSON.parse(storedAnalysis);

    setPaperUploaded(true);

    const graph =
      parsed.knowledge_graph || {};

    setGraphStats({

      nodes:
        graph.nodes?.length || 0,

      edges:
        graph.links?.length ||
        graph.edges?.length || 0

    });

    setMessages([

      {

        id: 1,

        sender: 'ai',

        text:
          `Research paper "${parsed.filename}" successfully connected to AI semantic retrieval engine. Ask questions related to the uploaded paper.`,

        context: [

          'Uploaded PDF',
          'Semantic AI',
          'Knowledge Graph'

        ]

      }

    ]);

  }, []);

  // =========================================
  // AUTO SCROLL
  // =========================================

  const scrollToBottom = () => {

    chatEndRef.current?.scrollIntoView({

      behavior: 'smooth'

    });

  };

  useEffect(() => {

    scrollToBottom();

  }, [messages, isTyping]);

  // =========================================
  // BACKEND AI API
  // =========================================

  const askBackendAI = async (question) => {

    try {

      const response = await fetch(

        `http://127.0.0.1:8000/ask?question=${encodeURIComponent(question)}`

      );

      const data = await response.json();

      return {

        text: data.answer,

        context: [

          'AI Retrieval',
          'Semantic Search',
          'Research Intelligence'

        ]

      };

    } catch (error) {

      console.error(error);

      return {

        text:
          'Backend connection failed. Please ensure FastAPI server is running.',

        context: ['System Error']

      };

    }

  };

  // =========================================
  // HANDLE SEND
  // =========================================

  const handleSend = async () => {

    if (!input.trim()) return;

    if (!paperUploaded) {

      setMessages(prev => [

        ...prev,

        {

          id: Date.now(),

          sender: 'ai',

          text:
            'Please upload and analyze a research paper first before using the AI assistant.',

          context: [
            'No Uploaded PDF'
          ]

        }

      ]);

      return;
    }

    const userMessage = {

      id: Date.now(),

      sender: 'user',

      text: input,

      context: []

    };

    setMessages(prev => [

      ...prev,
      userMessage

    ]);

    const currentQuestion = input;

    setInput('');

    setIsTyping(true);

    // THINKING STAGES

    setThinkingText(
      'Searching uploaded research paper...'
    );

    await new Promise(resolve =>
      setTimeout(resolve, 1200)
    );

    setThinkingText(
      'Retrieving semantic context...'
    );

    await new Promise(resolve =>
      setTimeout(resolve, 1400)
    );

    setThinkingText(
      'Analyzing engineering concepts...'
    );

    await new Promise(resolve =>
      setTimeout(resolve, 1500)
    );

    setThinkingText(
      'Generating AI research response...'
    );

    await new Promise(resolve =>
      setTimeout(resolve, 1300)
    );

    // CALL BACKEND

    const aiResponse =
      await askBackendAI(
        currentQuestion
      );

    setMessages(prev => [

      ...prev,

      {

        id: Date.now() + 1,

        sender: 'ai',

        text: aiResponse.text,

        context: aiResponse.context

      }

    ]);

    setIsTyping(false);

    setThinkingText('');

  };

  // =========================================
  // RESET CHAT
  // =========================================

  const resetChat = () => {

    setMessages([

      {

        id: 1,

        sender: 'ai',

        text:
          paperUploaded
            ? 'Conversation reset. Research assistant ready.'
            : 'Upload a paper to begin AI research analysis.',

        context:
          paperUploaded
            ? ['Semantic AI']
            : ['No PDF']

      }

    ]);

  };

  return (

    <div className="assistant-page animate-fade-in">

      <div className="assistant-layout">

        {/* CHAT */}

        <div className="chat-section glass-panel">

          <div className="chat-header">

            <div className="assistant-identity">

              <Bot
                className="text-cyan"
                size={28}
              />

              <div>

                <h3>
                  ArXiv Research AI
                </h3>

                <span className="status-online">

                  {

                    paperUploaded
                      ? 'Research Paper Connected'
                      : 'Waiting For PDF Upload'

                  }

                </span>

              </div>

            </div>

            <button
              className="icon-btn"
              onClick={resetChat}
            >

              <RefreshCw size={18} />

            </button>

          </div>

          {/* CHAT HISTORY */}

          <div className="chat-history">

            {messages.map((msg) => (

              <div
                key={msg.id}
                className={`message-wrapper ${msg.sender}`}
              >

                <div className="message-avatar">

                  {

                    msg.sender === 'ai'

                      ? <Bot size={20} />

                      : <User size={20} />

                  }

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

                  {

                    msg.context.length > 0 && (

                      <div className="message-context-tags">

                        {

                          msg.context.map(tag => (

                            <Badge
                              key={tag}
                              variant="purple"
                            >

                              {tag}

                            </Badge>

                          ))

                        }

                      </div>
                    )
                  }

                </div>

              </div>

            ))}

            {/* THINKING */}

            {

              isTyping && (

                <div className="message-wrapper ai">

                  <div className="message-avatar">

                    <Bot size={20} />

                  </div>

                  <div className="message-content typing-box">

                    <div className="typing-indicator">

                      <span></span>
                      <span></span>
                      <span></span>

                    </div>

                    <div className="thinking-text">

                      {thinkingText}

                    </div>

                  </div>

                </div>

              )
            }

            <div ref={chatEndRef} />

          </div>

          {/* INPUT */}

          <div className="chat-input-area">

            <input

              type="text"

              value={input}

              onChange={(e) =>
                setInput(e.target.value)
              }

              onKeyDown={(e) => {

                if (e.key === 'Enter') {

                  handleSend();

                }

              }}

              placeholder="Ask research questions..."

            />

            <button
              className="send-btn"
              onClick={handleSend}
            >

              <Send size={20} />

            </button>

          </div>

        </div>

        {/* CONTEXT PANEL */}

        <div className="context-panel">

          <Card
            className="context-card"
            glowColor="purple"
          >

            <div className="card-header">

              <Cpu
                className="text-purple"
                size={20}
              />

              <h3>
                AI Retrieval Engine
              </h3>

            </div>

            <div className="context-body">

              <p className="context-desc">

                Live semantic engineering
                research retrieval using
                transformer embeddings,
                FAISS vector search,
                and AI reasoning pipelines.

              </p>

              <ul className="context-list">

                <li>
                  FAISS Vector Search
                </li>

                <li>
                  Semantic Embeddings
                </li>

                <li>
                  AI Research Retrieval
                </li>

                <li>
                  Knowledge Graph AI
                </li>

              </ul>

              <div className="context-stat">

                <span>
                  Knowledge Nodes
                </span>

                <strong className="text-gradient brand-font">

                  {graphStats.nodes}

                </strong>

              </div>

              <div className="context-stat">

                <span>
                  Graph Connections
                </span>

                <strong className="text-gradient brand-font">

                  {graphStats.edges}

                </strong>

              </div>

            </div>

          </Card>

        </div>

      </div>

    </div>
  );
};

export default ResearchAssistantPage;