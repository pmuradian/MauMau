import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPhotobook, listPhotobooks, deletePhotobook } from "networking/NetworkService";
import "./home.css";

interface PhotobookSummary {
  _id: string;
  title: string;
  createdAt?: string;
  pages: unknown[];
}

export default function Home() {
  const navigate = useNavigate();
  const [photobooks, setPhotobooks] = useState<PhotobookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPhotobooks();
  }, []);

  async function fetchPhotobooks() {
    setLoading(true);
    setError("");
    try {
      const data = await listPhotobooks();
      setPhotobooks(data as PhotobookSummary[]);
    } catch {
      setError("Failed to load photobooks. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const response = await createPhotobook("My Photobook");
      navigate(`/photobook?key=${response.key}`);
    } catch {
      setError("Failed to create photobook. Please try again.");
      setCreating(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deletePhotobook(id);
      setPhotobooks((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError("Failed to delete photobook. Please try again.");
    }
  }

  function formatDate(iso?: string): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Photobooks</h1>
        <button
          className="dashboard-create-btn"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? "Creating..." : "+ New Photobook"}
        </button>
      </div>

      <div className="dashboard-content">
        {error && <div className="dashboard-error">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">Loading your photobooks...</div>
        ) : photobooks.length === 0 ? (
          <div className="dashboard-empty">
            No photobooks yet. Create your first one!
          </div>
        ) : (
          <div className="photobook-grid">
            {photobooks.map((book) => (
              <div key={book._id} className="photobook-card">
                <div className="photobook-card-title">{book.title}</div>
                <div className="photobook-card-meta">
                  <span>{book.pages.length} page{book.pages.length !== 1 ? "s" : ""}</span>
                  {book.createdAt && <span>{formatDate(book.createdAt)}</span>}
                </div>
                <div className="photobook-card-actions">
                  <button
                    className="card-btn-open"
                    onClick={() => navigate(`/photobook?key=${book._id}`)}
                  >
                    Open
                  </button>
                  <button
                    className="card-btn-delete"
                    onClick={() => handleDelete(book._id, book.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
