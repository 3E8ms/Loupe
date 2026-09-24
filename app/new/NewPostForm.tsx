"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewPostForm() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/posts", { method: "POST", body: new FormData(e.currentTarget) });
    if (res.ok) { router.push("/"); router.refresh(); return; }
    setError((await res.json().catch(() => ({}))).error ?? "Upload failed. Try again.");
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="card auth">
      <h1 className="page">New post</h1>
      <label className="drop" htmlFor="image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview ? <img src={preview} alt="Preview" /> : <span><strong>Choose a photo</strong><br />JPG, PNG, WebP or GIF, up to 8 MB</span>}
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required
          onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null); }} />
      </label>
      <label htmlFor="caption">Caption</label>
      <textarea id="caption" name="caption" maxLength={2200} placeholder="Write a caption…" />
      {error && <p className="err">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? "Uploading…" : "Share"}</button>
    </form>
  );
}
