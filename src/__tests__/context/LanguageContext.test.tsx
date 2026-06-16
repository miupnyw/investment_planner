import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

function Consumer() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="appTitle">{t("appTitle")}</span>
      <span data-testid="getStarted">{t("getStarted")}</span>
      <span data-testid="unknown">{t("nonExistentKey")}</span>
      <button onClick={() => setLanguage("th")}>set-th</button>
      <button onClick={() => setLanguage("en")}>set-en</button>
    </div>
  );
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("LanguageProvider", () => {
  it("defaults to English", () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
  });

  it("translates key using English by default", () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("appTitle")).toHaveTextContent(
      "Investment Planner",
    );
    expect(screen.getByTestId("getStarted")).toHaveTextContent("Get Started");
  });

  it("switches language to Thai", () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set-th" }));
    expect(screen.getByTestId("lang")).toHaveTextContent("th");
  });

  it("translates key using Thai after setLanguage", () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set-th" }));
    expect(screen.getByTestId("appTitle")).toHaveTextContent("แผนการลงทุน");
    expect(screen.getByTestId("getStarted")).toHaveTextContent(
      "เริ่มต้นใช้งาน",
    );
  });

  it("returns the key itself as fallback for unknown translation keys", () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("unknown")).toHaveTextContent("nonExistentKey");
  });

  it("switches back to English from Thai", () => {
    render(
      <LanguageProvider>
        <Consumer />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "set-th" }));
    fireEvent.click(screen.getByRole("button", { name: "set-en" }));
    expect(screen.getByTestId("lang")).toHaveTextContent("en");
    expect(screen.getByTestId("appTitle")).toHaveTextContent(
      "Investment Planner",
    );
  });
});

describe("useLanguage", () => {
  it("throws when used outside LanguageProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      "useLanguage must be used within LanguageProvider",
    );
    spy.mockRestore();
  });
});
