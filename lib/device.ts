const DEVICE_ID_KEY = "gansekou_device_id";

function generateDeviceId() {
  return crypto.randomUUID();
}

export function getDeviceId() {
  if (typeof window === "undefined") {
    return "server";
  }

  let id = localStorage.getItem(DEVICE_ID_KEY);

  if (!id) {
    id = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }

  return id;
}

export function getDeviceName() {
  if (typeof navigator === "undefined") {
    return "Unknown";
  }

  return navigator.userAgent;
}

export function getPlatform() {
  if (typeof navigator === "undefined") {
    return "web";
  }

  return "web";
}
