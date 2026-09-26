"use client";

export interface UtmData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  captured_at: string;
}

const UTM_STORAGE_KEY = "kichees_utm_params";

export function captureUtmParameters(): UtmData | null {
  if (typeof window === "undefined") return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");
    const term = params.get("utm_term");
    const content = params.get("utm_content");

    if (source || medium || campaign) {
      const utmData: UtmData = {
        utm_source: source || undefined,
        utm_medium: medium || undefined,
        utm_campaign: campaign || undefined,
        utm_term: term || undefined,
        utm_content: content || undefined,
        referrer: document.referrer || undefined,
        captured_at: new Date().toISOString(),
      };
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
      return utmData;
    }

    const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (existing) {
      return JSON.parse(existing);
    }
  } catch (err) {
    console.error("UTM capture error:", err);
  }

  return null;
}

export function getStoredUtmData(): UtmData | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = sessionStorage.getItem(UTM_STORAGE_KEY);
    return existing ? JSON.parse(existing) : null;
  } catch {
    return null;
  }
}
