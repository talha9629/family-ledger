import { useState, useEffect } from "react";
import { Download, X, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

export const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    // Show install prompt after a delay if installable
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  useEffect(() => {
    // Show offline toast when going offline
    if (!isOnline) {
      setShowOfflineToast(true);
      const timer = setTimeout(() => setShowOfflineToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowPrompt(false);
    }
  };

  return (
    <>
      {/* Offline indicator */}
      {showOfflineToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">You're offline</span>
          </div>
        </div>
      )}

      {/* Online indicator (briefly shows when coming back online) */}
      {isOnline && !showOfflineToast && (
        <div className="fixed top-4 right-4 z-40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3 text-primary" />
          </div>
        </div>
      )}

      {/* Install prompt */}
      {showPrompt && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">Install Family Finance</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Add to your home screen for quick access and offline use
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mt-1 -mr-1"
                onClick={() => setShowPrompt(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPrompt(false)}
              >
                Not now
              </Button>
              <Button className="flex-1" onClick={handleInstall}>
                Install
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
