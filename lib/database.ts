import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "access.json");

type EntitlementRecord = {
  purchasedAt: string;
  source: "stripe" | "manual";
};

type AnalysisSnapshot = {
  domain: string;
  scannedAt: string;
  pagesScanned: number;
  cannibalizationScore: number;
};

type DatabaseSchema = {
  entitlements: Record<string, EntitlementRecord>;
  analyses: AnalysisSnapshot[];
};

const DEFAULT_DB: DatabaseSchema = {
  entitlements: {},
  analyses: []
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureDbFile() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(DATA_FILE, "utf-8");
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
  }
}

async function readDb(): Promise<DatabaseSchema> {
  await ensureDbFile();
  const raw = await readFile(DATA_FILE, "utf-8");

  try {
    const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;
    return {
      entitlements: parsed.entitlements ?? {},
      analyses: parsed.analyses ?? []
    };
  } catch {
    return DEFAULT_DB;
  }
}

async function writeDb(next: DatabaseSchema) {
  await ensureDbFile();
  await writeFile(DATA_FILE, JSON.stringify(next, null, 2), "utf-8");
}

export async function addEntitlement(email: string, source: EntitlementRecord["source"] = "manual") {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }

  const db = await readDb();
  db.entitlements[normalized] = {
    purchasedAt: new Date().toISOString(),
    source
  };
  await writeDb(db);
  return true;
}

export async function hasEntitlement(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }

  const db = await readDb();
  return Boolean(db.entitlements[normalized]);
}

export async function saveAnalysisSnapshot(snapshot: AnalysisSnapshot) {
  const db = await readDb();
  db.analyses.unshift(snapshot);
  db.analyses = db.analyses.slice(0, 1000);
  await writeDb(db);
}
