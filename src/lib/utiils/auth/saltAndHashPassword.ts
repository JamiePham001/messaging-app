export const saltAndHashPassword = async (
  password: string,
): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder: TextEncoder = new TextEncoder();
  const keyMaterial: CryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"],
  );

  const key: CryptoKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const exportedKey: ArrayBuffer = await crypto.subtle.exportKey("raw", key);
  const hash: Uint8Array = new Uint8Array(exportedKey);
  const saltAndHash: Uint8Array = new Uint8Array(salt.length + hash.length);
  saltAndHash.set(salt);
  saltAndHash.set(hash, salt.length);

  return Buffer.from(saltAndHash).toString("hex");
};
