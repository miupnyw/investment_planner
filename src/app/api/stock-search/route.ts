import { NextRequest } from "next/server";

export interface StockOption {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get("q");
    if (!q || q.trim().length === 0) {
        return Response.json({ quotes: [] });
    }

    try {
        const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0`;
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (!res.ok) return Response.json({ quotes: [] });

        const data = await res.json();
        const quotes: StockOption[] = (data?.quotes ?? [])
            .filter((q: { typeDisp?: string }) => q.typeDisp === "Equity" || q.typeDisp === "ETF")
            .map((q: { symbol: string; shortname?: string; longname?: string; exchDisp?: string; typeDisp?: string }) => ({
                symbol: q.symbol,
                name: q.shortname ?? q.longname ?? q.symbol,
                exchange: q.exchDisp ?? "",
                type: q.typeDisp ?? "",
            }));

        return Response.json({ quotes });
    } catch {
        return Response.json({ quotes: [] });
    }
}
