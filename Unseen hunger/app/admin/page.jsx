"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminPage() {
  const localFeedbackKey = useMemo(() => "unseen-local-feedback", []);
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("unseen-admin-token");
    const localItems = JSON.parse(window.localStorage.getItem(localFeedbackKey) || "[]");

    setItems(localItems);
    if (localItems.length) {
      setError("Showing locally saved feedback from this browser. Unlock with the admin token to load server feedback too.");
    }

    if (stored) {
      setToken(stored);
      setSaved(true);
      loadFeedback(stored);
    }
  }, [localFeedbackKey]);

  async function loadFeedback(activeToken) {
    setLoading(true);
    setError("");
    const localItems = JSON.parse(window.localStorage.getItem(localFeedbackKey) || "[]");

    if (!activeToken) {
      setItems(localItems);
      setError(localItems.length ? "Showing locally saved feedback from this browser." : "Enter the admin token to load server feedback.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/feedback", {
        headers: {
          "x-admin-token": activeToken,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load feedback.");
      }

      const serverItems = Array.isArray(data) ? data : [data];
      setItems([...localItems, ...serverItems]);
    } catch (loadError) {
      setItems(localItems);
      setError(localItems.length ? "Backend unavailable. Showing locally saved feedback from this browser." : loadError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSaveToken(event) {
    event.preventDefault();
    window.localStorage.setItem("unseen-admin-token", token);
    setSaved(true);
    loadFeedback(token);
  }

  function handleLogout() {
    window.localStorage.removeItem("unseen-admin-token");
    setSaved(false);
    setToken("");
    setItems([]);
    setError("");
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Owner Admin</p>
            <h1>Feedback Dashboard</h1>
            <p className="admin-subtext">
              View feedback collected from the website. This page reads saved entries from the website backend.
            </p>
          </div>
          <div className="admin-actions">
            <a className="button button-secondary" href="/">
              Back To Site
            </a>
            <button className="button button-secondary" type="button" onClick={() => loadFeedback(token)} disabled={!token || loading}>
              Refresh
            </button>
            <button className="button button-primary" type="button" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>

        <div className="admin-card">
          <form className="admin-login" onSubmit={handleSaveToken}>
            <label htmlFor="admin-token">Admin token</label>
            <p className="admin-subtext">Use the token to load server feedback. Local browser-saved feedback can appear below even without unlocking.</p>
            <div className="admin-login-row">
              <input
                id="admin-token"
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Enter owner token"
                required
              />
              <button className="button button-primary" type="submit">
                Unlock
              </button>
            </div>
            <div className="admin-inline-actions">
              <span>{saved ? "Token saved in this browser." : "Token not saved yet."}</span>
            </div>
          </form>
        </div>

        <div className="admin-summary">
          <div className="mini-stat">
            <strong>{items.length}</strong>
            <span>Total feedback entries</span>
          </div>
          <div className="mini-stat">
            <strong>{loading ? "Loading" : "Ready"}</strong>
            <span>Dashboard status</span>
          </div>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        <div className="feedback-list">
          {items.length === 0 ? (
            <div className="admin-card">
              <p className="admin-subtext">
                {loading ? "Loading feedback..." : "No feedback loaded yet. Unlock the dashboard or wait for submissions."}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <article className="admin-card feedback-entry" key={item.id}>
                <div className="feedback-entry-top">
                  <h2>{item.name}</h2>
                  <div className="panel-actions">
                    <span className="chip">Rating {item.rating}/5</span>
                    {item.localOnly ? <span className="chip">Local Only</span> : null}
                  </div>
                </div>
                <p className="admin-subtext">{item.message}</p>
                <div className="feedback-meta">
                  <span>Phone: {item.phone || "Not provided"}</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
