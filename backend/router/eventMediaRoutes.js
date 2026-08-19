const express = require("express");
const multer = require("multer");

const {
  getMedia,
  uploadMedia,
  deleteMedia,
} = require("../controllers/eventMediaController");

const protect = require("../middleware/authMiddleware");


const router = express.Router();


const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});


// ============================================================
// GET MEDIA FOR EVENT
// ============================================================

router.get(
  "/:eventId",
  getMedia
);

// ============================================================
// UPLOAD MEDIA
// ============================================================

router.post(
  "/:eventId/upload",
  protect,
  upload.single("media"),
  uploadMedia
);

// ============================================================
// DELETE MEDIA
// ============================================================

router.delete(
  "/media/:mediaId",
  protect,
  deleteMedia
);
module.exports = router;