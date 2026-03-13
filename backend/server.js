const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDatabase = require("./config/connection");
const {
  register,
  login,
  userDetails,
  updateProfile,
  changePassword,
} = require("./controllers/user.controller");
const authenticate = require("./middlewares/auth");
const upload = require("./middlewares/upload");

const isAdmin = require("./middlewares/adminAuth");
const User = require("./models/user.model");

const app = express();
const server = http.createServer(app);

dotenv.config();

// enhanced socketIo.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible in request object
app.set("io", io);

connectDatabase();

const createDefaultAdmin = async () => {
  try {
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin'
      });
      console.log('Default admin created');
    } else {
      admin.password = process.env.ADMIN_PASSWORD || 'admin123';
      await admin.save();
      console.log('Admin password updated');
    }
  } catch (error) {
    console.error('Error creating/updating default admin:', error);
  }
};

createDefaultAdmin();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ limit: "16kb" }))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
const candidateRoutes = require("./routes/candidate.routes");
const settingsRoutes = require("./routes/settings.routes");


// apis;
app.post("/api/register", upload.single("profileImage"), register);
app.post("/api/login", login);
app.get("/api/me", authenticate, userDetails);
app.put("/api/update-profile", authenticate, upload.single("profileImage"), updateProfile);
app.put("/api/change-password", authenticate, changePassword);

// Use candidate routes
app.use("/api/candidates", candidateRoutes);

// Use settings routes
app.use("/api/settings", settingsRoutes);

// socket io events
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
});
