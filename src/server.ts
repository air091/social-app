import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute.js";
// import cors from "cors";

const app = express();
const port = process.env.port || 8000;

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoute);

app.listen(port, () => console.log(`Server running in port ${port}`));
