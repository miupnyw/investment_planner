"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";

// Shared shell for life-area pages that don't have content yet. Each route
// passes the translation key for its title.
export default function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useLanguage();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        <Stack spacing={1} sx={{ mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {t(titleKey)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("comingSoon")}
          </Typography>
        </Stack>
      </Container>

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
