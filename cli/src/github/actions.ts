import { requestWithRetry } from "../utils/network.js";
import { Push44Error } from "../utils/errors.js";

const GH_API = "https://api.github.com";

function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "Push44-CLI",
  };
}

export interface WorkflowRun {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed" | "waiting";
  conclusion: "success" | "failure" | "neutral" | "cancelled" | "timed_out" | "action_required" | null;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export async function listWorkflowRuns(
  token: string,
  owner: string,
  repo: string,
  limit = 5
): Promise<WorkflowRun[]> {
  try {
    const res = await requestWithRetry(
      `${GH_API}/repos/${owner}/${repo}/actions/runs?per_page=${limit}`,
      { headers: ghHeaders(token) }
    );
    if (!res.ok) return [];
    const d = await res.json();
    return (d.workflow_runs || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      conclusion: r.conclusion,
      html_url: r.html_url,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  } catch {
    return [];
  }
}

export async function triggerWorkflowDispatch(
  token: string,
  owner: string,
  repo: string,
  workflowIdOrFilename: string,
  ref = "main",
  inputs: Record<string, any> = {}
): Promise<void> {
  const res = await requestWithRetry(
    `${GH_API}/repos/${owner}/${repo}/actions/workflows/${workflowIdOrFilename}/dispatches`,
    {
      method: "POST",
      headers: { ...ghHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ ref, inputs }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Push44Error(`Failed to trigger workflow (${res.status}): ${body}`);
  }
}

export async function watchWorkflow(
  token: string,
  owner: string,
  repo: string,
  runId: number,
  onUpdate?: (run: WorkflowRun) => void,
  maxWaitMs = 5 * 60 * 1000
): Promise<WorkflowRun> {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    const res = await requestWithRetry(`${GH_API}/repos/${owner}/${repo}/actions/runs/${runId}`, {
      headers: ghHeaders(token),
    });
    if (res.ok) {
      const r = await res.json();
      const run: WorkflowRun = {
        id: r.id,
        name: r.name,
        status: r.status,
        conclusion: r.conclusion,
        html_url: r.html_url,
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
      onUpdate?.(run);
      if (run.status === "completed") return run;
    }
    await new Promise((r) => setTimeout(r, 4000));
  }

  throw new Push44Error("Workflow run watch timed out.");
}
