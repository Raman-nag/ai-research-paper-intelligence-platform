import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PaperAnalysisPage from "./components/pages/PaperAnalysisPage";
import Layout from './components/Layout';
import HomePage from './components/pages/HomePage';
import SemanticSearchPage from './components/pages/SemanticSearchPage';
import ResearchAssistantPage from './components/pages/ResearchAssistantPage';
import KnowledgeGraphPage from './components/pages/KnowledgeGraphPage';
import ResearchSummariesPage from './components/pages/ResearchSummariesPage';
import EvaluationDashboard from './components/pages/EvaluationDashboard';

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Layout />}>

          <Route
            index
            element={<HomePage />}
          />
          <Route
            path="/paper-analysis"
            element={<PaperAnalysisPage />}
          />
          <Route
            path="search"
            element={<SemanticSearchPage />}
          />

          <Route
            path="assistant"
            element={<ResearchAssistantPage />}
          />

          <Route
            path="graph"
            element={<KnowledgeGraphPage />}
          />

          <Route
            path="summaries"
            element={<ResearchSummariesPage />}
          />

          <Route
            path="evaluation"
            element={<EvaluationDashboard />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;