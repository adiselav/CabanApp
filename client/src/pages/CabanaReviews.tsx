import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import TopNavbar from "../components/TopNavbar";
import StarRating from "../components/StarRating";
import PrimaryButton from "../components/PrimaryButton";

interface Recenzie {
  id: number;
  scor: number;
  descriere?: string;
  createdAt: string;
  Utilizator: {
    email: string;
    id: number;
  };
}

const CabanaReviews = () => {
  const { id } = useParams<{ id: string }>();
  const cabanaId = Number(id);
  const navigate = useNavigate();

  const { user, token, loading: authLoading } = useContext(AuthContext) ?? {};

  const [recenzii, setRecenzii] = useState<Recenzie[]>([]);
  const [reviewForm, setReviewForm] = useState({ scor: 1, descriere: "" });
  const [reviewLoading, setReviewLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const editing = editingId !== null;

  const fetchRecenzii = useCallback(async () => {
    if (!token) return;
    try {
      setReviewLoading(true);
      const res = await axios.get(
        `http://localhost:5000/recenzie/cabana/${cabanaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecenzii(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setReviewLoading(false);
    }
  }, [cabanaId, token]);

  useEffect(() => {
    if (!authLoading && token) fetchRecenzii();
  }, [authLoading, token, fetchRecenzii]);

  const userReview = useMemo(
    () => recenzii.find((r) => r.Utilizator.id === user?.id) || null,
    [recenzii, user]
  );

  useEffect(() => {
    if (!userReview) {
      setEditingId(null);
      setReviewForm({ scor: 1, descriere: "" });
    } else if (editingId === null) {
      setEditingId(userReview.id);
      setReviewForm({
        scor: userReview.scor,
        descriere: userReview.descriere || "",
      });
    }
    // eslint-disable-next-line
  }, [userReview]);

  const handleReviewSubmit = async () => {
    if (!token || !user) return;
    if (!reviewForm.scor || reviewForm.scor < 1 || reviewForm.scor > 5) {
      setError("Score must be between 1 and 5.");
      return;
    }
    try {
      const endpoint = editing
        ? `http://localhost:5000/recenzie/${editingId}`
        : "http://localhost:5000/recenzie";

      const method = editing ? axios.put : axios.post;

      await method(
        endpoint,
        {
          scor: reviewForm.scor,
          descriere: reviewForm.descriere,
          idCabana: cabanaId,
          idUtilizator: user.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviewForm({ scor: 1, descriere: "" });
      setEditingId(null);
      setError("");
      await fetchRecenzii();
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to submit review.";
      setError(message);
    }
  };

  const handleEdit = (review: Recenzie) => {
    setReviewForm({ scor: review.scor, descriere: review.descriere || "" });
    setEditingId(review.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/recenzie/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingId(null);
      setReviewForm({ scor: 1, descriere: "" });
      setError("");
      await fetchRecenzii();
    } catch (err) {
      console.error("Eroare la ștergerea recenziei:", err);
    }
  };

  const calculateReviewStats = (recenzii: Recenzie[]) => {
    const total = recenzii.length;
    const counts = [0, 0, 0, 0, 0];
    for (const r of recenzii) {
      if (r.scor >= 1 && r.scor <= 5) counts[r.scor - 1]++;
    }
    const percentages = counts.map((count) =>
      total === 0 ? 0 : Math.round((count / total) * 100)
    );
    const average =
      total === 0
        ? 0
        : parseFloat(
            (recenzii.reduce((sum, r) => sum + r.scor, 0) / total).toFixed(1)
          );
    return { counts, percentages, total, average };
  };
  const stats = calculateReviewStats(recenzii);

  if (authLoading) {
    return (
      <PageWrapper>
        <TopNavbar />
        <ContentWrapper>
          <p className="text-gray-400">Authenticating...</p>
        </ContentWrapper>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TopNavbar />
      <ContentWrapper>
        <PrimaryButton onClick={() => navigate(-1)} className="mb-4">
          ← Înapoi la informațiile despre cabană
        </PrimaryButton>

        <h2 className="text-2xl font-semibold mb-4">Recenzii</h2>

        {reviewLoading ? (
          <p className="text-gray-400">Încarcă recenzii...</p>
        ) : recenzii.length === 0 ? (
          <p className="text-gray-400">Nu există încă recenzii.</p>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-4xl font-bold">
                Scor {stats.average.toFixed(1)}
              </p>
              <p className="text-sm text-gray-400">{stats.total} recenzii</p>
              <StarRating score={stats.average} />
              {[5, 4, 3, 2, 1].map((star) => {
                const index = star - 1;
                return (
                  <div key={star} className="flex items-center text-sm mt-1">
                    <span className="w-6">{star}</span>
                    <div className="w-full h-2 bg-[#2d333b] rounded mx-2 overflow-hidden">
                      <div
                        className="h-2 bg-yellow-500"
                        style={{ width: `${stats.percentages[index]}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-gray-400">
                      {stats.percentages[index]}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              {recenzii.map((r) => (
                <div
                  key={r.id}
                  className="bg-[#0d1117] p-4 rounded border border-[#30363d]"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      {r.Utilizator.email}
                    </span>
                    <StarRating score={r.scor} />
                  </div>
                  {r.descriere && (
                    <p className="text-sm text-gray-300 mt-2">{r.descriere}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>

                  {user?.id === r.Utilizator.id && editingId !== r.id && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="bg-[#0d1117] text-blue-400 border border-[#30363d] hover:opacity-80 py-1 px-4 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="bg-[#0d1117] text-red-400 border border-[#30363d] hover:opacity-80 py-1 px-4 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {user && (editing || !userReview) && (
          <div className="mt-6 p-4 bg-[#0d1117] rounded border border-[#30363d]">
            <h3 className="text-xl font-semibold mb-2">
              {editing ? "Editează recenzia" : "Scrie o receznie"}
            </h3>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <label className="text-sm text-gray-300">Scor (1–5)</label>
            <select
              value={reviewForm.scor}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, scor: Number(e.target.value) })
              }
              className="w-full mb-2 px-3 py-2 bg-[#161b22] border border-[#30363d] rounded"
            >
              {[1, 2, 3, 4, 5].map((val) => (
                <option key={val} value={val}>
                  {val}.0
                </option>
              ))}
            </select>

            <label className="text-sm text-gray-300">
              Descriere (opțională)
            </label>
            <textarea
              value={reviewForm.descriere}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, descriere: e.target.value })
              }
              className="w-full mb-3 px-3 py-2 bg-[#161b22] border border-[#30363d] rounded"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReviewSubmit}
                className="bg-[#0d1117] text-blue-400 border border-[#30363d] hover:opacity-80 py-2 px-4 rounded"
              >
                {editing ? "Actualizează recenzia" : "Trimite recenzia"}
              </button>
              {editing && (
                <button
                  onClick={() => editingId && handleDelete(editingId)}
                  className="bg-[#0d1117] text-red-400 border border-[#30363d] hover:opacity-80 py-2 px-4 rounded"
                >
                  Șterge recenzia
                </button>
              )}
            </div>
          </div>
        )}

        {!user && !authLoading && (
          <p className="mt-4 text-sm text-yellow-400">
            Trebuie să te conectezi ca să lași o recenzie.
          </p>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    className="w-screen min-h-screen bg-cover bg-center text-white px-4 pt-24 pb-10"
    style={{
      backgroundImage:
        'url("/Creasta-Muntilor-Piatra-Craiului-Fotografii-aeriene-1.jpg")',
    }}
  >
    {children}
  </div>
);

const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-4xl mx-auto bg-[#161b22]/90 p-6 rounded-lg border border-[#30363d] shadow">
    {children}
  </div>
);

export default CabanaReviews;
