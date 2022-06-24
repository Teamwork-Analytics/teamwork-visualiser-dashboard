import React from "react";
import MainLayout from "./layouts/MainLayout";
import SidebarLayout from "./layouts/SidebarLayout";

/**
 * The main page (wide)
 */
const VisualisationPage = () => {
  return (
    <div>
      <SidebarLayout />
      <MainLayout />
    </div>
  );
};

export default VisualisationPage;
