import { computeDCA } from "@/modules/dca/dca";

describe("computeDCA", () => {
  it("includes year 0 as the first data point with the start principal", () => {
    const result = computeDCA(1000, 0, 0, 0);
    expect(result.data[0]).toEqual({
      year: 0,
      balance: 1000,
      principal: 1000,
      coasting: false,
    });
  });

  it("accumulates principal correctly with 0% return", () => {
    const result = computeDCA(0, 100, 0, 1);
    expect(result.totalPrincipal).toBe(1200);
    expect(result.totalBalance).toBe(1200);
    expect(result.totalProfit).toBe(0);
  });

  it("grows balance with a positive annual return rate", () => {
    const result = computeDCA(1000, 0, 12, 1);
    expect(result.totalBalance).toBeGreaterThan(1000);
  });

  it("produces data array of length investYears + coastYears + 1", () => {
    const result = computeDCA(0, 100, 7, 10, 5);
    expect(result.data).toHaveLength(16); // year 0–15
  });

  it("marks data points as coasting only after investYears", () => {
    const result = computeDCA(0, 100, 7, 2, 3);
    expect(result.data[0].coasting).toBe(false);
    expect(result.data[1].coasting).toBe(false);
    expect(result.data[2].coasting).toBe(false);
    expect(result.data[3].coasting).toBe(true);
    expect(result.data[4].coasting).toBe(true);
    expect(result.data[5].coasting).toBe(true);
  });

  it("stops adding to principal during the coast period", () => {
    const result = computeDCA(0, 1000, 0, 1, 1);
    expect(result.data[1].principal).toBe(12000);
    expect(result.data[2].principal).toBe(12000);
  });

  it("coast balance equals invest-end balance when return rate is 0%", () => {
    const result = computeDCA(0, 1000, 0, 1, 1);
    expect(result.data[1].balance).toBe(12000);
    expect(result.data[2].balance).toBe(12000);
  });

  it("totalProfit equals totalBalance minus totalPrincipal", () => {
    const result = computeDCA(1000, 500, 8, 5, 2);
    expect(result.totalProfit).toBe(
      result.totalBalance - result.totalPrincipal,
    );
  });

  it("handles zero investYears and zero coastYears", () => {
    const result = computeDCA(500, 100, 7, 0, 0);
    expect(result.data).toHaveLength(1);
    expect(result.totalBalance).toBe(500);
    expect(result.totalPrincipal).toBe(500);
  });

  it("rounds all balance and principal values to whole numbers", () => {
    const result = computeDCA(1000, 100, 7, 1);
    result.data.forEach((point) => {
      expect(point.balance).toBe(Math.round(point.balance));
      expect(point.principal).toBe(Math.round(point.principal));
    });
  });

  it("uses 0 coastYears by default", () => {
    const withDefault = computeDCA(0, 100, 7, 3);
    const withExplicit = computeDCA(0, 100, 7, 3, 0);
    expect(withDefault.data).toHaveLength(withExplicit.data.length);
    expect(withDefault.totalBalance).toBe(withExplicit.totalBalance);
  });
});
