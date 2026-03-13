const { Schema, models, model, Types } = require("mongoose");

const candidateSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        party: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
        },
        candidatePhoto: {
            type: String,
            default: "",
        },
        voteCount: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Candidate = models.Candidate || model("Candidate", candidateSchema);

module.exports = Candidate;
