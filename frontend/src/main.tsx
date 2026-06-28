import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { InterviewLayout } from "./components/InterviewLayout";
import { Home } from "./pages/Home";
import { Topics } from "./pages/Topics";
import { TopicDetail } from "./pages/TopicDetail";
import { Patterns } from "./pages/Patterns";
import { PatternDetail } from "./pages/PatternDetail";
import { Flows } from "./pages/Flows";
import { FlowDetail } from "./pages/FlowDetail";
import { Diagrams } from "./pages/Diagrams";
import { DiagramDetail } from "./pages/DiagramDetail";
import { Compare } from "./pages/Compare";
import { EvidencePage } from "./pages/Evidence";
import { AiGlossary } from "./pages/AiGlossary";
import { Databases } from "./pages/Databases";
import { DatabaseDetail } from "./pages/DatabaseDetail";
import { DatabaseBuilder } from "./pages/DatabaseBuilder";
import {
  InterviewOverview,
  InterviewSystemDesign,
  InterviewDsa,
  InterviewBehavioral,
  InterviewFundamentos,
  InterviewRelatos,
} from "./pages/Interview";
import "./styles.css";

const router = createBrowserRouter([
  {
    // Base de Conhecimento — o System Design Specialist Lab (produto original)
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "topics", element: <Topics /> },
      { path: "topics/:id", element: <TopicDetail /> },
      { path: "patterns", element: <Patterns /> },
      { path: "patterns/:id", element: <PatternDetail /> },
      { path: "flows", element: <Flows /> },
      { path: "flows/:id", element: <FlowDetail /> },
      { path: "diagrams", element: <Diagrams /> },
      { path: "diagrams/:id", element: <DiagramDetail /> },
      { path: "compare", element: <Compare /> },
      { path: "evidence", element: <EvidencePage /> },
      { path: "ai-agents", element: <AiGlossary /> },
      { path: "databases", element: <Databases /> },
      { path: "databases/builder", element: <DatabaseBuilder /> },
      { path: "databases/:id", element: <DatabaseDetail /> },
    ],
  },
  // back-compat: o Modo Entrevista era /interview antes de virar área própria
  { path: "/interview", element: <Navigate to="/entrevista" replace /> },
  {
    // Modo Entrevista — área própria, layout próprio
    path: "/entrevista",
    element: <InterviewLayout />,
    children: [
      { index: true, element: <InterviewOverview /> },
      { path: "system-design", element: <InterviewSystemDesign /> },
      { path: "dsa", element: <InterviewDsa /> },
      { path: "fundamentos", element: <InterviewFundamentos /> },
      { path: "comportamental", element: <InterviewBehavioral /> },
      { path: "relatos", element: <InterviewRelatos /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
