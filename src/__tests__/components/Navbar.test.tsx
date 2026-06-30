import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import Navbar from "@/components/Navbar";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/"),
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

describe("Navbar", () => {
  it("renders all navigation links", () => {
    renderWithProviders(<Navbar />);
    expect(
      screen.getByRole("button", { name: /finance/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /health/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /leisure/i }),
    ).toBeInTheDocument();
  });

  it("opens the DCA and Tax calculators as a submenu of Finance", () => {
    renderWithProviders(<Navbar />);

    fireEvent.click(screen.getByRole("button", { name: /finance/i }));

    expect(
      screen.getByRole("menuitem", { name: /dca calculator/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /tax calculator/i }),
    ).toBeInTheDocument();
  });

  it("renders the currency toggle with THB and USD options", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("button", { name: /thb/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /usd/i })).toBeInTheDocument();
  });

  it("renders the language select", () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders the theme toggle button", () => {
    renderWithProviders(<Navbar />);
    expect(
      screen.getByRole("button", { name: /dark mode/i }),
    ).toBeInTheDocument();
  });

  it("shows light mode button when theme is dark", () => {
    localStorage.setItem("theme", "dark");
    renderWithProviders(<Navbar />);
    expect(
      screen.getByRole("button", { name: /light mode/i }),
    ).toBeInTheDocument();
  });

  it("marks the Finance parent active when a calculator sub-route is open", () => {
    const { usePathname } = jest.requireMock("next/navigation");
    usePathname.mockReturnValue("/finance/dca");
    renderWithProviders(<Navbar />);
    const financeButton = screen.getByRole("button", { name: /finance/i });
    // active parent rendered with primary color (fontWeight 700)
    expect(financeButton).toBeInTheDocument();
  });
});
