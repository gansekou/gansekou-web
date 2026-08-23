import { logEvent, type Analytics } from "firebase/analytics";
import { getFirebaseAnalytics } from "./firebase";

type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

export const analytics = {
  async track(
    eventName: string,
    params?: AnalyticsParams
  ): Promise<void> {
    console.log("[GA4] Tentative événement:", eventName, params);

    try {
      const instance: Analytics | null = await getFirebaseAnalytics();

      if (!instance) {
        console.error("[GA4] Instance Analytics indisponible");
        return;
      }

      logEvent(instance, eventName, {
        ...params,
        debug_mode: true,
      });

      console.log("[GA4] Événement envoyé:", eventName);
    } catch (error) {
      console.error("[GA4] Erreur logEvent:", error);
    }
  },
};
