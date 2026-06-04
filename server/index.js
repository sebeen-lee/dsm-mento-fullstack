import express from "express";
import path from "path";
import memosRouter from "./routes/memos.js";
import { fileURLToPath } from "url";
import "dsmhs-screener";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use("/memos", memosRouter);

app.use(express.static(path.join(__dirname, "../public")));

app.listen(3000, () => {
  console.log("Server on 3000 (http://localhost:3000/)");
});

