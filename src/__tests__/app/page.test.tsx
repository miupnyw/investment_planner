import { screen } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import Home from "@/app/page";

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

describe("Home page", () => {
  it("renders without crashing", () => {
    renderWithProviders(<Home />);
  });

  it("renders the Wheel of Life dashboard", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Your Wheel of Life")).toBeInTheDocument();
  });

  it("renders the weekly review call-to-action", () => {
    renderWithProviders(<Home />);
    expect(
      screen.getByRole("button", { name: /this week's review/i }),
    ).toBeInTheDocument();
  });
});
