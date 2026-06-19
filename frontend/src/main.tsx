import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Topics } from "./pages/Topics";
import { TopicDetail } from "./pages/TopicDetail";
import { Patterns } from "./pages/Patterns";
import { PatternDetail } from "./pages/PatternDetail";
import { Flows } from "./pages/Flows";
import { FlowDetail } from "./pages/FlowDetail";
import { Diagrams } from "./pages/Diagrams";
import { Interview } from "./pages/Interview";
import { Compare } from "./pages/Compare";
import { EvidencePage } from "./pages/Evidence";
import "./styles.css";

const router = createBrowserRouter([
  {
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
      { path: "interview", element: <Interview /> },
      { path: "compare", element: <Compare /> },
      { path: "evidence", element: <EvidencePage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
