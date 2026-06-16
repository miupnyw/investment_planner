/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "@/app/api/stock-price/route";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/stock-price", () => {
  it("returns 400 when symbol query param is missing", async () => {
    const req = new NextRequest("http://localhost/api/stock-price");
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "symbol is required" });
  });

  it("returns price data when symbol is valid", async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        chart: {
          result: [
            {
              meta: {
                symbol: "AAPL",
                regularMarketPrice: 150.25,
                currency: "USD",
              },
            },
          ],
        },
      }),
    } as unknown as Response);

    const req = new NextRequest("http://localhost/api/stock-price?symbol=AAPL");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      symbol: "AAPL",
      price: 150.25,
      currency: "USD",
    });
  });

  it("returns 404 when upstream fetch is not ok", async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);

    const req = new NextRequest(
      "http://localhost/api/stock-price?symbol=INVALID",
    );
    const res = await GET(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Symbol not found" });
  });

  it("returns 404 when response contains no regularMarketPrice", async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ chart: { result: [{ meta: {} }] } }),
    } as unknown as Response);

    const req = new NextRequest("http://localhost/api/stock-price?symbol=AAPL");
    const res = await GET(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Price unavailable" });
  });

  it("returns 502 when fetch throws a network error", async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error("network"));

    const req = new NextRequest("http://localhost/api/stock-price?symbol=AAPL");
    const res = await GET(req);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "Failed to fetch price" });
  });
});
