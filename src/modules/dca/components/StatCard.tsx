import { Card, CardContent, Typography } from "@mui/material";

interface StatCardProps {
    label: string;
    value: string;
    color?: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
    return (
        <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, flex: 1 }}>
            <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: color ?? "text.primary" }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}
