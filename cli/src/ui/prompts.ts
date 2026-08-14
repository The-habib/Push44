import prompts, { type PromptObject } from "prompts";

export async function askSelect<T extends string = string>(
  message: string,
  choices: { title: string; value: T; description?: string }[]
): Promise<T | null> {
  const res = await prompts(
    {
      type: "select",
      name: "value",
      message,
      choices,
    },
    { onCancel: () => process.exit(0) }
  );
  return res.value ?? null;
}

export async function askText(
  message: string,
  initial = "",
  validate?: (val: string) => boolean | string
): Promise<string> {
  const res = await prompts(
    {
      type: "text",
      name: "value",
      message,
      initial,
      validate,
    },
    { onCancel: () => process.exit(0) }
  );
  return res.value ?? "";
}

export async function askPassword(
  message: string,
  validate?: (val: string) => boolean | string
): Promise<string> {
  const res = await prompts(
    {
      type: "password",
      name: "value",
      message,
      validate,
    },
    { onCancel: () => process.exit(0) }
  );
  return res.value ?? "";
}

export async function askConfirm(message: string, initial = true): Promise<boolean> {
  const res = await prompts(
    {
      type: "confirm",
      name: "value",
      message,
      initial,
    },
    { onCancel: () => process.exit(0) }
  );
  return Boolean(res.value);
}
