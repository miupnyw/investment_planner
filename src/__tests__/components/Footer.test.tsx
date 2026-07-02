import { screen } from "@testing-library/react";
import { renderWithProviders } from "../utils/test-utils";
import Footer from "@/components/Footer";

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

describe("Footer", () => {
  it("renders the copyright notice", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });
});
