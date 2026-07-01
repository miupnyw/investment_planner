"use client";

import { Box, Typography } from "@mui/material";
import Navbar from "@/components/Navbar";
import { WheelOfLifeDashboard } from "@/modules/wheel/components/WheelOfLifeDashboard";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      {/* Wheel of Life dashboard */}
      <WheelOfLifeDashboard />

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: "center",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} {t("appTitle")} — {t("footerRights")}
        </Typography>
      </Box>
    </Box>
  );
}
