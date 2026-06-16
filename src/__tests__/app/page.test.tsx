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

  it("renders the hero headline", () => {
    renderWithProviders(<Home />);
    expect(
      screen.getByText("Take Control of Your Financial Future"),
    ).toBeInTheDocument();
  });

  it("renders the hero subtitle", () => {
    renderWithProviders(<Home />);
    expect(
      screen.getByText(/track portfolios, set goals/i),
    ).toBeInTheDocument();
  });

  it("renders Get Started buttons", () => {
    renderWithProviders(<Home />);
    expect(
      screen.getAllByRole("button", { name: /get started/i }),
    ).not.toHaveLength(0);
  });

  it("renders the features section title", () => {
    renderWithProviders(<Home />);
    expect(
      screen.getByText("Everything You Need to Invest Smarter"),
    ).toBeInTheDocument();
  });

  it("renders all four feature card titles", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Portfolio Tracking")).toBeInTheDocument();
    expect(screen.getByText("Goal Planning")).toBeInTheDocument();
    expect(screen.getByText("Risk Analysis")).toBeInTheDocument();
    expect(screen.getByText("Smart Insights")).toBeInTheDocument();
  });

  it("renders the CTA banner", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Ready to Start Investing?")).toBeInTheDocument();
  });

  it("renders the footer", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });
});
