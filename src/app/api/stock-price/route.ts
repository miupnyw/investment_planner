import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const symbol = request.nextUrl.searchParams.get("symbol");
    if (!symbol) {
        return Response.json({ error: "symbol is required" }, { status: 400 });
    }

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (!res.ok) {
            return Response.json({ error: "Symbol not found" }, { status: 404 });
        }

        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;

        if (!meta?.regularMarketPrice) {
            return Response.json({ error: "Price unavailable" }, { status: 404 });
        }

        return Response.json({
            symbol: meta.symbol as string,
            price: meta.regularMarketPrice as number,
            currency: meta.currency as string,
        });
    } catch {
        return Response.json({ error: "Failed to fetch price" }, { status: 502 });
    }
}
