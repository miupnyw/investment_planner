import { lightTheme, darkTheme } from "@/lib/theme";

describe("lightTheme", () => {
  it("has light palette mode", () => {
    expect(lightTheme.palette.mode).toBe("light");
  });

  it("has correct primary color", () => {
    expect(lightTheme.palette.primary.main).toBe("#1976d2");
  });

  it("has correct secondary color", () => {
    expect(lightTheme.palette.secondary.main).toBe("#9c27b0");
  });
});

describe("darkTheme", () => {
  it("has dark palette mode", () => {
    expect(darkTheme.palette.mode).toBe("dark");
  });

  it("has correct primary color", () => {
    expect(darkTheme.palette.primary.main).toBe("#90caf9");
  });

  it("has correct secondary color", () => {
    expect(darkTheme.palette.secondary.main).toBe("#ce93d8");
  });
});
