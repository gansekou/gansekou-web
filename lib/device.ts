const DEVICE_ID_KEY = "gansekou_device_id";

function generateDeviceId(): string {
  // Modern browsers
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers/devices
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // RFC 4122 version 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join("-");
  }

  // Last fallback
  return `gansekou-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);

    if (!id) {
      id = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }

    return id;
  } catch (error) {
    console.warn(
      "[device] localStorage unavailable, using temporary device id",
      error
    );

    return generateDeviceId();
  }
}

export function getDeviceName(): string {
  if (typeof navigator === "undefined") {
    return "Unknown";
  }

  return navigator.userAgent || "Unknown";
}

export function getPlatform(): string {
  return "web";
}
