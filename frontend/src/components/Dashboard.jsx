import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Loading from "./Loading";
import Results from "./Results";
import ElectionTimer from "./ElectionTimer";
import Layout from "./Layout";
import { useLanguage } from "../context/LanguageContext.js";

const Dashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votedCandidate, setVotedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllParties, setShowAllParties] = useState(false);
  const [electionEndDate, setElectionEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  const { language, t, partyTranslations } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          if (data.role !== "admin") {
            setUser(data);
            if (data.votedFor) {
              try {
                const candidateResponse = await fetch(`/api/candidates/${data.votedFor}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (candidateResponse.ok) {
                  const candidateData = await candidateResponse.json();
                  if (candidateData.success) {
                    setVotedCandidate(candidateData.candidate);
                  }
                }
              } catch (error) {
                console.error("Error fetching voted candidate:", error);
              }
            }
          } else {
            navigate("/admin");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/candidates");
      const data = await response.json();
      if (response.ok && data.success) {
        setCandidates(data.candidates || data);
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (response.ok && data.electionEndDate) {
        setElectionEndDate(data.electionEndDate);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCandidates();
      fetchSettings();
    }
  }, [user]);

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.party.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const majorPartiesData = [
    { name: 'CPN-UML', logo: 'parties/cpn-uml.jpg' },
    { name: 'Nepali Congress', logo: 'parties/nc.jpg' },
    { name: 'CPN-Maoist', logo: 'parties/maoist.jpg' },
    { name: 'RSP', logo: 'parties/rsp.jpg' },
  ];

  const allPartiesData = [
    { name: 'CPN-UML', logo: 'parties/cpn-uml.jpg' },
    { name: 'Nepali Congress', logo: 'parties/nc.jpg' },
    { name: 'CPN-Maoist', logo: 'parties/maoist.jpg' },
    { name: 'RSP', logo: 'parties/rsp.jpg' },
    { name: 'Bibeksheel Sajha', logo: 'parties/bibeksheel.jpg' },
    { name: 'Nepal Majdoor Kisan', logo: 'parties/nmkp.jpg' },
    { name: 'CPN (Marxist)', logo: 'parties/cpn-marxist.jpg' },
    { name: 'CPN (Revolutionary)', logo: 'parties/cpn-revolutionary.jpg' },
    { name: 'Rastriya Janamorcha', logo: 'parties/rajamo.jpg' },
    { name: 'Ujyaalo Nepal', logo: 'parties/ujyaalo.jpg' },
    { name: 'Pen Symbol', logo: 'parties/pen.jpg' },
    { name: 'Shram Sanskriti', logo: 'parties/ShramSanskriti.jpg' },
  ];

  if (loading) return <Loading />;
  if (!user) return null;

  const isElectionEnded = electionEndDate && new Date().getTime() > new Date(electionEndDate).getTime();

  return (
    <Layout
      user={user}
      setUser={setUser}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      title={t.panel}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      {/* HOME TAB */}
      <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
        <div className="row g-4 align-items-stretch">
          <div className="col-12 col-xl-5">
            <div className="card card-modern h-100 p-4 p-md-5 border-0 shadow-lg position-relative overflow-hidden">
              <h1 className="display-6 fw-bold text-app-dark mb-3">{t.welcome}, {user.fullName?.split(' ')[0] || t.voter}!</h1>
              <p className="lead text-app-muted mb-5">{t.guidelinesInfo}</p>

              <div className="d-flex flex-column gap-4">
                <div className="p-4 rounded-4 bg-light bg-opacity-10 border-start border-4 border-primary">
                  <h6 className="fw-bold mb-1 text-app-dark">{t.guidelines}</h6>
                  <p className="small text-app-muted mb-0">{t.guidelinesInfo}</p>
                </div>

                {user.votedFor ? (
                  <div className="card card-modern border-0 bg-success bg-opacity-10 p-4">
                    <div className="text-center mb-3 text-success">
                      <i className="bi bi-check-circle-fill fs-1 animate-pulse"></i>
                      <h5 className="fw-bold mt-2">{t.success}</h5>
                    </div>
                    {votedCandidate ? (
                      <div className="d-flex align-items-center p-3 bg-white bg-opacity-10 rounded-4 shadow-sm">
                        <img src={votedCandidate.candidatePhoto ? votedCandidate.candidatePhoto : "admin.jpg"} className="rounded-circle me-3 avatar-size" alt="voted" />
                        <div>
                          <div className="small text-app-muted">{t.votedFor}:</div>
                          <div className="fw-bold text-app-dark">{votedCandidate.name}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <div className="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                        <span className="small text-app-muted text-success">Loading...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className={`btn ${isElectionEnded ? 'btn-secondary' : 'btn-primary'} rounded-pill py-3 fw-bold shadow-sm`}
                    onClick={() => !isElectionEnded && navigate("/vote")}
                    disabled={isElectionEnded}
                  >
                    <i className="bi bi-ballot-fill me-2"></i>
                    {isElectionEnded ? t.timeEnded : t.ballot}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-7">
            <div className="row g-4 h-100">
              <div className="col-12">
                <div className="card card-modern p-4 shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold text-app-dark mb-0">{t.majorParties}</h5>
                    <button className="btn btn-sm btn-link text-decoration-none fw-bold" onClick={() => setShowAllParties(true)}>{t.viewAll}</button>
                  </div>
                  <div className="d-flex gap-3 gap-md-4 overflow-auto pb-3 custom-scrollbar">
                    {majorPartiesData.map((party, idx) => (
                      <div key={idx} className="party-card text-center text-nowrap p-3 rounded-4 border shadow-sm flex-shrink-0 " style={{ minWidth: '130px' }}>
                        <div className="party-logo-container shadow-sm">
                          <img src={party.logo} alt={party.name} className="party-logo-img" />
                        </div>
                        <h6 className="fw-bold mb-0 text-app-dark" style={{ fontSize: '0.85rem' }}>{party.name}</h6>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="stats-grid">
                  <div className="stats-card candidates">
                    <div className="card card-modern p-4 bg-primary text-white shadow-sm h-100 d-flex flex-column justify-content-center" style={{ background: 'linear-gradient(135deg, #4364F7 0%, #6FB1FC 100%)' }}>
                      <h2 className="fw-bold mb-1">{candidates.length}</h2>
                      <p className="small mb-0 opacity-75">{t.activeCandidates}</p>
                    </div>
                  </div>
                  <div className="stats-card timer">
                    <div className="card card-modern p-4 shadow-sm border-0 bg-white d-flex flex-column justify-content-center h-100">
                      <ElectionTimer targetDate={electionEndDate} t={t} type="user" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CANDIDATES PREVIEW */}
        <div className="mt-5">
          <div className="card card-modern shadow-sm overflow-hidden">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="fw-bold text-app-dark mb-0">{t.preview}</h5>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={() => setActiveTab("results")}>{t.liveResults}</button>
                <button
                  className={`btn ${isElectionEnded ? 'btn-secondary' : 'btn-primary'} btn-sm rounded-pill px-3`}
                  onClick={() => !isElectionEnded && navigate("/vote")}
                  disabled={isElectionEnded}
                >
                  {isElectionEnded ? t.timeEnded : t.goVote}
                </button>
              </div>
            </div>

            <div className="table-responsive d-none d-md-block">
              <table className="table align-middle mb-0">
                <thead>
                  <tr className="bg-light small text-uppercase fw-bold">
                    <th className="px-4 py-3">{t.photogram}</th>
                    <th className="py-3">{t.candidateName}</th>
                    <th className="py-3">{t.partyAffiliation}</th>
                    <th className="py-3 text-center">{t.age}</th>
                  </tr>
                </thead>
                <tbody className="text-app-dark">
                  {filteredCandidates.slice(0, 5).map(c => (
                    <tr key={c._id}>
                      <td className="px-4">
                    <img src={c.candidatePhoto ? c.candidatePhoto : "admin.jpg"} className="rounded-circle border" style={{ width: '50px', height: '50px', objectFit: 'cover' }} alt="" />
                      </td>
                      <td className="fw-bold">{c.name}</td>
                      <td><span className="badge bg-light text-dark border rounded-pill px-3 py-1 fw-normal">{partyTranslations[language][c.party] || c.party}</span></td>
                      <td className="text-center">{c.age} {t.yrs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-md-none p-3">
              {filteredCandidates.slice(0, 5).map(c => (
                <div key={c._id} className="p-3 border rounded-4 mb-2 shadow-sm bg-card">
                  <div className="d-flex align-items-center gap-3">
                    <img src={c.candidatePhoto ? c.candidatePhoto : "admin.jpg"} className="rounded-circle border" style={{ width: '50px', height: '50px', objectFit: 'cover' }} alt="" />
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-1 text-app-dark">{c.name}</h6>
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                        {partyTranslations[language][c.party] || c.party}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredCandidates.length === 0 && <div className="p-5 text-center text-app-muted">{t.noMatch}</div>}
          </div>
        </div>
      </div>

      {/* RESULTS TAB */}
      <div style={{ display: activeTab === 'results' ? 'block' : 'none' }}>
        <Results isEmbedded={true} passedUser={user} />
      </div>

      {/* ALL PARTIES MODAL */}
      {showAllParties && (
        <div className="modal fade show d-block modal-z" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: 'var(--bg-card)' }}>
              <div className="modal-header border-bottom p-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-app-dark">{t.majorParties}</h5>
                <button className="btn-close" onClick={() => setShowAllParties(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  {allPartiesData.map((party, idx) => (
                    <div key={idx} className="col-6 col-md-4 col-lg-3">
                      <div className="card-modern text-center p-4 rounded-4 border shadow-sm h-100">
                        <div className="mb-3 shadow-sm mx-auto" style={{ width: '60px', height: '60px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                          <img src={party.logo} alt={party.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <h6 className="fw-bold mb-0 text-app-dark" style={{ fontSize: '0.9rem' }}>{party.name}</h6>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-top p-3">
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowAllParties(false)}>{t.close || "Close"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;