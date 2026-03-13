const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidate.controller");
const authenticate = require("../middlewares/auth");
const isAdmin = require("../middlewares/adminAuth");
const upload = require("../middlewares/upload");

// Public routes (or authenticated but not admin)
router.get("/", candidateController.getAllCandidates);
router.get("/:id", candidateController.getCandidateById);
router.post("/vote/:id", authenticate, candidateController.voteForCandidate);

// Admin only routes
router.post("/", authenticate, isAdmin, upload.single("candidatePhoto"), candidateController.createCandidate);
router.put("/:id", authenticate, isAdmin, upload.single("candidatePhoto"), candidateController.updateCandidate);
router.delete("/:id", authenticate, isAdmin, candidateController.deleteCandidate);

module.exports = router;
