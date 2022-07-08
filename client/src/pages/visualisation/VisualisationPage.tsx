import React, { useState } from "react";
import { Button, Collapse } from "react-bootstrap";
import { ChevronDoubleLeft, ChevronDoubleRight } from "react-bootstrap-icons";
import TACarousel from "../../components/carousel/TACarousel";
import MainLayout from "./layouts/MainLayout";
import SidebarLayout from "./layouts/SidebarLayout";
import HiveView from "../../projects/hive/HiveView";
import ObservationView from "../../projects/observation/ObservationView";

/**
 * The main page (wide)
 */
const VisualisationPage = () => {
  const [open, setOpen] = useState(true);
  const [tool, setTool] = useState("observation");

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
        {tool === "hive-vis" ? <HiveView /> : <ObservationView />}
      </MainLayout>
    </div>
  );
};

export default VisualisationPage;
