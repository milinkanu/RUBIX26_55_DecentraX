import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import itemRoutes from "./routes/itemRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/items", itemRoutes);
app.use("/api/user", userRoutes);
app.use("/api/claim", claimRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB Error:", err));

app.listen(process.env.PORT || 5000, () =>
  console.log(` Server running on port ${process.env.PORT || 5000}`)
);

