import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../utils/test-utils";
import DCAPage from "@/app/dca/page";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/dca"),
}));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ rates: { THB: 36 } }),
  } as unknown as Response);
  localStorage.clear();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("DCA page", () => {
  it("renders without crashing", () => {
    renderWithProviders(<DCAPage />);
  });

  it("renders the page title heading", () => {
    renderWithProviders(<DCAPage />);
    expect(
      screen.getByRole("heading", { name: "DCA Calculator", level: 4 }),
    ).toBeInTheDocument();
  });

  it("renders the inputs panel", () => {
    renderWithProviders(<DCAPage />);
    expect(screen.getByText("Inputs")).toBeInTheDocument();
  });

  it("renders age input fields with default values", () => {
    renderWithProviders(<DCAPage />);
    expect(screen.getByDisplayValue("25")).toBeInTheDocument(); // startAge
    expect(screen.getByDisplayValue("40")).toBeInTheDocument(); // endAge
    expect(screen.getByDisplayValue("60")).toBeInTheDocument(); // retireAge
  });

  it("renders the annual return rate field", () => {
    renderWithProviders(<DCAPage />);
    expect(screen.getByDisplayValue("7")).toBeInTheDocument();
  });

  it("renders stat cards for principal, profit, and balance", () => {
    renderWithProviders(<DCAPage />);
    expect(screen.getByText("Total Principal")).toBeInTheDocument();
    expect(screen.getByText("Total Profit")).toBeInTheDocument();
    expect(screen.getByText("Total Balance")).toBeInTheDocument();
  });

  it("renders the passive income section title", () => {
    renderWithProviders(<DCAPage />);
    expect(screen.getByText("Expected Passive Income")).toBeInTheDocument();
  });

  it("renders the chart title", () => {
    renderWithProviders(<DCAPage />);
    expect(screen.getByText("Balance Growth Over Years")).toBeInTheDocument();
  });
});
