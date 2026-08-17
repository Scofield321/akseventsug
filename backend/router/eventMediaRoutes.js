const express = require("express");

const multer = require("multer");

const {
  getMedia,
  uploadMedia,
  deleteMedia,
} = require("../controllers/eventMediaController");

const protect =
  require("../middleware/authMiddleware");


const upload =
  multer({
    storage:
      multer.memoryStorage(),
  });


const router =
  express.Router();


// =========================================
// GET MEDIA FOR EVENT
// =========================================

router.get(
  "/:eventId",
  getMedia
);


// =========================================
// UPLOAD MEDIA
// =========================================

router.post(
  "/:eventId/upload",
  protect,
  upload.single("media"),
  uploadMedia
);


// =========================================
// DELETE MEDIA
// =========================================

router.delete(
  "/media/:mediaId",
  protect,
  deleteMedia
);


module.exports = router;