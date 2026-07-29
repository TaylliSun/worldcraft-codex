import type { ReleaseChannel, ReleaseStatus } from "./release-management";

declare global {
  interface Window {
    worldcraftRelease?: {
      getStatus: () => Promise<ReleaseStatus>;
      setPreferences: (patch: {
        channel?: ReleaseChannel;
        autoCheck?: boolean;
        autoDownload?: boolean;
      }) => Promise<ReleaseStatus>;
      checkForUpdates: () => Promise<ReleaseStatus>;
      downloadUpdate: () => Promise<ReleaseStatus>;
      installUpdate: () => Promise<ReleaseStatus>;
      acceptLegal: (version: string) => Promise<ReleaseStatus>;
      openLink: (
        kind: "homepage" | "support" | "privacy" | "terms"
      ) => Promise<{ ok: boolean; error?: string }>;
      quit: () => Promise<{ ok: boolean }>;
      subscribeStatus: (callback: (status: ReleaseStatus) => void) => number;
      unsubscribeStatus: (listenerId: number) => boolean;
    };
  }
}

export {};
