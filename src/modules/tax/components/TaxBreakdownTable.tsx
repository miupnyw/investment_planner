import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { TaxBracket } from "@/modules/tax/tax";
import { useLanguage } from "@/context/LanguageContext";

interface TaxBreakdownTableProps {
  brackets: TaxBracket[];
  totalTax: number;
  fmt: (v: number) => string;
}

function fmtRange(min: number, max: number | null): string {
  const lo = min.toLocaleString();
  return max === null ? `${lo}+` : `${lo} – ${max.toLocaleString()}`;
}

export function TaxBreakdownTable({
  brackets,
  totalTax,
  fmt,
}: TaxBreakdownTableProps) {
  const { t } = useLanguage();

  return (
    <Card
      elevation={0}
      sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {t("taxBracketBreakdown")}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>
                {t("taxBracketRange")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                {t("taxBracketRate")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                {t("taxBracketTax")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brackets.map((b) => (
              <TableRow
                key={b.rate}
                sx={{
                  opacity: b.tax === 0 ? 0.4 : 1,
                  bgcolor: b.tax > 0 ? "action.hover" : "transparent",
                }}
              >
                <TableCell>{fmtRange(b.min, b.max)}</TableCell>
                <TableCell align="right">{b.rate}%</TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: b.tax > 0 ? 600 : 400 }}
                >
                  {fmt(b.tax)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                {t("taxTotal")}
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 700, color: "error.main" }}
              >
                {fmt(totalTax)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
