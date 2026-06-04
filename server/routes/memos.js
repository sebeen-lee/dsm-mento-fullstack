import express from "express";
import { getMemos, getMemosWithOptions, getMemoById, createMemo, deleteMemoById, updateMemoById } from "../db.js";

const router = express.Router();

const sendSuccess = (res, data, status = 200) => {
  res.status(status).json({ success: true, data });
};
const sendError = (res, message, status = 400) => {
  res.status(status).json({ success: false, message });
};

router.get("/", (req, res) => {
  const sort = req.query.sort;
  const limit = req.query.limit;

  const option = {
    sort: sort,
    limit: limit
  }

  getMemosWithOptions(option, (err, rows) => {
    if (err) return sendError(res, "db error", 500);
    return sendSuccess(res, rows);
  });
});

router.get("/:index", (req, res) => {
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index <= 0) {
    return sendError(res, "invalid index", 400);
  }

  getMemoById(index, (err, row) => {
    if (err) return sendError(res, "db error", 500);
    if (!row) return sendError(res, "memo not found", 404);
    return sendSuccess(res, row);
  });
});

router.post("/", (req, res) => {
  const title = req.body?.title?.trim();
  const content = typeof(req.body?.content) === "string" ? req.body.content : "";

  if (!title) {
    return sendError(res, "title is required", 400);
  }

  createMemo(title, content, (err, id) => {
    if (err) return sendError(res, "db error", 500);
    return sendSuccess(res, { id }, 201);
  });
});

router.put('/:index', (req, res) => {
  console.log(req.body);

  const index = Number(req.params.index);
  const { title = "", content = '', pinned = false, image_url = null } = req.body ?? {};

  if (!Number.isInteger(index) || index <= 0) {
    return sendError(res, "invalid id", 400);
  }

  if (!title || !title.trim()) {
    return sendError(res, "title is required", 400);
  }

  updateMemoById(
    index,
    { title: title.trim(), content, pinned: Boolean(pinned), image_url },
    (err, changes) => {
      if (err) return sendError(res, 'db error', 500);
      if (changes === 0) return sendError(res, 'memo not found', 404);
      sendSuccess(res, { id: index, updated: changes });
    }
  );
});

router.delete("/:index", (req, res) => {
    const index = Number(req.params.index);
    
    if(!Number.isInteger(index) || index <= 0) {
        return sendError(res, "invalid index", 400);
    }

    deleteMemoById(index, (err, changes) => {
        if(err) {
            return sendError(res, "db error", 500);
        }
        else if(changes === 0) {
            return sendError(res, "memo not found", 404);
        }

        return sendSuccess(res, { delete: changes });
    });
})

export default router;