import { describe, it, expect, vi, afterEach } from "vitest";
import { formatDate, calcDuration } from "./dates";

describe("formatDate", () => {
  it("formats YYYY-MM to abbreviated month + 2-digit year", () => {
    expect(formatDate("2023-05")).toBe("May '23");
    expect(formatDate("2019-01")).toBe("Jan '19");
    expect(formatDate("2025-12")).toBe("Dec '25");
  });

  it("handles single-digit months", () => {
    expect(formatDate("2020-01")).toBe("Jan '20");
    expect(formatDate("2020-09")).toBe("Sep '20");
  });
});

describe("calcDuration", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts both start and end months (inclusive)", () => {
    // Apr, May, Jun, Jul = 4 months
    expect(calcDuration("2023-04", "2023-07")).toBe("4m");
    // Jan, Feb = 2 months
    expect(calcDuration("2023-01", "2023-02")).toBe("2m");
  });

  it("calculates multi-year durations", () => {
    // Jul '21 to Apr '22 = 10 months
    expect(calcDuration("2021-07", "2022-04")).toBe("10m");
    // Dec '18 to Jul '21 = 2y 8m
    expect(calcDuration("2018-12", "2021-07")).toBe("2y 8m");
    // Jan '19 to May '21 = 2y 5m
    expect(calcDuration("2019-01", "2021-05")).toBe("2y 5m");
  });

  it("returns exact years when months align", () => {
    // Jan '20 to Dec '21 = 2y (24 months inclusive)
    expect(calcDuration("2020-01", "2021-12")).toBe("2y");
  });

  it("returns 1m for same-month start and end", () => {
    expect(calcDuration("2023-05", "2023-05")).toBe("1m");
  });

  it("uses current date when end is null", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15"));

    // Dec '22 to Mar '26 inclusive = 3y 4m (40 months)
    expect(calcDuration("2022-12", null)).toBe("3y 4m");
  });

  it("matches real experience data durations", () => {
    // Clipboard Health: Dec '22 to present — tested with mock date above
    // Amazon: Jul '21 to Apr '22 = 10m
    expect(calcDuration("2021-07", "2022-04")).toBe("10m");
    // Smallcase: Dec '18 to Jul '21 = 2y 8m
    expect(calcDuration("2018-12", "2021-07")).toBe("2y 8m");
    // Grey Orange: Aug '17 to Nov '18 = 1y 4m
    expect(calcDuration("2017-08", "2018-11")).toBe("1y 4m");
    // GSoC: Apr '16 to Jul '16 = 4m
    expect(calcDuration("2016-04", "2016-07")).toBe("4m");
  });
});
