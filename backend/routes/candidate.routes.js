const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidate.controller");
const authenticate = require("../middlewares/auth");
const isAdmin = require("../middlewares/adminAuth");
const upload = require("../middlewares/upload");

// Admin only routes (must come BEFORE generic /:id routes to avoid conflicts)
router.post("/", authenticate, isAdmin, upload.single("candidatePhoto"), candidateController.createCandidate);
router.put("/:id", authenticate, isAdmin, upload.single("candidatePhoto"), candidateController.updateCandidate);
router.delete("/:id", authenticate, isAdmin, candidateController.deleteCandidate);

// Public routes (or authenticated but not admin)
router.get("/", candidateController.getAllCandidates);
router.post("/vote/:id", authenticate, candidateController.voteForCandidate);
router.get("/:id", candidateController.getCandidateById);

module.exports = router;
