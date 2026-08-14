#!/usr/bin/env node
import { createProgram } from "../src/index.js";

const program = createProgram();
await program.parseAsync(process.argv);
