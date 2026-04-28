import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import timingRoutes from "./routes/timingRoutes.js";
import homeContentRoutes from "./routes/homeContentRoutes.js";
import aboutPageRoutes from "./routes/aboutPageRoutes.js"
import eventRoutes from "./routes/eventRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors())
app.use(express.json())

//LoadTest
app.use(express.static('public'));

//routes
app.use("/api", timingRoutes);
app.use("/api", homeContentRoutes);
app.use("/api", aboutPageRoutes);
app.use("/api", eventRoutes);
app.use("/api", donationRoutes);
app.use("/api/contact", contactRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.send("Mandir backend running 🙏")
});

// MongoDB connection
const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGODB_URI).then(() => { console.log("MongoDB connected successfully ✅"); app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) }); }).catch((error) => { console.error("MongoDB connection error ❌", error); });
