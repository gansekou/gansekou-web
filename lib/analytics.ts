import { logEvent, type Analytics } from "firebase/analytics";
import { getFirebaseAnalytics } from "./firebase";

type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;

async function getAnalyticsInstance(): Promise<Analytics | null> {
  return getFirebaseAnalytics();
}

export const analytics = {
  async track(
    eventName: string,
    params?: AnalyticsParams
  ): Promise<void> {
    const instance = await getAnalyticsInstance();

    if (!instance) {
      return;
    }

    logEvent(instance, eventName, params);
  },
};
