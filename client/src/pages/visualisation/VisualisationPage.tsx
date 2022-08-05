import React, { useEffect, useState } from "react";
import { Button, Collapse } from "react-bootstrap";
import { ChevronDoubleLeft, ChevronDoubleRight } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";
import EmptyPlaceholder from "../../components/EmptyPlaceholder";
import { DebriefingProvider } from "../../projects/debriefing/DebriefContext";
import { HiveProvider } from "../../projects/hive/HiveContext";
import { ObservationProvider } from "../../projects/observation/ObservationContext";
import MainLayout from "./layouts/MainLayout";
import SidebarLayout from "./layouts/SidebarLayout";
import { availableTools, useViz, VizProvider } from "./VisualisationContext";

const VisualisationView = () => {
  const { tool, setTool } = useViz();
  const [open, setOpen] = useState(true);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "row",
      }}
    >
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
        {availableTools[tool as keyof typeof String] ===
        undefined ? null : availableTools[tool as keyof typeof String]
            .mainView === undefined ? (
          <EmptyPlaceholder />
        ) : (
          availableTools[tool as keyof typeof String].mainView
        )}
      </MainLayout>
    </div>
  );
};

const VisualisationPage = () => {
  const params = useParams();

  return (
    <VizProvider>
      {/* TODO: deal with multiple stack providers later! */}
      <ObservationProvider simulationId={params.simulationId}>
        <DebriefingProvider>
          <HiveProvider simulationId={params.simulationId}>
            <VisualisationView />
          </HiveProvider>
        </DebriefingProvider>
      </ObservationProvider>
    </VizProvider>
  );
};

export default VisualisationPage;
