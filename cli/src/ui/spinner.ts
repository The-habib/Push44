import ora, { type Ora } from "ora";
import pc from "picocolors";

export function createSpinner(initialText: string): Ora {
  return ora({
    text: pc.cyan(initialText),
    color: "cyan",
    spinner: "dots",
  });
}

export async function withSpinner<T>(
  text: string,
  action: (spinner: Ora) => Promise<T>,
  successText?: string | ((result: T) => string)
): Promise<T> {
  const spinner = createSpinner(text).start();
  try {
    const result = await action(spinner);
    if (typeof successText === "function") {
      spinner.succeed(pc.green(successText(result)));
    } else if (successText) {
      spinner.succeed(pc.green(successText));
    } else {
      spinner.succeed();
    }
    return result;
  } catch (err: any) {
    spinner.fail(pc.red(err.message || String(err)));
    throw err;
  }
}
