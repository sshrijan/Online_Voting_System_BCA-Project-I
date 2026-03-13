const Candidate = require("../models/candidate.model");
const User = require("../models/user.model");
const Settings = require("../models/settings.model");

// Create a new candidate
exports.createCandidate = async (req, res) => {
    try {
        const { name, party, age, description } = req.body;

        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({ name });
        if (existingCandidate) {
            return res.status(400).json({ 
                success: false,
                error: "Candidate with this name already exists" 
            });
        }

        const candidate = await Candidate.create({
            name,
            party,
            age,
            description,
            candidatePhoto: req.file ? `/uploads/${req.file.filename}` : "",
            createdBy: req.user._id,
        });

        const io = req.app.get("io");
        if (io) io.emit("candidateCreated", candidate);

        res.status(201).json({
            success: true,
            message: "Candidate created successfully",
            candidate
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get all candidates
exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            candidates,
            count: candidates.length
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get a candidate by ID
exports.getCandidateById = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.findById(id);
        
        if (!candidate) {
            return res.status(404).json({ 
                success: false,
                error: "Candidate not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            candidate
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Update a candidate
exports.updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, party, age, description } = req.body;

        const updateData = { name, party, age, description };
        if (req.file) {
            updateData.candidatePhoto = `/uploads/${req.file.filename}`;
        }

        const candidate = await Candidate.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!candidate) {
            return res.status(404).json({ 
                success: false,
                error: "Candidate not found" 
            });
        }

        const io = req.app.get("io");
        if (io) io.emit("candidateUpdated", candidate);

        res.status(200).json({
            success: true,
            message: "Candidate updated successfully",
            candidate
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Delete a candidate
exports.deleteCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const candidate = await Candidate.findByIdAndDelete(id);

        if (!candidate) {
            return res.status(404).json({ 
                success: false,
                error: "Candidate not found" 
            });
        }

        const io = req.app.get("io");
        if (io) io.emit("candidateDeleted", id);

        // Check if there are any candidates left
        const remainingCandidates = await Candidate.countDocuments();

        // If no candidates remain, reset all users' votes
        if (remainingCandidates === 0) {
            await User.updateMany({}, { $set: { votedFor: null } });
            console.log("All candidates deleted. User votes have been reset.");

            // Emit socket event to notify all clients
            if (io) io.emit("votesReset", { message: "All votes have been reset" });
        }

        res.status(200).json({ 
            success: true,
            message: "Candidate deleted successfully"
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Vote for a candidate
exports.voteForCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Check if user has already voted
        const user = await User.findById(userId);
        if (user.votedFor) {
            return res.status(400).json({ 
                success: false,
                error: "You have already voted" 
            });
        }

        // Check if election timer has ended
        const settings = await Settings.findOne();
        if (settings && settings.electionEndDate) {
            const now = new Date();
            const endDate = new Date(settings.electionEndDate);
            if (now > endDate) {
                return res.status(400).json({ 
                    success: false,
                    error: "Election time has ended. You can no longer vote." 
                });
            }
        }

        // Update candidate vote count
        const candidate = await Candidate.findByIdAndUpdate(
            id,
            { $inc: { voteCount: 1 } },
            { new: true }
        );

        if (!candidate) {
            return res.status(404).json({ 
                success: false,
                error: "Candidate not found" 
            });
        }

        // Update user votedFor status
        user.votedFor = id;
        await user.save();

        const io = req.app.get("io");
        if (io) io.emit("candidateUpdated", candidate);

        res.status(200).json({ 
            success: true,
            message: "Vote cast successfully", 
            candidate, 
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                votedFor: user.votedFor
            }
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};
