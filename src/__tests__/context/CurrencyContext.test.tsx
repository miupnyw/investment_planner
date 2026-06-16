import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CurrencyProvider, useCurrency } from "@/context/CurrencyContext";

function Consumer() {
  const { currency, setCurrency, symbol, rate, rateLoading, toTHB, toDisplay } =
    useCurrency();
  return (
    <div>
      <span data-testid="currency">{currency}</span>
      <span data-testid="symbol">{symbol}</span>
      <span data-testid="rate">{rate}</span>
      <span data-testid="rateLoading">{String(rateLoading)}</span>
      <span data-testid="toTHB">{toTHB(100)}</span>
      <span data-testid="toDisplay">{toDisplay(3600)}</span>
      <button onClick={() => setCurrency("USD")}>set-usd</button>
      <button onClick={() => setCurrency("THB")}>set-thb</button>
    </div>
  );
}

describe("CurrencyProvider", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ rates: { THB: 36 } }),
    } as unknown as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("defaults to THB currency", () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId("currency")).toHaveTextContent("THB");
  });

  it("shows ฿ symbol for THB", () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId("symbol")).toHaveTextContent("฿");
  });

  it("initialises with DEFAULT_RATE of 36", () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId("rate")).toHaveTextContent("36");
  });

  it("sets rateLoading to false after fetch completes", async () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("rateLoading")).toHaveTextContent("false"),
    );
  });

  it("fetches the exchange rate from open.er-api.com on mount", async () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("rateLoading")).toHaveTextContent("false"),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "https://open.er-api.com/v6/latest/USD",
    );
  });

  it("keeps DEFAULT_RATE when fetch throws a network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network"));
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("rateLoading")).toHaveTextContent("false"),
    );
    expect(screen.getByTestId("rate")).toHaveTextContent("36");
  });

  it("switches currency to USD and shows $ symbol", () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "set-usd" }));

    expect(screen.getByTestId("currency")).toHaveTextContent("USD");
    expect(screen.getByTestId("symbol")).toHaveTextContent("$");
  });

  it("toTHB returns THB amount unchanged in THB mode", () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId("toTHB")).toHaveTextContent("100");
  });

  it("toTHB converts USD to THB using the rate", () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set-usd" }));
    // 100 USD × 36 = 3600 THB
    expect(screen.getByTestId("toTHB")).toHaveTextContent("3600");
  });

  it("toDisplay returns THB amount unchanged in THB mode", () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId("toDisplay")).toHaveTextContent("3600");
  });

  it("toDisplay converts THB to USD using the rate", () => {
    render(
      <CurrencyProvider>
        <Consumer />
      </CurrencyProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set-usd" }));
    // 3600 THB ÷ 36 = 100 USD
    expect(screen.getByTestId("toDisplay")).toHaveTextContent("100");
  });
});

describe("useCurrency", () => {
  it("throws when used outside CurrencyProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      "useCurrency must be used within CurrencyProvider",
    );
    spy.mockRestore();
  });
});
