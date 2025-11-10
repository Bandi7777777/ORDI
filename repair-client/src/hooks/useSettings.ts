import { useCallback, useEffect, useState } from "react";
import type { Settings } from "../types";
import { getSettings, saveSettings } from "../lib/db";

/** خواندن/به‌روزرسانی Settings با API ساده */
export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  const refresh = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
    return s;
  }, []);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const next = await saveSettings(patch);
    setSettings(next);
    return next;
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { settings, refresh, update };
}
