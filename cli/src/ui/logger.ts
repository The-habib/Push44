import pc from "picocolors";
import { symbols } from "./theme.js";

export const logger = {
  info(msg: string) {
    console.log(`${symbols.info} ${msg}`);
  },
  success(msg: string) {
    console.log(`${symbols.tick} ${msg}`);
  },
  warn(msg: string) {
    console.log(`${symbols.warning} ${pc.yellow(msg)}`);
  },
  error(msg: string) {
    console.error(`${symbols.cross} ${pc.red(msg)}`);
  },
  step(current: number, total: number, msg: string) {
    console.log(`${pc.dim(`[${current}/${total}]`)} ${pc.cyan(msg)}`);
  },
  dim(msg: string) {
    console.log(pc.dim(msg));
  },
  log(msg = "") {
    console.log(msg);
  },
  debug(msg: string) {
    if (process.env.DEBUG || process.env.PUSH44_DEBUG) {
      console.log(pc.dim(`[DEBUG] ${msg}`));
    }
  },
};
