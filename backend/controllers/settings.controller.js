const Settings = require("../models/settings.model");

// Get settings (public/user/admin)
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Create default if not exists
            settings = new Settings();
            await settings.save();
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ error: "Server error", message: error.message });
    }
};

// Update settings (Admin only)
exports.updateSettings = async (req, res) => {
    try {
        const { electionEndDate } = req.body;
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        // Save string or null
        settings.electionEndDate = electionEndDate || null;
        await settings.save();

        res.status(200).json({ message: "Settings updated successfully", settings });
    } catch (error) {
        res.status(500).json({ error: "Server error", message: error.message });
    }
};
