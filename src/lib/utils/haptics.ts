/**
 * Multimodal Haptic Feedback Utility (Apple Design Principle 13)
 * Provides subtle tactile feedback on supported devices (phones & tablets)
 * with graceful no-op fallback when Web Vibration API is unavailable.
 */

export function triggerHaptic(type: "selection" | "impact" | "success" | "warning" = "selection") {
  if (typeof window === "undefined" || !("navigator" in window) || !window.navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case "selection":
        // Crisp, ultra-light 6ms tap for segmented controls, pills, and steppers
        window.navigator.vibrate(6);
        break;
      case "impact":
        // Firm 10ms tap on button press or toggle commit
        window.navigator.vibrate(10);
        break;
      case "success":
        // Double pulse for add-to-cart or order confirmation snap
        window.navigator.vibrate([10, 30, 14]);
        break;
      case "warning":
        // Subtle alert pulse
        window.navigator.vibrate([15, 40, 15]);
        break;
    }
  } catch {
    // Graceful silent fallback
  }
}
