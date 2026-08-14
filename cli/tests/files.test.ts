import { describe, expect, it } from "bun:test";
import { sanitizeRelativePath, formatBytes, createZipArchive } from "../src/utils/files.js";
import JSZip from "jszip";

describe("File & Archive Utilities", () => {
  it("sanitizes relative paths and blocks directory traversal", () => {
    expect(sanitizeRelativePath("../../etc/passwd")).toBe("etc/passwd");
    expect(sanitizeRelativePath("/src/components/button.tsx")).toBe("src/components/button.tsx");
    expect(sanitizeRelativePath("src\\index.ts")).toBe("src/index.ts");
  });

  it("formats bytes accurately", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.5 MB");
  });

  it("builds valid ZIP archives containing project files", async () => {
    const files = [
      { path: "src/index.ts", content: "console.log('Push44');" },
      { path: "README.md", content: "# Push44" },
    ];

    const zipBuffer = await createZipArchive(files);
    expect(zipBuffer.length).toBeGreaterThan(0);

    const unzipped = await JSZip.loadAsync(zipBuffer);
    expect(unzipped.file("src/index.ts")).not.toBeNull();
    const indexContent = await unzipped.file("src/index.ts")?.async("string");
    expect(indexContent).toBe("console.log('Push44');");
  });
});
