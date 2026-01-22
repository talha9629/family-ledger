import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  notificationPermission: NotificationPermission | "unsupported";
}

export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    notificationPermission: "Notification" in window ? Notification.permission : "unsupported",
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setState((prev) => ({ ...prev, isInstalled: isStandalone }));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState((prev) => ({ ...prev, isInstallable: true }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState((prev) => ({ ...prev, isInstallable: false, isInstalled: true }));
    };

    // Listen for online/offline
    const handleOnline = () => setState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setState((prev) => ({ ...prev, isInstallable: false }));
      return outcome === "accepted";
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return "unsupported" as const;
    }

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, notificationPermission: permission }));
      return permission;
    } catch {
      return "denied" as const;
    }
  }, []);

  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (state.notificationPermission !== "granted") {
        const permission = await requestNotificationPermission();
        if (permission !== "granted") return false;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: "/icons/icon-512x512.png",
          badge: "/icons/icon-512x512.png",
          ...options,
        });
        return true;
      } catch {
        // Fallback to regular notification
        try {
          new Notification(title, {
            icon: "/icons/icon-512x512.png",
            ...options,
          });
          return true;
        } catch {
          return false;
        }
      }
    },
    [state.notificationPermission, requestNotificationPermission]
  );

  return {
    ...state,
    installApp,
    requestNotificationPermission,
    showNotification,
  };
};
