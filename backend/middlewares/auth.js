const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        
        if (!authHeader) {
            return res.status(401).json({ 
                success: false,
                error: "Authentication required - No token provided" 
            });
        }

        const token = authHeader.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: "Invalid token format" 
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    error: "Token expired",
                    code: "TOKEN_EXPIRED"
                });
            }
            return res.status(401).json({ 
                success: false,
                error: "Invalid token" 
            });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: "User not found" 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ 
            success: false,
            error: "Authentication failed" 
        });
    }
};

module.exports = authenticate;
