/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "@/app/api/stock-search/route";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/stock-search", () => {
  it("returns empty quotes when q param is missing", async () => {
    const req = new NextRequest("http://localhost/api/stock-search");
    const res = await GET(req);
    expect(await res.json()).toEqual({ quotes: [] });
  });

  it("returns empty quotes for a whitespace-only query", async () => {
    const req = new NextRequest("http://localhost/api/stock-search?q=   ");
    const res = await GET(req);
    expect(await res.json()).toEqual({ quotes: [] });
  });

  it("returns Equity and ETF quotes filtered from upstream response", async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        quotes: [
          {
            symbol: "AAPL",
            shortname: "Apple Inc.",
            exchDisp: "NASDAQ",
            typeDisp: "Equity",
          },
          {
            symbol: "SPY",
            shortname: "SPDR S&P 500",
            exchDisp: "NYSE Arca",
            typeDisp: "ETF",
          },
          {
            symbol: "USDTHB=X",
            shortname: "USD/THB",
            exchDisp: "CCY",
            typeDisp: "CURRENCY",
          },
        ],
      }),
    } as unknown as Response);

    const req = new NextRequest("http://localhost/api/stock-search?q=apple");
    const res = await GET(req);
    const body = await res.json();
    expect(body.quotes).toHaveLength(2);
    expect(body.quotes[0]).toEqual({
      symbol: "AAPL",
      name: "Apple Inc.",
      exchange: "NASDAQ",
      type: "Equity",
    });
    expect(body.quotes[1]).toEqual({
      symbol: "SPY",
      name: "SPDR S&P 500",
      exchange: "NYSE Arca",
      type: "ETF",
    });
  });

  it("falls back to longname when shortname is absent", async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        quotes: [
          {
            symbol: "VTI",
            longname: "Vanguard Total Stock Market ETF",
            exchDisp: "NYSE Arca",
            typeDisp: "ETF",
          },
        ],
      }),
    } as unknown as Response);

    const req = new NextRequest("http://localhost/api/stock-search?q=vti");
    const res = await GET(req);
    const body = await res.json();
    expect(body.quotes[0].name).toBe("Vanguard Total Stock Market ETF");
  });

  it("returns empty quotes when upstream fetch is not ok", async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);

    const req = new NextRequest("http://localhost/api/stock-search?q=AAPL");
    const res = await GET(req);
    expect(await res.json()).toEqual({ quotes: [] });
  });

  it("returns empty quotes when fetch throws a network error", async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error("network"));

    const req = new NextRequest("http://localhost/api/stock-search?q=AAPL");
    const res = await GET(req);
    expect(await res.json()).toEqual({ quotes: [] });
  });
});
