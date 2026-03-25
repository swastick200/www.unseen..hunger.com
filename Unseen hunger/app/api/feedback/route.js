import { listFeedback, saveFeedback } from "lib/feedback-store";

const adminToken = process.env.ADMIN_TOKEN || "unseenhg2056";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request) {
  const token = request.headers.get("x-admin-token");

  if (token !== adminToken) {
    return Response.json({ error: "Unauthorized." }, { status: 401, headers: corsHeaders });
  }

  try {
    return Response.json(await listFeedback(), { headers: corsHeaders });
  } catch (error) {
    const status = error?.code === "STORE_NOT_CONFIGURED" ? 503 : 500;
    return Response.json(
      { error: error?.message || "Failed to load feedback." },
      { status, headers: corsHeaders }
    );
  }
}

export async function POST(request) {
  const { name, phone, rating, message } = await request.json();

  if (!name || !message || !rating) {
    return Response.json(
      { error: "Name, rating, and message are required." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const entry = await saveFeedback({ name, phone, rating, message });
    return Response.json({ ok: true, entry }, { status: 201, headers: corsHeaders });
  } catch (error) {
    const status = error?.code === "STORE_NOT_CONFIGURED" ? 503 : 500;
    return Response.json(
      { error: error?.message || "Failed to save feedback." },
      { status, headers: corsHeaders }
    );
  }
}
