import { google } from "googleapis";

const env = (import.meta as any).env ?? {};

const SPREADSHEET_ID =
  env.GOOGLE_SHEETS_SPREADSHEET_ID ?? process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const SA_EMAIL =
  env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

const SA_PRIVATE_KEY_RAW =
  env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "";

const SA_PRIVATE_KEY = String(SA_PRIVATE_KEY_RAW).replace(/\\n/g, "\n");

function assertEnv() {
  if (!SPREADSHEET_ID) throw new Error("missing GOOGLE_SHEETS_SPREADSHEET_ID");
  if (!SA_EMAIL) throw new Error("missing GOOGLE_SERVICE_ACCOUNT_EMAIL");
  if (!SA_PRIVATE_KEY) throw new Error("missing GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
}

function sheetsClient() {
  assertEnv();

  const auth = new google.auth.JWT({
    email: SA_EMAIL,
    key: SA_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

function normalizeHeader(h: string) {
  return (h ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // remove punctuation
    .replace(/\s+/g, "_"); // spaces -> underscores
}

async function getSheetRows(sheetName: string) {
  const sheets = sheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:ZZ`,
  });

  const values = res.data.values || [];
  if (values.length < 2) return [];

  const headers = (values[0] || []).map((h) => normalizeHeader((h ?? "").toString()));

  return values.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (row?.[i] ?? "").toString();
    });
    return obj;
  });
}

function parseBool(v: string) {
  const s = (v ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "y";
}

function parseCsv(v: string) {
  return (v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseDateMaybe(v: string) {
  const s = (v ?? "").trim();
  if (!s) return null;

  // if it's exactly YYYY-MM-DD, build a local Date (avoids UTC day-shift)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    return new Date(y, mo - 1, d); // local midnight
  }

  // fallback for other formats (e.g., "Jan 21, 2026")
  const d2 = new Date(s);
  if (!Number.isNaN(d2.getTime())) return d2;

  return null;
}


/* =========================
   events
   sheet headers:
   name, date, time, location, blurb, featured, clubs, type, status
   ========================= */

export type SheetEvent = {
  name: string;
  date: Date | null;
  time: string;
  location: string;
  type: string;
  hostingClubs: string[];
  blurb: string;
  website: string;
  featured: boolean;
};

export async function getEventsFromSheets(includePast: boolean): Promise<SheetEvent[]> {
  const rows = await getSheetRows("Events");

  const events = rows
    .filter((r) => (r["status"] || "").trim().toLowerCase() === "published")
    .map((r) => {
      const e: SheetEvent = {
        name: r["name"] || "",
        date: parseDateMaybe(r["date"]),
        time: r["time"] || "",
        location: r["location"] || "",
        type: r["type"] || "",
        hostingClubs: parseCsv(r["clubs"] || ""),
        blurb: r["blurb"] || "",
        website: r["website"] || "",
        featured: parseBool(r["featured"] || ""),
      };
      return e;
    });

  const now = new Date();

  const filtered = includePast
    ? events
    : events.filter((e) => {
        if (!e.date) return true; // keep TBA
        return e.date.getTime() >= now.getTime();
      });

  filtered.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.getTime() - b.date.getTime();
  });

  return filtered;
}

/* =========================
   profiles
   column name: "Photo URL"
   normalized key: photo_url
   ========================= */

export type SheetProfile = {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  active: boolean;
};

export async function getActiveOfficerProfilesFromSheets(): Promise<SheetProfile[]> {
  const rows = await getSheetRows("Profiles");

  const profiles: SheetProfile[] = rows.map((r) => ({
    name: r["name"] || "",
    role: r["role"] || "",
    bio: r["bio"] || "",
    photoUrl: r["photo_url"] || "",
    active: parseBool(r["active"] || ""),
  }));

  return profiles
    .filter((p) => p.active)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* =========================
   calendar notifs
   ========================= */

export type SheetCalendarNotif = {
  id: string;
  title: string;
  start: Date | null;
  end: Date | null;
  audience: string;
  message: string;
  enabled: boolean;
};

export async function getCalendarNotifsFromSheets(): Promise<SheetCalendarNotif[]> {
  const rows = await getSheetRows("Calendar notifs");

  const notifs = rows.map((r) => ({
    id: r["id"] || "",
    title: r["title"] || "",
    start: parseDateMaybe(r["start"]),
    end: parseDateMaybe(r["end"]),
    audience: r["audience"] || "",
    message: r["message"] || "",
    enabled: parseBool(r["enabled"] || ""),
  }));

  return notifs.filter((n) => n.enabled);
}
