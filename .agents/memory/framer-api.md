# Framer API Patterns & Research

## Summary
Framer (`framer.com`) provides programmatic access to projects via the `framer-api` SDK (v0.1.29) and Server API over a stateful WebSocket connection.

## Key Findings
- **Authentication**: Project API Key (`FRAMER_API_KEY`) generated under Project Settings -> General -> API Keys.
- **Connection**: `connect("https://framer.com/projects/<projectName>--<projectId>", apiKey)`
- **Source Code Extraction**:
  - `getCodeFiles()`: returns all `.tsx` code components and overrides.
  - `getCodeFile(id)`: returns code content and exported property controls.
- **CMS Data Extraction**:
  - `getCollections()`, `getItems(collectionId)`: extracts all CMS data records and schemas.
- **Publish & Deploy**:
  - `publish()`: triggers instant production publish.
- **Research Doc**: [`docs/research/framer-api.md`](../../docs/research/framer-api.md)
