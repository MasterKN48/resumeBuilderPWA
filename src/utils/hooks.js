import { useState, useEffect } from "preact/hooks";

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (
      isStandalone ||
      localStorage.getItem("pwaInstallDismissed") === "true"
    ) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      localStorage.removeItem("pwaInstalled");
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      localStorage.setItem("pwaInstalled", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const timer = setTimeout(() => {
      const lastShown = localStorage.getItem("pwaInstallLastShown");
      const now = Date.now();
      const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

      if (
        !localStorage.getItem("pwaInstallDismissed") &&
        !localStorage.getItem("pwaInstalled") &&
        !isStandalone &&
        (!lastShown || now - parseInt(lastShown) > THREE_DAYS)
      ) {
        setShowInstallBanner(true);
        localStorage.setItem("pwaInstallLastShown", now.toString());
      }
    }, 20000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      alert(
        "To install PocketResume, please use your browser's 'Add to Home Screen' or 'Install' menu option."
      );
    }
    setShowInstallBanner(false);
  };

  const dismissInstall = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwaInstallDismissed", "true");
  };

  return { showInstallBanner, handleInstallClick, dismissInstall };
};

export const useScale = (template, data, resumeRefs) => {
  const [scale, setScale] = useState(1);
  const [viewportHeight, setViewportHeight] = useState("auto");

  useEffect(() => {
    const updateScaleAndHeight = () => {
      const availableWidth = window.innerWidth - 40;
      let newScale = 1;
      if (availableWidth < 800) {
        newScale = availableWidth / 800;
        setScale(newScale);
      } else {
        setScale(1);
      }

      const activeSlideIndex = template === "classic" ? 1 : 2;
      const activeContainer = resumeRefs.current[activeSlideIndex];
      if (activeContainer && availableWidth < 800) {
        setViewportHeight(`${activeContainer.offsetHeight * newScale}px`);
      } else {
        setViewportHeight("auto");
      }
    };

    updateScaleAndHeight();
    window.addEventListener("resize", updateScaleAndHeight);
    const interval = setInterval(updateScaleAndHeight, 500);

    return () => {
      window.removeEventListener("resize", updateScaleAndHeight);
      clearInterval(interval);
    };
  }, [template, data, resumeRefs]);

  return { scale, viewportHeight };
};

export const useSwipe = (setTemplate) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setTemplate((prev) => (prev === "classic" ? "modern" : "classic"));
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};
