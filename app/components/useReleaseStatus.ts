"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createEmptyReleaseStatus,
  type ReleaseChannel,
  type ReleaseStatus
} from "../release-management";

type ReleaseAction = "checkForUpdates" | "downloadUpdate" | "installUpdate";

export function useReleaseStatus() {
  const [status, setStatus] = useState<ReleaseStatus>(createEmptyReleaseStatus);
  const [busy, setBusy] = useState<ReleaseAction | "preferences" | "legal" | "">("");

  useEffect(() => {
    const api = window.worldcraftRelease;
    if (!api) return;
    let active = true;
    void api.getStatus().then((next) => {
      if (active) setStatus(next);
    }).catch(() => undefined);
    const listenerId = api.subscribeStatus((next) => {
      if (active) setStatus(next);
    });
    return () => {
      active = false;
      api.unsubscribeStatus(listenerId);
    };
  }, []);

  const run = useCallback(async (action: ReleaseAction) => {
    const api = window.worldcraftRelease;
    if (!api) return;
    setBusy(action);
    try {
      const next = await api[action]();
      setStatus(next);
    } finally {
      setBusy("");
    }
  }, []);

  const setPreferences = useCallback(async (patch: {
    channel?: ReleaseChannel;
    autoCheck?: boolean;
    autoDownload?: boolean;
  }) => {
    const api = window.worldcraftRelease;
    if (!api) return;
    setBusy("preferences");
    setStatus((current) => ({
      ...current,
      preferences: { ...current.preferences, ...patch }
    }));
    try {
      setStatus(await api.setPreferences(patch));
    } catch {
      try {
        setStatus(await api.getStatus());
      } catch {
        // Keep the last known status when the desktop bridge is unavailable.
      }
    } finally {
      setBusy("");
    }
  }, []);

  const acceptLegal = useCallback(async () => {
    const api = window.worldcraftRelease;
    if (!api) return;
    setBusy("legal");
    try {
      setStatus(await api.acceptLegal(status.legalVersion));
    } finally {
      setBusy("");
    }
  }, [status.legalVersion]);

  const openLink = useCallback(
    (kind: "homepage" | "support" | "privacy" | "terms") =>
      window.worldcraftRelease?.openLink(kind),
    []
  );

  const quit = useCallback(() => window.worldcraftRelease?.quit(), []);

  return {
    status,
    busy,
    run,
    setPreferences,
    acceptLegal,
    openLink,
    quit
  };
}
