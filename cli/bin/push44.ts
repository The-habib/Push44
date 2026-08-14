#!/usr/bin/env bun
import { createProgram } from "../src/index.js";

const program = createProgram();
await program.parseAsync(process.argv);
