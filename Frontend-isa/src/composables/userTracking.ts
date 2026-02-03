import { onMounted, onBeforeUnmount } from "vue";

let globalFlushFunction: (() => void) | null = null;

export function useUsageTracker(userId: string) {
  let sessionStart: number | null = null;
  let accumulated = 0;
  let pausedAt: number | null = null;

  function start() {
    sessionStart = Date.now();
    pausedAt = null;
    accumulated = 0;
  }

  function pause() {
    if (pausedAt !== null) return;
    pausedAt = Date.now();
  }

  function resume() {
    if (pausedAt === null) return;
    accumulated += Date.now() - pausedAt;
    pausedAt = null;
  }

  function getTodayDateString() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  function saveOffline(duration: number) {
    const stored = JSON.parse(localStorage.getItem("usageOffline") || "[]");
    stored.push({
      user: userId,
      date: getTodayDateString(),
      duration, // en ms
    });
    localStorage.setItem("usageOffline", JSON.stringify(stored));
  }

  function syncOffline() {
    const stored = JSON.parse(localStorage.getItem("usageOffline") || "[]");
    if (!stored.length) return;

    fetch("/api/v1/usage/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions: stored }),
      keepalive: true,
    }).catch(() => { });

    localStorage.removeItem("usageOffline");
  }

  function sendOnline(duration: number) {
    fetch("/api/v1/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        date: getTodayDateString(),
        duration, // en ms
      }),
      keepalive: true,
    }).catch(() => { });
  }

  function end() {
    if (sessionStart === null) return;

    let duration = (Date.now() - sessionStart) + accumulated;
    if (pausedAt !== null) {
      duration -= Date.now() - pausedAt;
      pausedAt = null;
    }

    if (!navigator.onLine) saveOffline(duration);
    else sendOnline(duration);

    sessionStart = null;
    accumulated = 0;
  }

  function flushUsage() {
    end();
    syncOffline();
    sessionStart = null;
    accumulated = 0;
    pausedAt = null;
  }

  globalFlushFunction = flushUsage;

  onMounted(() => {
    start();

    window.addEventListener("blur", pause);
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pause();
      else resume();
    });

    window.addEventListener("offline", pause);
    window.addEventListener("online", () => {
      resume();
      syncOffline();
    });

    window.addEventListener("beforeunload", end);
  });

  onBeforeUnmount(() => {
    end();
    globalFlushFunction = null;
  });

  return { flushUsage };
}

export function flushUsageBeforeLogout() {
  if (globalFlushFunction) globalFlushFunction();
}
