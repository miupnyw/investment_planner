"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import BarChartIcon from "@mui/icons-material/BarChart";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";

const features = [
  {
    icon: <TrendingUpIcon fontSize="large" color="primary" />,
    titleKey: "feature1Title",
    descKey: "feature1Desc",
  },
  {
    icon: <TrackChangesIcon fontSize="large" color="primary" />,
    titleKey: "feature2Title",
    descKey: "feature2Desc",
  },
  {
    icon: <BarChartIcon fontSize="large" color="primary" />,
    titleKey: "feature3Title",
    descKey: "feature3Desc",
  },
  {
    icon: <LightbulbIcon fontSize="large" color="primary" />,
    titleKey: "feature4Title",
    descKey: "feature4Desc",
  },
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          py: { xs: 10, md: 16 },
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #0d1b2a 0%, #1b2a3b 100%)"
              : "linear-gradient(135deg, #e3f2fd 0%, #fafafa 100%)",
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} sx={{ alignItems: "center", textAlign: "center" }}>
            <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {t("heroHeadline")}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 560 }}
            >
              {t("heroSubtitle")}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                sx={{ px: 4, borderRadius: 8 }}
              >
                {t("getStarted")}
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{ px: 4, borderRadius: 8 }}
              >
                {t("learnMore")}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, textAlign: "center", mb: 6 }}
          >
            {t("featuresTitle")}
          </Typography>
          <Grid container spacing={4}>
            {features.map(({ icon, titleKey, descKey }) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={titleKey}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    p: 1,
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: 4 },
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      {icon}
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {t(titleKey)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t(descKey)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Banner */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: "primary.main",
          color: "primary.contrastText",
          textAlign: "center",
        }}
      >
        <Container maxWidth="sm">
          <Stack spacing={3} sx={{ alignItems: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t("ctaTitle")}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85 }}>
              {t("ctaSubtitle")}
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 5,
                borderRadius: 8,
                bgcolor: "white",
                color: "primary.main",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              {t("getStarted")}
            </Button>
          </Stack>
        </Container>
      </Box>

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
