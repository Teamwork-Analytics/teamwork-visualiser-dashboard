import React, { useState } from "react";
import { Button, Collapse } from "react-bootstrap";
import { ChevronDoubleLeft, ChevronDoubleRight } from "react-bootstrap-icons";
import TACarousel from "../../components/carousel/TACarousel";
import MainLayout from "./layouts/MainLayout";
import SidebarLayout from "./layouts/SidebarLayout";
import { ReactComponent as NursingFloorPlan } from "../../../data/floor-plan/nursing-small.svg";
import HiveContainer from "../../projects/hive/HiveContainer";

/**
 * The main page (wide)
 */
const VisualisationPage = () => {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Collapse in={open} dimension="width">
        <div id="sidebar">
          <SidebarLayout />
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
        <HiveContainer />
      </MainLayout>
    </div>
  );
};

export default VisualisationPage;
