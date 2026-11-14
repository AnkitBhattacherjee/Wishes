import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const PREFIX = "/make-server-c194f93d";
const BUCKET = "wish-photos";

// 2 Days retention policy (48 hours in milliseconds)
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c194f93d/health", (c) => {
  return c.json({ status: "ok", backupDuration: "2 days (48 hours)" });
});

const hashToken = async (token: string) => {
  const bytes = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const storageClient = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

/**
 * Auto-delete all files attached to a project in Supabase Storage
 */
async function deleteProjectFiles(projectId: string) {
  try {
    const supabase = storageClient();
    const { data: files } = await supabase.storage.from(BUCKET).list(projectId);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${projectId}/${f.name}`);
      await supabase.storage.from(BUCKET).remove(paths);
      console.log(`Auto-deleted ${paths.length} files from Supabase Storage for project: ${projectId}`);
    }
  } catch (err) {
    console.error(`Failed to delete storage files for ${projectId}:`, err);
  }
}

/**
 * GET Project: Loads project if within the 2-day backup window.
 * If older than 2 days, auto-deletes the record and files from Supabase!
 */
app.get(`${PREFIX}/projects/:id`, async (c) => {
  const id = c.req.param("id");
  try {
    const record = await kv.get(`gift:${id}`);
    if (!record) return c.json({ error: "Gift not found or expired" }, 404);

    const now = Date.now();
    const expiresAt = record.expiresAt || (record.createdAt ? record.createdAt + TWO_DAYS_MS : null);

    // Auto-delete after 2 days
    if (expiresAt && now > expiresAt) {
      console.log(`Gift ${id} expired 2-day retention. Auto-deleting from Supabase...`);
      await kv.del(`gift:${id}`).catch(() => {});
      await deleteProjectFiles(id);
      return c.json({ error: "This gift backup expired after 2 days and was automatically deleted." }, 404);
    }

    return c.json({ project: record.project, expiresAt });
  } catch (error) {
    console.error("Project load failed", error);
    return c.json({ error: "Could not load this gift" }, 500);
  }
});

/**
 * PUT Project: Saves or updates project with a 2-day expiration timestamp
 */
app.put(`${PREFIX}/projects/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const { editToken, project } = await c.req.json();
    if (!editToken || !project) return c.json({ error: "Missing project data" }, 400);

    const key = `gift:${id}`;
    const existing = await kv.get(key);
    const tokenHash = await hashToken(editToken);
    if (existing && existing.editTokenHash !== tokenHash) {
      return c.json({ error: "This edit link is not authorized" }, 403);
    }

    const now = Date.now();
    const createdAt = existing?.createdAt || now;
    const isSealed = Boolean(project.isSealed);
    const sealedAt = project.sealedAt || (isSealed ? now : null);

    // If sealed: 2-day backup starts from the moment of SEALING!
    // If drafting: keep draft active for 7 days from last update so the sender has plenty of time to craft!
    const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = isSealed ? (sealedAt! + TWO_DAYS_MS) : (now + DRAFT_TTL_MS);

    const safeProject = {
      ...project,
      projectId: id,
      editToken: "",
      isSealed,
      sealedAt,
      updatedAt: now,
      expiresAt,
    };

    await kv.set(key, {
      editTokenHash: tokenHash,
      project: safeProject,
      createdAt,
      isSealed,
      sealedAt,
      expiresAt,
    });

    return c.json({ project: safeProject, expiresAt });
  } catch (error) {
    console.error("Project save failed", error);
    return c.json({ error: "Could not save this gift" }, 500);
  }
});

/**
 * Universal file upload: Stores attached photos, voice notes, and audio files
 * in Supabase Storage with public read access so the receiver can open and play them all.
 */
const handleFileUpload = async (c: any) => {
  try {
    const id = c.req.param("id");
    const { editToken, dataUrl } = await c.req.json();
    const record = await kv.get(`gift:${id}`);
    if (!record || record.editTokenHash !== await hashToken(editToken || "")) {
      return c.json({ error: "This edit link is not authorized" }, 403);
    }

    const match = /^data:((?:image|audio)\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || "");
    if (!match) return c.json({ error: "Invalid file format (must be image or audio)" }, 400);

    const supabase = storageClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
      const { error } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 15 * 1024 * 1024,
        allowedMimeTypes: [
          "image/webp", "image/jpeg", "image/png", "image/gif",
          "audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"
        ],
      });
      if (error && !error.message.toLowerCase().includes("already exists")) throw error;
    }

    const mime = match[1];
    let extension = "bin";
    if (mime.includes("png")) extension = "png";
    else if (mime.includes("jpeg") || mime.includes("jpg")) extension = "jpg";
    else if (mime.includes("webp")) extension = "webp";
    else if (mime.includes("gif")) extension = "gif";
    else if (mime.includes("webm")) extension = "webm";
    else if (mime.includes("mpeg") || mime.includes("mp3")) extension = "mp3";
    else if (mime.includes("wav")) extension = "wav";
    else if (mime.includes("ogg")) extension = "ogg";

    const binary = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0));
    const path = `${id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, binary, {
      contentType: mime,
      upsert: false,
    });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return c.json({
      url: data.publicUrl,
      expiresAt: record.expiresAt || (Date.now() + TWO_DAYS_MS)
    });
  } catch (error) {
    console.error("File upload failed", error);
    return c.json({ error: "Could not upload this file" }, 500);
  }
};

app.post(`${PREFIX}/projects/:id/photos`, handleFileUpload);
app.post(`${PREFIX}/projects/:id/files`, handleFileUpload);

/**
 * Expiration sweep endpoint: Purges all gifts & files older than 2 days
 */
app.post(`${PREFIX}/cleanup`, async (c) => {
  try {
    const records = await kv.getByPrefix("gift:");
    const now = Date.now();
    let cleaned = 0;

    for (const item of records) {
      if (item && item.expiresAt && now > item.expiresAt) {
        const id = item.project?.projectId;
        if (id) {
          await kv.del(`gift:${id}`).catch(() => {});
          await deleteProjectFiles(id);
          cleaned++;
        }
      }
    }
    return c.json({ status: "cleaned", count: cleaned });
  } catch (error) {
    console.error("Cleanup sweep failed", error);
    return c.json({ error: "Cleanup failed" }, 500);
  }
});

Deno.serve(app.fetch);
