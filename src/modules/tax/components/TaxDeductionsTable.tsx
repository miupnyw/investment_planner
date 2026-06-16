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
import { TaxDeductions } from "@/lib/tax";
import { useLanguage } from "@/context/LanguageContext";

interface TaxDeductionsTableProps {
  deductions: TaxDeductions;
  fmt: (v: number) => string;
}

export function TaxDeductionsTable({
  deductions,
  fmt,
}: TaxDeductionsTableProps) {
  const { t } = useLanguage();

  const rows: { labelKey: string; value: number; note?: string }[] = [
    {
      labelKey: "taxDeductEmployment",
      value: deductions.employmentDeduction,
      note: t("taxDeductEmploymentNote"),
    },
    {
      labelKey: "taxDeductPersonal",
      value: deductions.personalAllowance,
      note: "60,000",
    },
    {
      labelKey: "taxDeductSpouse",
      value: deductions.spouseAllowance,
      note: "60,000",
    },
    {
      labelKey: "taxDeductChild",
      value: deductions.childAllowance,
      note: t("taxDeductChildNote"),
    },
    {
      labelKey: "taxDeductPregnancy",
      value: deductions.pregnancyDeduction,
      note: t("taxDeductMax60k"),
    },
    {
      labelKey: "taxDeductParent",
      value: deductions.parentAllowance,
      note: t("taxDeductChildNote"),
    },
    {
      labelKey: "taxDeductDisabled",
      value: deductions.disabledAllowance,
      note: "60,000 / คน",
    },
    {
      labelKey: "taxDeductSocSec",
      value: deductions.socialSecurity,
      note: t("taxDeductMax9k"),
    },
    {
      labelKey: "taxDeductHomeLoan",
      value: deductions.homeLoanInterest,
      note: t("taxDeductMax100k"),
    },
    {
      labelKey: "taxDeductLifeIns",
      value: deductions.lifeInsurance,
      note: t("taxDeductMax100k"),
    },
    {
      labelKey: "taxDeductHealthIns",
      value: deductions.healthInsurance,
      note: t("taxDeductMax25k"),
    },
    {
      labelKey: "taxDeductPensionIns",
      value: deductions.pensionInsurance,
      note: t("taxDeductMax200k"),
    },
    {
      labelKey: "taxDeductRmf",
      value: deductions.rmf,
      note: t("taxDeductMax500k"),
    },
    {
      labelKey: "taxDeductThaiEsg",
      value: deductions.thaiEsg,
      note: t("taxDeductMax300k"),
    },
    {
      labelKey: "taxDeductEduDonation",
      value: deductions.eduDonation,
      note: t("taxDeductDonationNote"),
    },
    {
      labelKey: "taxDeductGenDonation",
      value: deductions.generalDonation,
      note: t("taxDeductDonationNote"),
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {t("taxDeductionsBreakdown")}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>
                {t("taxDeductItem")}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  fontSize: "0.75rem",
                }}
              >
                {t("taxDeductCap")}
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                {t("taxDeductAmount")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(({ labelKey, value, note }) => (
              <TableRow key={labelKey} sx={{ opacity: value === 0 ? 0.35 : 1 }}>
                <TableCell>{t(labelKey)}</TableCell>
                <TableCell
                  sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                >
                  {note ?? ""}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: value > 0 ? 600 : 400 }}
                >
                  {fmt(value)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                {t("taxTotal")}
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 700, color: "success.main" }}
              >
                {fmt(deductions.total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
