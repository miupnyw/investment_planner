import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLanguage } from "@/context/LanguageContext";
import { IncomeItem, TaxInputs } from "@/lib/tax";
import { IncomeList } from "./IncomeList";

// minWidth: 0 lets grid items shrink into their track instead of overflowing.
// Section labels, the income list, the spouse toggle and dividers span every
// column to break the row between groups.
const fieldSx = { minWidth: 0 } as const;
const breakSx = { gridColumn: "1 / -1" } as const;

interface TaxInputsPanelProps {
  inputs: TaxInputs;
  symbol: string;
  toDisplay: (thb: number) => number;
  toTHB: (v: number) => number;
  donationCap: number;
  fmt: (v: number) => string;
  onChange: (patch: Partial<TaxInputs>) => void;
  onIncomeChange: (items: IncomeItem[]) => void;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        ...breakSx,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      {label}
    </Typography>
  );
}

function MoneyInput({
  label,
  thbValue,
  helper,
  symbol,
  toDisplay,
  toTHB,
  onChange,
}: {
  label: string;
  thbValue: number;
  helper?: string;
  symbol: string;
  toDisplay: (thb: number) => number;
  toTHB: (v: number) => number;
  onChange: (thb: number) => void;
}) {
  const displayVal =
    thbValue === 0 ? "" : String(Math.round(toDisplay(thbValue)));
  return (
    <TextField
      label={label}
      type="number"
      value={displayVal}
      onChange={(e) => {
        const raw = e.target.value;
        onChange(raw === "" ? 0 : Math.round(toTHB(parseFloat(raw) || 0)));
      }}
      helperText={helper}
      slotProps={{
        htmlInput: { min: 0 },
        input: {
          startAdornment: (
            <InputAdornment position="start">{symbol}</InputAdornment>
          ),
        },
      }}
      sx={fieldSx}
    />
  );
}

function CountInput({
  label,
  value,
  helper,
  max,
  onChange,
}: {
  label: string;
  value: number;
  helper?: string;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <TextField
      label={label}
      type="number"
      value={value}
      onChange={(e) => {
        const v = Math.max(0, parseInt(e.target.value) || 0);
        onChange(max !== undefined ? Math.min(v, max) : v);
      }}
      helperText={helper}
      slotProps={{
        htmlInput: { min: 0, ...(max !== undefined ? { max } : {}) },
      }}
      sx={fieldSx}
    />
  );
}

function Section({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box>
      <Box
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          py: 0.5,
        }}
      >
        <SectionLabel label={label} />
        <IconButton
          size="small"
          aria-expanded={open}
          aria-label={label}
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: (theme) => theme.transitions.create("transform"),
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            alignItems: "flex-start",
            gap: 2,
            pt: 1.5,
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

export function TaxInputsPanel({
  inputs,
  symbol,
  toDisplay,
  toTHB,
  donationCap,
  fmt,
  onChange,
  onIncomeChange,
}: TaxInputsPanelProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  return (
    <Card
      elevation={0}
      sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            mb: expanded ? 3 : 0,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t("taxInputs")}
          </Typography>
        </Box>
          <Stack divider={<Divider />} spacing={1}>
            {/* Income */}
            <Section label={t("taxAnnualIncome")} defaultOpen>
              <Box sx={breakSx}>
                <IncomeList
                  items={inputs.incomeItems}
                  symbol={symbol}
                  toDisplay={toDisplay}
                  toTHB={toTHB}
                  onChange={onIncomeChange}
                />
              </Box>
            </Section>

            {/* Personal & Family */}
            <Section label={t("taxSectionFamily")}>
              <FormControlLabel
                sx={breakSx}
                control={
                  <Switch
                    checked={inputs.hasSpouse}
                    onChange={(e) => onChange({ hasSpouse: e.target.checked })}
                  />
                }
                label={t("taxHasSpouse")}
              />
              <CountInput
                label={t("taxNumChildren")}
                value={inputs.numChildren}
                helper={t("taxChildHelper")}
                onChange={(v) => onChange({ numChildren: v })}
              />
              <CountInput
                label={t("taxNumChildren2ndPlus")}
                value={inputs.numChildren2ndPlus}
                helper={t("taxChildren2ndPlusHelper")}
                onChange={(v) => onChange({ numChildren2ndPlus: v })}
              />
              <MoneyInput
                label={t("taxPregnancy")}
                thbValue={inputs.pregnancyExpense}
                helper={t("taxPregnancyHelper")}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ pregnancyExpense: v })}
              />
              <CountInput
                label={t("taxNumParents")}
                value={inputs.numParents}
                helper={t("taxParentHelper")}
                max={4}
                onChange={(v) => onChange({ numParents: v })}
              />
              <CountInput
                label={t("taxNumDisabled")}
                value={inputs.numDisabled}
                helper={t("taxDisabledHelper")}
                onChange={(v) => onChange({ numDisabled: v })}
              />
            </Section>

            {/* Donations & Home loan */}
            <Section label={t("taxSectionDonations")}>
              <MoneyInput
                label={t("taxHomeLoan")}
                thbValue={inputs.homeLoanInterest}
                helper={t("taxHomeLoanHelper")}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ homeLoanInterest: v })}
              />
              <MoneyInput
                label={t("taxEduDonation")}
                thbValue={inputs.eduDonation}
                helper={`${t("taxEduDonationHelper")} — ${t("taxDonationCapLabel")} ${fmt(donationCap)}`}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ eduDonation: v })}
              />
              <MoneyInput
                label={t("taxGeneralDonation")}
                thbValue={inputs.generalDonation}
                helper={`${t("taxGeneralDonationHelper")} — ${t("taxDonationCapLabel")} ${fmt(donationCap)}`}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ generalDonation: v })}
              />
            </Section>

            {/* Insurance */}
            <Section label={t("taxInsurance")}>
              <MoneyInput
                label={t("taxSocialSecurity")}
                thbValue={inputs.socialSecurity}
                helper={t("taxSocSecHelper")}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ socialSecurity: v })}
              />
              <MoneyInput
                label={t("taxLifeInsurance")}
                thbValue={inputs.lifeInsurance}
                helper={t("taxLifeInsHelper")}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ lifeInsurance: v })}
              />
              <MoneyInput
                label={t("taxHealthInsurance")}
                thbValue={inputs.healthInsurance}
                helper={t("taxHealthInsHelper")}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ healthInsurance: v })}
              />
              <MoneyInput
                label={t("taxPensionInsurance")}
                thbValue={inputs.pensionInsurance}
                helper={t("taxPensionInsHelper")}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ pensionInsurance: v })}
              />
            </Section>

            {/* Retirement funds */}
            <Section label={t("taxFunds")}>
              <MoneyInput
                label={t("taxRmf")}
                thbValue={inputs.rmf}
                helper={t("taxRmfHelper")}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ rmf: v })}
              />
              <MoneyInput
                label={t("taxThaiEsg")}
                thbValue={inputs.thaiEsg}
                helper={t("taxThaiEsgHelper")}
                symbol={symbol}
                toDisplay={toDisplay}
                toTHB={toTHB}
                onChange={(v) => onChange({ thaiEsg: v })}
              />
            </Section>
          </Stack>
      </CardContent>
    </Card>
  );
}
