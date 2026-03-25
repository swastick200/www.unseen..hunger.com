import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const feedbackDir = path.join(process.cwd(), "data");
const feedbackFile = path.join(feedbackDir, "feedback.json");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseFeedbackTable = process.env.SUPABASE_FEEDBACK_TABLE || "feedback_entries";

function isHostedDeployment() {
  return Boolean(
    process.env.VERCEL ||
      process.env.NETLIFY ||
      process.env.CF_PAGES ||
      process.env.RENDER ||
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.FLY_APP_NAME
  );
}

function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function getStoreMode() {
  if (hasSupabaseConfig()) {
    return "supabase";
  }

  return isHostedDeployment() ? "unconfigured" : "local";
}

function createStoreError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeEntry(entry) {
  return {
    id: entry.id,
    name: entry.name,
    phone: entry.phone || "",
    rating: String(entry.rating),
    message: entry.message,
    createdAt: entry.created_at || entry.createdAt || new Date().toISOString(),
  };
}

async function ensureLocalStore() {
  await mkdir(feedbackDir, { recursive: true });

  try {
    await readFile(feedbackFile, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      await writeFile(feedbackFile, "[]");
      return;
    }

    throw error;
  }
}

async function listLocalFeedback() {
  await ensureLocalStore();
  const raw = await readFile(feedbackFile, "utf8");
  return JSON.parse(raw).map(normalizeEntry);
}

async function saveLocalFeedback(entry) {
  await ensureLocalStore();
  const raw = await readFile(feedbackFile, "utf8");
  const feedback = JSON.parse(raw);
  const savedEntry = {
    id: Date.now(),
    name: entry.name,
    phone: entry.phone || "",
    rating: String(entry.rating),
    message: entry.message,
    createdAt: new Date().toISOString(),
  };

  feedback.unshift(savedEntry);
  await writeFile(feedbackFile, JSON.stringify(feedback, null, 2));
  return savedEntry;
}

async function supabaseRequest(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error_description ||
      data?.error ||
      data?.details ||
      "Feedback storage request failed.";
    throw createStoreError(message, "SUPABASE_REQUEST_FAILED");
  }

  return data;
}

async function listSupabaseFeedback() {
  const url = new URL(`/rest/v1/${supabaseFeedbackTable}`, supabaseUrl);
  url.searchParams.set("select", "id,name,phone,rating,message,created_at");
  url.searchParams.set("order", "created_at.desc");

  const rows = await supabaseRequest(url, { method: "GET" });
  return rows.map(normalizeEntry);
}

async function saveSupabaseFeedback(entry) {
  const url = new URL(`/rest/v1/${supabaseFeedbackTable}`, supabaseUrl);
  const payload = [
    {
      name: entry.name,
      phone: entry.phone || "",
      rating: Number.parseInt(entry.rating, 10),
      message: entry.message,
      created_at: new Date().toISOString(),
    },
  ];

  const rows = await supabaseRequest(url, { method: "POST", body: JSON.stringify(payload) });
  return normalizeEntry(rows[0] || payload[0]);
}

function ensureConfiguredStore() {
  const mode = getStoreMode();

  if (mode === "unconfigured") {
    throw createStoreError(
      "Feedback storage is not configured for this live deployment yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your hosting dashboard.",
      "STORE_NOT_CONFIGURED"
    );
  }

  return mode;
}

export function feedbackStoreMode() {
  return getStoreMode();
}

export async function listFeedback() {
  const mode = ensureConfiguredStore();
  return mode === "supabase" ? listSupabaseFeedback() : listLocalFeedback();
}

export async function saveFeedback(entry) {
  const mode = ensureConfiguredStore();
  return mode === "supabase" ? saveSupabaseFeedback(entry) : saveLocalFeedback(entry);
}
