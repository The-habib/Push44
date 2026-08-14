import { describe, expect, it } from "bun:test";
import { renderBarChart } from "../src/ui/chart.js";

describe("Bar Chart Visualizer", () => {
  it("renders weekly bar charts accurately", () => {
    const data = [
      { label: "Mon", value: 3 },
      { label: "Tue", value: 6 },
      { label: "Wed", value: 1 },
      { label: "Thu", value: 0 },
      { label: "Fri", value: 8, highlight: true },
    ];

    const output = renderBarChart(data);
    expect(output).toContain("Mon");
    expect(output).toContain("Tue");
    expect(output).toContain("Fri");
    expect(output).toContain("█");
  });
});
