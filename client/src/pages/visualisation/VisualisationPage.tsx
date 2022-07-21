import React, { useState } from "react";
import { Button, Collapse } from "react-bootstrap";
import { ChevronDoubleLeft, ChevronDoubleRight } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";
import { HiveProvider } from "../../projects/hive/HiveContext";
import MainLayout from "./layouts/MainLayout";
import SidebarLayout from "./layouts/SidebarLayout";
import { availableTools, useViz, VizProvider } from "./VisualisationContext";

const VisualisationView = () => {
  const { tool, setTool } = useViz();
  const [open, setOpen] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Collapse in={open} dimension="width">
        <div id="sidebar">
          <SidebarLayout tool={tool} setTool={setTool} />
        </div>
      </Collapse>
      <Button
        onClick={() => setOpen(!open)}
        aria-controls="sidebar"
        aria-expanded={open}
        variant={"dark"}
      >
        {open ? <ChevronDoubleLeft /> : <ChevronDoubleRight />}
      </Button>
      <MainLayout>
        {availableTools[tool as keyof typeof String].mainView}
      </MainLayout>
    </div>
  );
};

const VisualisationPage = () => {
  const params = useParams();

  return (
    <VizProvider>
      {/* TODO: deal with multiple stack providers later! */}
      <HiveProvider sessionId={params.sessionId}>
        <VisualisationView />
      </HiveProvider>
    </VizProvider>
  );
};

export default VisualisationPage;
