import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Only run on client side after mount
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let mounted = true;

    const registerSW = async () => {
      try {
        // Dynamically import the PWA register module
        const { registerSW } = await import("virtual:pwa-register");
        
        registerSW({
          immediate: true,
          onNeedRefresh() {
            if (mounted) {
              setShowPrompt(true);
            }
          },
          onOfflineReady() {
            console.log("App ready for offline use");
          },
          onRegisteredSW(swUrl, r) {
            console.log("Service Worker registered:", swUrl);
            if (r && mounted) {
              setRegistration(r);
              // Check for updates every hour
              setInterval(() => {
                r.update();
              }, 60 * 60 * 1000);
            }
          },
          onRegisterError(error) {
            console.error("Service Worker registration error:", error);
          },
        });
      } catch (error) {
        console.error("Failed to register service worker:", error);
      }
    };

    registerSW();

    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4">
      <div className="bg-primary text-primary-foreground rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <div className="flex-1">
            <h3 className="font-semibold">Update Available</h3>
            <p className="text-sm opacity-90">A new version is ready to install</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleDismiss}
          >
            Later
          </Button>
          <Button
            variant="secondary"
            className="flex-1 bg-white text-primary hover:bg-white/90"
            onClick={handleUpdate}
          >
            Update Now
          </Button>
        </div>
      </div>
    </div>
  );
};
