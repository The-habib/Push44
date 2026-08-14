import cliProgress from "cli-progress";
import pc from "picocolors";

export function createProgressBar(title = "Progress"): cliProgress.SingleBar {
  return new cliProgress.SingleBar(
    {
      format: `${pc.cyan(title)} |${pc.cyan("{bar}")}| {percentage}% || {value}/{total} Files`,
      barCompleteChar: "█",
      barIncompleteChar: "░",
      hideCursor: true,
      clearOnComplete: false,
    },
    cliProgress.Presets.shades_classic
  );
}
