import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Loading from "./Loading";
import Results from "./Results";
import ElectionTimer from "./ElectionTimer";
import Layout from "./Layout";
import { useLanguage } from "../context/LanguageContext.js";

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [candidateData, setCandidateData] = useState({ name: '', party: '', age: '', description: '' });
    const [candidatePhoto, setCandidatePhoto] = useState(null);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("votes");
    const [activeTab, setActiveTab] = useState("home");
    const [electionEndDate, setElectionEndDate] = useState(null);
    const [newEndDate, setNewEndDate] = useState("");
    const [isEditingTimer, setIsEditingTimer] = useState(false);
    const [candidateErrors, setCandidateErrors] = useState({});
    const [candidateTouched, setCandidateTouched] = useState({});

    const navigate = useNavigate();
    const { language, t, partyTranslations } = useLanguage();

    const getPartyData = () => {
        const englishParties = [
            'CPN-UML', 'Nepali Congress', 'CPN-Maoist', 'RSP', 'Bibeksheel Sajha',
            'Nepal Majdoor Kisan', 'CPN (Marxist)', 'CPN (Revolutionary)',
            'Rastriya Janamorcha', 'Ujyaalo Nepal', 'Pen Symbol', 'Others'
        ];
        return englishParties.map(partyEng => ({
            nameEn: partyEng,
            name: partyTranslations[language][partyEng] || partyEng
        }));
    };

    const allPartiesData = getPartyData();

    // Validation functions for candidate form
    const validateCandidateName = (name) => {
        if (!name) return "Candidate name is required";
        if (name.trim().length < 3) return "Name must be at least 3 characters";
        if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces";
        return "";
    };

    const validateCandidateParty = (party) => {
        if (!party) return "Party is required";
        return "";
    };

    const validateCandidateAge = (age) => {
        if (!age) return "Age is required";
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) return "Age must be between 18 and 100";
        return "";
    };

    const validateCandidateDescription = (description) => {
        if (description && description.length > 500) return "Description cannot exceed 500 characters";
        return "";
    };

    const handleCandidateChange = (e) => {
        const { name, value } = e.target;
        setCandidateData({ ...candidateData, [name]: value });
        
        if (candidateTouched[name]) {
            let error = "";
            if (name === "name") error = validateCandidateName(value);
            else if (name === "party") error = validateCandidateParty(value);
            else if (name === "age") error = validateCandidateAge(value);
            else if (name === "description") error = validateCandidateDescription(value);
            setCandidateErrors({ ...candidateErrors, [name]: error });
        }
    };

    const handleCandidateBlur = (e) => {
        const { name, value } = e.target;
        setCandidateTouched({ ...candidateTouched, [name]: true });
        let error = "";
        if (name === "name") error = validateCandidateName(value);
        else if (name === "party") error = validateCandidateParty(value);
        else if (name === "age") error = validateCandidateAge(value);
        else if (name === "description") error = validateCandidateDescription(value);
        setCandidateErrors({ ...candidateErrors, [name]: error });
    };

    const getLeadingParty = () => {
        if (candidates.length === 0) return "N/A";
        const parties = {};
        candidates.forEach(candidate => {
            parties[candidate.party] = (parties[candidate.party] || 0) + (candidate.voteCount || 0);
        });
        const sortedParties = Object.entries(parties).sort((a, b) => b[1] - a[1]);
        return sortedParties.length > 0 ? sortedParties[0][0] : "N/A";
    };

    const getAverageAge = () => {
        if (candidates.length === 0) return 0;
        const totalAge = candidates.reduce((sum, c) => sum + (parseInt(c.age) || 0), 0);
        return Math.round(totalAge / candidates.length);
    };

    const stats = [
        { title: t.totalCandidates, value: candidates.length },
        { title: t.totalVotesCast, value: candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0) },
        { title: t.leadingParty, value: getLeadingParty() },
        { title: t.averageAge, value: getAverageAge() },
    ];

    const filteredCandidates = candidates
        .filter(candidate =>
            candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case "name": return a.name.localeCompare(b.name);
                case "party": return (a.party || "").localeCompare(b.party || "");
                case "age": return (parseInt(b.age) || 0) - (parseInt(a.age) || 0);
                default: return (b.voteCount || 0) - (a.voteCount || 0);
            }
        });

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }
            try {
                const response = await fetch("/api/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok && data.role === "admin") {
                    setUser(data);
                } else {
                    navigate("/");
                }
            } catch (error) {
                console.error("Error:", error);
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
            if (response.ok) {
                setCandidates(Array.isArray(data) ? data : (data.candidates || []));
            }
        } catch (error) {
            console.error("Error:", error);
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

    useEffect(() => {
        if (!user) return;
        const socket = io("http://localhost:3001");
        socket.on("votesReset", () => alert("All user votes have been automatically reset because there are no candidates."));
        socket.on("candidateUpdated", fetchCandidates);
        socket.on("candidateCreated", fetchCandidates);
        socket.on("candidateDeleted", fetchCandidates);
        return () => socket.disconnect();
    }, [user]);

    const handleAddCandidate = async () => {
        const nameError = validateCandidateName(candidateData.name);
        const partyError = validateCandidateParty(candidateData.party);
        const ageError = validateCandidateAge(candidateData.age);
        const descriptionError = validateCandidateDescription(candidateData.description);

        setCandidateErrors({
            name: nameError,
            party: partyError,
            age: ageError,
            description: descriptionError
        });
        setCandidateTouched({
            name: true,
            party: true,
            age: true,
            description: true
        });

        if (nameError || partyError || ageError || descriptionError) return;

        const token = localStorage.getItem("token");
        try {
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing ? `/api/candidates/${editingId}` : "/api/candidates";
            const formData = new FormData();
            formData.append("name", candidateData.name);
            formData.append("party", candidateData.party);
            formData.append("age", parseInt(candidateData.age) || 0);
            formData.append("description", candidateData.description);
            if (candidatePhoto) formData.append("candidatePhoto", candidatePhoto);

            const response = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (response.ok) {
                resetForm();
                fetchCandidates();
                alert(isEditing ? "Successfully updated candidate" : "Successfully added candidate");
                if (window.bootstrap) {
                    const modal = window.bootstrap.Modal.getInstance(document.getElementById('addCandidateModal'));
                    if (modal) modal.hide();
                }
            }
        } catch (error) { console.error(error); }
    };

    const resetForm = () => {
        setCandidateData({ name: '', party: '', age: '', description: '' });
        setCandidatePhoto(null);
        setIsEditing(false);
        setEditingId(null);
        setCandidateErrors({});
        setCandidateTouched({});
    };

    const handleDeleteCandidates = async () => {
        if (selectedCandidates.length === 0) return;
        const token = localStorage.getItem("token");
        try {
            for (const id of selectedCandidates) {
                await fetch(`/api/candidates/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setSelectedCandidates([]);
            fetchCandidates();
            alert("Successfully deleted selected candidates");
        } catch (error) { console.error(error); }
    };

    const handleSelectCandidate = (id, checked) => {
        if (checked) setSelectedCandidates([...selectedCandidates, id]);
        else setSelectedCandidates(selectedCandidates.filter(sid => sid !== id));
    };

    const handleEditCandidate = (candidate) => {
        setCandidateData({
            name: candidate.name,
            party: candidate.party,
            age: candidate.age.toString(),
            description: candidate.description || ''
        });
        setIsEditing(true);
        setEditingId(candidate._id);
        if (window.bootstrap) {
            const modal = new window.bootstrap.Modal(document.getElementById('addCandidateModal'));
            modal.show();
        }
    };

    const handleSetTimer = async () => {
        if (newEndDate) {
            const now = new Date();
            const selectedDate = new Date(newEndDate);
            const diffInHours = (selectedDate - now) / (1000 * 60 * 60);
            if (diffInHours > 24) return alert("The election timer cannot be set for more than 24 hours from the current time.");
            if (diffInHours <= 0) return alert("The election timer must be set to a future time.");
        }
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ electionEndDate: newEndDate || null })
            });
            const data = await response.json();
            if (response.ok) {
                setElectionEndDate(data.settings.electionEndDate);
                setIsEditingTimer(false);
                alert("Election timer successfully updated.");
            } else {
                alert("Error setting timer: " + (data.message || data.error || "Unknown error"));
            }
        } catch (error) { console.error("Error setting timer:", error); }
    };

    const handleDeleteTimer = async () => {
        if (!window.confirm("Are you sure you want to delete the election timer? This will immediately stop the election.")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ electionEndDate: null })
            });
            if (response.ok) {
                setElectionEndDate(null);
                setNewEndDate("");
                setIsEditingTimer(false);
                alert("Election timer deleted successfully.");
            } else {
                const data = await response.json();
                alert("Error deleting timer: " + (data.message || data.error || "Unknown error"));
            }
        } catch (error) { console.error("Error deleting timer:", error); }
    };

    if (loading) return <Loading />;
    if (!user) return null;

    return (
        <Layout
            user={{ ...user, role: 'admin' }}
            setUser={setUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            title={t.votingAdministration}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showSearch={false}
        >
            <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
                <div className="row g-4 mb-5">
                    {stats.map((stat, index) => (
                        <div className="col-12 col-sm-6 col-lg-3" key={index}>
                            <div className="card card-modern h-100 p-3">
                                <div className="d-flex align-items-center">
                                    <div className="p-3 rounded-4 me-3 text-white opacity-75" style={{
                                        backgroundColor: index === 0 ? "#130f40" : index === 1 ? "#7158e2" : index === 2 ? "#4cd137" : "#ff9f1a",
                                    }}>
                                        {index === 0 && <i className="bi bi-people-fill fs-3"></i>}
                                        {index === 1 && <i className="bi bi-graph-up-arrow fs-3"></i>}
                                        {index === 2 && <i className="bi bi-trophy-fill fs-3"></i>}
                                        {index === 3 && <i className="bi bi-clock-history fs-3"></i>}
                                    </div>
                                    <div>
                                        <div className="text-app-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}>{stat.title}</div>
                                        <div className="h4 mb-0 fw-bold text-app-dark">{stat.value}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card card-modern shadow-sm border-0 mb-4 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold text-app-dark mb-0">Election Timer Control</h5>
                        {electionEndDate && !isEditingTimer && (
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold" onClick={() => { setNewEndDate(new Date(electionEndDate).toISOString().slice(0, 16)); setIsEditingTimer(true); }}>
                                    <i className="bi bi-pencil-square me-1"></i> Edit
                                </button>
                                <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onClick={handleDeleteTimer}>
                                    <i className="bi bi-trash3 me-1"></i> Delete
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="row g-4 align-items-center">
                        <div className="col-lg-6">
                            <ElectionTimer targetDate={electionEndDate} t={t} type="admin" />
                        </div>
                        <div className="col-lg-6">
                            {(!electionEndDate || isEditingTimer) ? (
                                <>
                                    <label className="form-label small fw-bold text-app-muted d-block">{isEditingTimer ? "Update Timer End Date" : "Set New Timer End Date"}</label>
                                    <div className="d-flex gap-2">
                                        <input type="datetime-local" className="form-control rounded-pill border-0 px-4" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-main)' }} value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
                                        <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleSetTimer}>{isEditingTimer ? "Update" : "Save"}</button>
                                        {isEditingTimer && <button className="btn btn-light rounded-pill px-4 fw-bold border" onClick={() => setIsEditingTimer(false)}>Cancel</button>}
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10 d-flex align-items-center">
                                    <div className="me-3 text-primary"><i className="bi bi-info-circle fs-3"></i></div>
                                    <div>
                                        <div className="fw-bold text-primary small mb-1">Timer Active</div>
                                        <div className="text-app-dark small">The election will automatically close when the timer hits zero.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-5 bg-white p-3 rounded-4 shadow-sm">
                    <div className="d-flex flex-wrap gap-2">
                        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#addCandidateModal" style={{ height: "45px" }}>
                            <i className="bi bi-person-plus-fill fs-5"></i> {t.addCandidate}
                        </button>
                        <button className={`btn rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 ${selectedCandidates.length === 0 ? "btn-outline-secondary border-0 opacity-50" : "btn-danger"}`} disabled={selectedCandidates.length === 0} onClick={handleDeleteCandidates} style={{ height: "45px" }}>
                            <i className="bi bi-trash3-fill"></i> {t.delete} ({selectedCandidates.length})
                        </button>
                    </div>
                    <div className="d-flex flex-column flex-sm-row gap-3 align-items-center flex-grow-1 justify-content-md-end">
                        <div className="search-pill d-flex align-items-center flex-grow-1" style={{ maxWidth: '400px' }}>
                            <i className="bi bi-search text-app-muted me-2"></i>
                            <input type="text" className="bg-transparent border-0 w-100 text-app-dark" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ outline: "none", fontSize: "0.9rem" }} />
                        </div>
                        <select className="form-select border-0 rounded-pill px-3 shadow-sm text-app-dark" style={{ width: 'auto', height: "45px", backgroundColor: "var(--input-bg)" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="votes">{t.sortByVotes}</option>
                            <option value="name">{t.sortByName}</option>
                            <option value="party">{t.sortByParty}</option>
                            <option value="age">{t.sortByAge}</option>
                        </select>
                    </div>
                </div>

                <div className="row g-4">
                    {filteredCandidates.map((candidate) => (
                        <div key={candidate._id} className="col-12 col-md-6 col-lg-4">
                            <div className="card card-modern h-100 overflow-hidden">
                                <div className="position-relative" style={{ height: '200px' }}>
                                    <img src={candidate.candidatePhoto ? candidate.candidatePhoto : "admin.jpg"} className="w-100 h-100 object-fit-cover" alt={candidate.name} />
                                    <div className="position-absolute top-0 start-0 m-3">
                                        <input type="checkbox" className="form-check-input shadow-sm" style={{ width: '22px', height: '22px' }} checked={selectedCandidates.includes(candidate._id)} onChange={(e) => handleSelectCandidate(candidate._id, e.target.checked)} />
                                    </div>
                                    <div className="position-absolute top-0 end-0 m-3">
                                        <span className="badge bg-white text-primary shadow-sm rounded-pill px-3 py-2 fw-bold">{candidate.voteCount || 0} Votes</span>
                                    </div>
                                </div>
                                <div className="card-body p-4">
                                    <h5 className="fw-bold text-app-dark mb-1">{candidate.name}</h5>
                                    <div className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 mb-3">{partyTranslations[language][candidate.party] || candidate.party}</div>
                                    <p className="text-app-muted small mb-4 text-truncate-3">{candidate.description}</p>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-light rounded-pill flex-grow-1 fw-bold border text-app-dark" onClick={() => handleEditCandidate(candidate)}>{t.edit}</button>
                                        <button className="btn btn-outline-danger rounded-pill px-3 border" onClick={() => { setSelectedCandidates([candidate._id]); handleDeleteCandidates(); }}>
                                            <i className="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: activeTab === 'results' ? 'block' : 'none' }}>
                <Results isEmbedded={true} passedUser={user} />
            </div>

            {/* Candidate Modal */}
            <div className="modal fade" id="addCandidateModal" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px', width: '95%' }}>
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="profile-dropdown-header py-3 py-md-4">
                            <h4 className="text-white fw-bold mb-0" style={{ fontSize: '1.1rem' }}>{isEditing ? t.saveChanges : t.registerCandidate}</h4>
                        </div>
                        <div className="modal-body p-3 p-md-4" style={{ backgroundColor: 'var(--bg-main)' }}>
                            <div className="row g-3">
                                <div className="col-md-6 col-12">
                                    <label className="form-label fw-bold small text-muted">{t.fullName}</label>
                                    <input type="text" className={`form-control rounded-pill border-0 shadow-sm p-2 p-md-3 text-app-dark ${candidateErrors.name && candidateTouched.name ? 'border-danger border' : ''}`} style={{ backgroundColor: 'var(--input-bg)', fontSize: '0.95rem' }} value={candidateData.name} onChange={handleCandidateChange} onBlur={handleCandidateBlur} name="name" placeholder="Enter Name" />
                                    {candidateErrors.name && candidateTouched.name && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{candidateErrors.name}</span>}
                                </div>
                                <div className="col-md-6 col-12">
                                    <label className="form-label fw-bold small text-muted">{t.partyName}</label>
                                    <select className={`form-select rounded-pill border-0 shadow-sm p-2 p-md-3 text-app-dark ${candidateErrors.party && candidateTouched.party ? 'border-danger border' : ''}`} style={{ backgroundColor: 'var(--input-bg)', fontSize: '0.95rem' }} value={candidateData.party} onChange={handleCandidateChange} onBlur={handleCandidateBlur} name="party">
                                        <option value="">Select Party</option>
                                        {allPartiesData.map((party, idx) => <option key={idx} value={party.nameEn}>{party.name}</option>)}
                                    </select>
                                    {candidateErrors.party && candidateTouched.party && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{candidateErrors.party}</span>}
                                </div>
                                <div className="col-md-6 col-12">
                                    <label className="form-label fw-bold small text-muted">{t.age}</label>
                                    <input type="number" className={`form-control rounded-pill border-0 shadow-sm p-2 p-md-3 text-app-dark ${candidateErrors.age && candidateTouched.age ? 'border-danger border' : ''}`} style={{ backgroundColor: 'var(--input-bg)', fontSize: '0.95rem' }} value={candidateData.age} onChange={handleCandidateChange} onBlur={handleCandidateBlur} name="age" placeholder="Age" />
                                    {candidateErrors.age && candidateTouched.age && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{candidateErrors.age}</span>}
                                </div>
                                <div className="col-md-6 col-12">
                                    <label className="form-label fw-bold small text-muted">{t.photo}</label>
                                    <input type="file" className="form-control rounded-pill border-0 shadow-sm p-2 p-md-3 text-app-dark" style={{ backgroundColor: 'var(--input-bg)', fontSize: '0.95rem' }} onChange={(e) => setCandidatePhoto(e.target.files[0])} accept="image/*" />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold small text-muted">{t.manifesto}</label>
                                    <textarea className={`form-control rounded-4 border-0 shadow-sm p-2 p-md-3 text-app-dark ${candidateErrors.description && candidateTouched.description ? 'border-danger border' : ''}`} style={{ backgroundColor: 'var(--input-bg)', fontSize: '0.95rem' }} rows="3" value={candidateData.description} onChange={handleCandidateChange} onBlur={handleCandidateBlur} name="description" placeholder="Manifesto"></textarea>
                                    {candidateErrors.description && candidateTouched.description && <span className="text-danger small mt-1 d-block"><i className="bi bi-exclamation-circle me-1"></i>{candidateErrors.description}</span>}
                                    <div className="text-muted small mt-1">{candidateData.description.length}/500</div>
                                </div>
                            </div>
                            <div className="d-flex gap-2 gap-md-3 mt-4">
                                <button className="btn btn-light rounded-pill flex-grow-1 py-2 py-md-3 fw-bold border text-app-dark" data-bs-dismiss="modal">{t.cancel}</button>
                                <button className="btn btn-primary rounded-pill flex-grow-1 py-2 py-md-3 fw-bold shadow-blue" onClick={handleAddCandidate} disabled={Object.values(candidateErrors).some(e => e) || !candidateData.name || !candidateData.party || !candidateData.age}>{isEditing ? t.saveChanges : t.registerCandidate}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;