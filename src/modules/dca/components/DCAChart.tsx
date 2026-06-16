import { Card, CardContent, Typography } from "@mui/material";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "@/context/LanguageContext";

interface ChartDataPoint {
  calendarYear: number;
  year: number;
  balance: number;
  principal: number;
}

interface DCAChartProps {
  data: ChartDataPoint[];
  currentYear: number;
  retireYear: number;
  coastStartYear: number;
  coastYears: number;
  fmt: (v: number) => string;
}

export function DCAChart({
  data,
  currentYear,
  retireYear,
  coastStartYear,
  coastYears,
  fmt,
}: DCAChartProps) {
  const { t } = useLanguage();

  return (
    <Card
      elevation={0}
      sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          {t("dcaChartTitle")}
        </Typography>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 24, left: 16, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="calendarYear"
              type="number"
              domain={[currentYear, retireYear]}
            />
            <YAxis
              tickFormatter={(v) => fmt(v)}
              width={80}
              label={{
                value: t("dcaChartBalance"),
                angle: -90,
                position: "insideLeft",
                offset: -4,
              }}
            />
            <Tooltip
              formatter={(value) => fmt(Number(value))}
              labelFormatter={(label) => String(label)}
            />
            {coastYears > 0 && (
              <ReferenceLine
                x={coastStartYear}
                stroke="#ed6c02"
                strokeDasharray="4 4"
                label={{
                  value: t("dcaEndInvestAge"),
                  fill: "#ed6c02",
                  fontSize: 11,
                  position: "insideTopRight",
                }}
              />
            )}
            <Legend />
            <Line
              type="monotone"
              dataKey="balance"
              name={t("dcaChartBalance")}
              stroke="#1976d2"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="principal"
              name={t("dcaChartPrincipal")}
              stroke="#9c27b0"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
