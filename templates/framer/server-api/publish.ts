#!/usr/bin/env bun
import assert from "node:assert";
import { connect } from "framer-api";

/**
 * Official Framer Server API Automation Script
 * Usage:
 *   export FRAMER_API_KEY="<YOUR_KEY>"
 *   export FRAMER_PROJECT_URL="https://framer.com/projects/..."
 *   bun templates/framer/server-api/publish.ts
 */

const projectUrl = process.env.FRAMER_PROJECT_URL;
const apiKey = process.env.FRAMER_API_KEY;

assert(projectUrl, "FRAMER_PROJECT_URL environment variable is required");
assert(apiKey, "FRAMER_API_KEY environment variable is required");

console.log(`Connecting to Framer project: ${projectUrl}...`);
using framer = await connect(projectUrl, apiKey);

const projectInfo = await framer.getProjectInfo();
console.log(`✓ Connected to project: "${projectInfo.name}" (${projectInfo.id})`);

// Fetch code files
const codeFiles = await framer.getCodeFiles();
console.log(`📦 Discovered ${codeFiles.length} Code Component(s):`);
for (const file of codeFiles) {
  console.log(`   - ${file.name} (Version: ${file.versionId})`);
}

// Fetch CMS collections
const collections = await framer.getCollections();
console.log(`📊 Discovered ${collections.length} CMS Collection(s):`);
for (const col of collections) {
  const items = await col.getItems();
  console.log(`   - ${col.name} (${items.length} records)`);
}

// Check unpublished changes
const changes = await framer.getUnpublishedPageChanges();
console.log(`🔍 Unpublished canvas changes: ${changes.length}`);

// Trigger publication
console.log("🚀 Triggering live site publish...");
const { deployment, hostnames } = await framer.publish();
console.log(`✓ Publish Succeeded! Deployment ID: ${deployment.id}`);

if (hostnames && hostnames.length > 0) {
  console.log("🌐 Live URLs:");
  for (const h of hostnames) {
    console.log(`   https://${h.hostname}`);
  }
}
