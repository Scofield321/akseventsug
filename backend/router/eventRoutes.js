const express = require("express");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

const {
  getEvents,
  getSingleEvent,
  createNewEvent,
  updateExistingEvent,
  deleteExistingEvent,
  uploadEventImage,
  uploadEventVideo,
} = require("../controllers/eventController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.get("/", getEvents);
router.post("/upload-image", protect, upload.single("image"), uploadEventImage);
router.post(
  "/upload-video",
  protect,
  upload.single("video"),
  uploadEventVideo
);
router.get("/:id", getSingleEvent);

// Protected admin routes
router.post("/", protect, createNewEvent);
router.put("/:id", protect, updateExistingEvent);
router.delete("/:id", protect, deleteExistingEvent);

module.exports = router;
