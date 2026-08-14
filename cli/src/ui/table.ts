import Table from "cli-table3";
import pc from "picocolors";

export interface TableOptions {
  head?: string[];
  colWidths?: number[];
  colAligns?: ("left" | "middle" | "right")[];
  wordWrap?: boolean;
}

export function createTable(options: TableOptions = {}): Table.Table {
  const tableConfig: any = {
    chars: {
      top: "─",
      "top-mid": "┬",
      "top-left": "┌",
      "top-right": "┐",
      bottom: "─",
      "bottom-mid": "┴",
      "bottom-left": "└",
      "bottom-right": "┘",
      left: "│",
      "left-mid": "├",
      mid: "─",
      "mid-mid": "┼",
      right: "│",
      "right-mid": "┤",
      middle: "│",
    },
    style: {
      "padding-left": 1,
      "padding-right": 1,
      head: [],
      border: ["dim"],
    },
  };

  if (options.head && options.head.length > 0) {
    tableConfig.head = options.head.map((h) => pc.bold(pc.cyan(h)));
  }
  if (options.colWidths && options.colWidths.length > 0) {
    tableConfig.colWidths = options.colWidths;
  }
  if (options.colAligns && options.colAligns.length > 0) {
    tableConfig.colAligns = options.colAligns;
  }
  if (options.wordWrap !== undefined) {
    tableConfig.wordWrap = options.wordWrap;
  }

  return new Table(tableConfig);
}
