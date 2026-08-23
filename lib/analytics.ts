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
    const instance: Analytics | null = await getFirebaseAnalytics();

    if (!instance) {
      return;
    }

    logEvent(instance, eventName, params);
  },
};
