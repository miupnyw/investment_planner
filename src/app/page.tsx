"use client";

import { Box } from "@mui/material";
import Navbar from "@/components/Navbar";
import { WheelOfLifeDashboard } from "@/modules/wheel/components/WheelOfLifeDashboard";

export default function Home() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Navbar />

      {/* Wheel of Life dashboard */}
      <WheelOfLifeDashboard />
    </Box>
  );
}
