import type { DealerSession } from "@/shared/auth/auth-types";
import { dealerSessionSchema } from "@/shared/auth/session-contract";

const dealerSessionCookieVersion = "v1";
const dealerSessionIvLength = 12;

export async function encodeDealerSessionCookieValue(
  session: DealerSession,
  secret: string,
) {
  const payloadBytes = encodeText(JSON.stringify(dealerSessionSchema.parse(session)));
  const key = await importSessionKey(secret, "encrypt");
  const iv = crypto.getRandomValues(new Uint8Array(dealerSessionIvLength));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    payloadBytes,
  );

  return `${dealerSessionCookieVersion}.${bytesToBase64Url(iv)}.${bytesToBase64Url(
    new Uint8Array(cipherBuffer),
  )}`;
}

export async function decodeDealerSessionCookieValue(
  rawValue: string | null | undefined,
  secret: string,
): Promise<DealerSession | null> {
  if (!rawValue) {
    return null;
  }

  const [version, ivPart, cipherPart] = rawValue.split(".");

  if (
    version !== dealerSessionCookieVersion ||
    typeof ivPart !== "string" ||
    typeof cipherPart !== "string"
  ) {
    return null;
  }

  try {
    const key = await importSessionKey(secret, "decrypt");
    const plainBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64UrlToBytes(ivPart),
      },
      key,
      base64UrlToBytes(cipherPart),
    );
    const json = JSON.parse(decodeText(new Uint8Array(plainBuffer)));
    return dealerSessionSchema.parse(json);
  } catch {
    return null;
  }
}

async function importSessionKey(secret: string, usage: "encrypt" | "decrypt") {
  const secretHash = await crypto.subtle.digest("SHA-256", encodeText(secret));

  return crypto.subtle.importKey("raw", secretHash, "AES-GCM", false, [usage]);
}

function encodeText(value: string) {
  return new TextEncoder().encode(value);
}

function decodeText(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

function bytesToBase64Url(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64url"));
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}
