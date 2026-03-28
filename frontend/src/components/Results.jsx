import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import Layout from "./Layout";
import { useLanguage } from "../context/LanguageContext.js";

const Results = ({ isEmbedded = false, passedUser = null }) => {
  const [candidates, setCandidates] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { t } = useLanguage();

  useEffect(() => {
    if (isEmbedded) {
      if (passedUser) {
        setUser(passedUser);
        setLoading(false);
      }
      return;
    }

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setUser(data);
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isEmbedded, passedUser]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/candidates");
      const data = await response.json();
      if (response.ok) {
        setCandidates(data.candidates || (Array.isArray(data) ? data : []));
      }
    } catch (error) {
      console.error("Fetch candidates error:", error);
    }
  };

  useEffect(() => {
    if (user) fetchCandidates();
  }, [user]);

  const totalVotes = Array.isArray(candidates) ? candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0) : 0;
  const winner = Array.isArray(candidates) && candidates.length > 0 ? candidates.reduce((prev, current) => (prev.voteCount > current.voteCount) ? prev : current, candidates[0]) : null;

  const filteredCandidates = Array.isArray(candidates)
    ? candidates.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.party.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const sortedCandidates = [...filteredCandidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  if (loading) return <Loading />;
  if (!user && !isEmbedded) return null;

  const content = (
    <div className={isEmbedded ? "" : "p-0"}>
      <div className="mb-5">
        <h1 className="fw-bold text-app-dark mb-1">{t.electoralDashboard || "Electoral Dashboard"}</h1>
        <p className="text-app-muted">{t.visualizing || "Visualizing current voting trends and outcomes."}</p>
      </div>

      <div className="row g-4 mb-5">
        {[
          { label: t.candidates, value: candidates.length, color: '#4364F7', icon: 'bi-people-fill' },
          { label: t.totalVotes, value: totalVotes, color: '#7158e2', icon: 'bi-graph-up-arrow' },
          { label: t.currentLeader, value: winner?.name || 'N/A', color: '#4cd137', icon: 'bi-trophy-fill' }
        ].map((stat, i) => (
          <div key={i} className="col-12 col-md-4">
            <div className="card card-modern h-100 p-3 shadow-sm border-0">
              <div className="d-flex align-items-center">
                <div className="p-3 rounded-4 me-3 text-white opacity-75" style={{ backgroundColor: stat.color }}>
                  <i className={`${stat.icon} fs-3`}></i>
                </div>
                <div className="overflow-hidden">
                  <div className="text-app-muted small fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>{stat.label}</div>
                  <div className="h4 mb-0 fw-bold text-app-dark text-truncate">{stat.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {winner && (
        <div className="card card-modern mb-5 overflow-hidden border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)' }}>
          <div className="card-body p-4 p-md-5">
            <div className="row align-items-center">
              <div className="col-md-8 text-white">
                <div className="badge bg-white text-success rounded-pill px-3 py-2 fw-bold mb-3 shadow-sm">{t.frontRunner || "FRONT RUNNER"}</div>
                <h2 className="display-6 fw-bold mb-2">{winner.name}</h2>
                <p className="lead mb-4 opacity-75">{winner.party} — {t.leadingWith || "Currently leading with"} {winner.voteCount} {t.votes} {t.leadingWithNeSuffix || ""}</p>
                <div className="bg-white bg-opacity-10 d-inline-block rounded-pill px-4 py-2 border border-white border-opacity-25">
                  <span className="fw-bold fs-4">{totalVotes > 0 ? ((winner.voteCount / totalVotes) * 100).toFixed(1) : 0}%</span>
                  <span className="small ms-2 opacity-75">{t.distribution || "of distribution"}</span>
                </div>
              </div>
              <div className="col-md-4 d-none d-md-block text-center text-white opacity-25">
                <i className="bi bi-award-fill" style={{ fontSize: '8rem' }}></i>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card card-modern border-0 shadow-sm overflow-hidden">
        <div className="p-4 border-bottom bg-light">
          <h5 className="mb-0 fw-bold text-app-dark">{t.detailedTable || "Detailed Results Table"}</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light bg-opacity-10">
              <tr className="text-app-muted small text-uppercase">
                <th className="ps-4 py-3">{t.rank}</th>
                <th className="py-3">{t.candidate}</th>
                <th className="py-3">{t.party}</th>
                <th className="py-3 text-center">{t.votes}</th>
                <th className="py-3 pe-4">{t.dist}</th>
              </tr>
            </thead>
            <tbody>
              {sortedCandidates.map((c, i) => (
                <tr key={c._id}>
                  <td className="ps-4">
                    <span className={`badge rounded-circle d-flex align-items-center justify-content-center ${i === 0 ? 'bg-warning text-dark shadow-sm' : 'bg-light text-muted border'}`} style={{ width: '32px', height: '32px' }}>{i + 1}</span>
                  </td>
                  <td className="py-4">
                    <div className="d-flex align-items-center">
                      <img src={c.candidatePhoto ? c.candidatePhoto : "admin.jpg"} className="rounded-circle me-3 border shadow-sm object-fit-cover" style={{ width: "45px", height: "45px" }} alt="" />
                      <div className="fw-bold text-app-dark">{c.name}</div>
                    </div>
                  </td>
                  <td><span className="badge bg-light text-dark border rounded-pill px-3 py-2 fw-normal">{c.party}</span></td>
                  <td className="text-center fw-bold text-app-dark">{c.voteCount || 0}</td>
                  <td className="pe-4" style={{ minWidth: '150px' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="progress flex-grow-1" style={{ height: '8px', borderRadius: '10px' }}>
                        <div className={`progress-bar rounded-pill ${i === 0 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${totalVotes > 0 ? (c.voteCount / totalVotes) * 100 : 0}%` }}></div>
                      </div>
                      <span className="fw-bold small text-app-dark">{totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedCandidates.length === 0 && (
            <div className="text-center py-5 text-app-muted">
              <i className="bi bi-inbox fs-1 d-block mb-3"></i>
              {t.noResults || "No results to display."}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isEmbedded) return content;

  return (
    <Layout
      user={user}
      setUser={setUser}
      activeTab="results"
      setActiveTab={() => { }}
      title={t.resultsHub || "Results Hub"}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      {content}
    </Layout>
  );
};

export default Results;