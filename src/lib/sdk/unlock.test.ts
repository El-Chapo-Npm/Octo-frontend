import { describe, it, expect, beforeEach, vi } from "vitest";
import { unlockWallet } from "./unlock";
import { getBackup } from "./client";
import { encryptSeed, serializeBackup, type EncryptedBackup } from "./crypto";
import { loadLocalBackup } from "./store";
import { fromMnemonic } from "./keys";

// Mock client module to spy on getBackup calls.
vi.mock("./client", () => ({
  getBackup: vi.fn(),
}));

// Set up mock window and localStorage for Node test environment.
const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};

if (typeof window === "undefined") {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

const TEST_MNEMONIC = "illness spike retreat truth genius clock brain pass fit cave bargain toe";
const TEST_PASSWORD = "correct-horse-battery-staple";
const WALLET_ID = "wallet-xyz-123";
const TOKEN = "test-auth-token";

describe("unlockWallet", () => {
  let validBackupObj: EncryptedBackup;
  let validBackupString: string;
  let expectedPublicKey: string;

  beforeEach(async () => {
    storage.clear();
    vi.clearAllMocks();
    validBackupObj = await encryptSeed(TEST_MNEMONIC, TEST_PASSWORD);
    validBackupString = serializeBackup(validBackupObj);
    expectedPublicKey = fromMnemonic(TEST_MNEMONIC).publicKey;
  });

  // Prefer local backup without making a network request to the server.
  it("uses local backup when available and does not call server", async () => {
    storage.set(`octo_wallet_backup_${WALLET_ID}`, validBackupString);
    const keypair = await unlockWallet(TOKEN, WALLET_ID, TEST_PASSWORD);
    expect(keypair.publicKey()).toBe(expectedPublicKey);
    expect(getBackup).not.toHaveBeenCalled();
  });

  // Fall back to server backup when local cache is empty, then cache it locally.
  it("fetches server backup on cache miss and stores it locally", async () => {
    vi.mocked(getBackup).mockResolvedValueOnce({
      wallet_id: WALLET_ID,
      encrypted_backup: validBackupString,
    });
    const keypair = await unlockWallet(TOKEN, WALLET_ID, TEST_PASSWORD);
    expect(keypair.publicKey()).toBe(expectedPublicKey);
    expect(getBackup).toHaveBeenCalledWith(TOKEN, WALLET_ID);
    expect(loadLocalBackup(WALLET_ID)).toEqual(validBackupObj);
  });

  // Throw clear recovery error if neither local nor server backup exists.
  it("throws clear error when backup is missing from both local and server", async () => {
    vi.mocked(getBackup).mockResolvedValueOnce({
      wallet_id: WALLET_ID,
      encrypted_backup: null,
    });
    await expect(unlockWallet(TOKEN, WALLET_ID, TEST_PASSWORD)).rejects.toThrow(
      "No key backup found for this wallet. Recover it with your recovery phrase.",
    );
  });

  // Reject unlock attempt when password provided is incorrect.
  it("rejects when password is wrong", async () => {
    storage.set(`octo_wallet_backup_${WALLET_ID}`, validBackupString);
    await expect(unlockWallet(TOKEN, WALLET_ID, "wrong-password")).rejects.toThrow();
  });

  // Reject unlock attempt and do not cache if server blob is malformed.
  it("rejects when server blob is malformed and does not cache invalid blob", async () => {
    vi.mocked(getBackup).mockResolvedValueOnce({
      wallet_id: WALLET_ID,
      encrypted_backup: "invalid-backup-json",
    });
    await expect(unlockWallet(TOKEN, WALLET_ID, TEST_PASSWORD)).rejects.toThrow();
    expect(loadLocalBackup(WALLET_ID)).toBeNull();
  });
});
