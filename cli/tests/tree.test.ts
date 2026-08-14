import { describe, expect, it } from "bun:test";
import { renderFileTree } from "../src/ui/tree.js";

describe("Visual File Tree", () => {
  it("renders a nested tree with icons", () => {
    const files = [
      { path: "package.json", content: "{}" },
      { path: "src/main.tsx", content: "console.log('hi')" },
      { path: "src/components/Button.tsx", content: "export const Button = () => null;" },
      { path: "src/styles.css", content: "body {}" },
    ];

    const tree = renderFileTree(files);
    expect(tree).toContain("package.json");
    expect(tree).toContain("src/");
    expect(tree).toContain("Button.tsx");
    expect(tree).toContain("styles.css");
  });
});
