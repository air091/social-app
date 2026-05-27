import express from "express";
import "dotenv/config";
// import cors from "cors";

const app = express();
const port = process.env.port || 8000;

app.use(express.json());

app.listen(port, () => console.log(`Server running in port ${port}`));
