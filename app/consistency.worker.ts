import { runConsistencyScan } from "./consistency";
import type {
  ConsistencyFinding,
  ConsistencySettings,
  ConsistencyWorkspaceInput
} from "./consistency";

type ScanRequest = {
  input: ConsistencyWorkspaceInput;
  previousFindings: ConsistencyFinding[];
  settings: ConsistencySettings;
};

self.onmessage = (event: MessageEvent<ScanRequest>) => {
  try {
    self.postMessage({ type: "running" });
    const result = runConsistencyScan(
      event.data.input,
      event.data.previousFindings,
      event.data.settings
    );
    self.postMessage({ type: "result", result });
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : "一致性扫描失败"
    });
  }
};

export {};
