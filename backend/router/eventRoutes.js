const express = require("express");
const multer = require("multer");

const {
  getEvents,
  getSingleEvent,
  createNewEvent,
  updateExistingEvent,
  deleteExistingEvent,
  uploadEventImage,
  prepareVideoUpload,
} = require("../controllers/eventController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024 * 1024
  },
});


// ============================================================
// PUBLIC ROUTES
// ============================================================

// Get all events
router.get(
  "/",
  getEvents
);


// Get single event
router.get(
  "/:id",
  getSingleEvent
);


// ============================================================
// PROTECTED ADMIN ROUTES
// ============================================================

// Create event
router.post(
  "/",
  protect,
  createNewEvent
);


// Update event
router.put(
  "/:id",
  protect,
  updateExistingEvent
);


// Delete event
router.delete(
  "/:id",
  protect,
  deleteExistingEvent
);


// ============================================================
// EVENT MEDIA UPLOADS
// ============================================================

// Upload image
router.post(
  "/upload-image",
  protect,
  upload.single("image"),
  uploadEventImage
);

// Upload video
// router.post(
//   "/upload-video",
//   protect,
//   upload.single("video"),
//   uploadEventVideo
// );

// we need this for larger files
router.post(
  "/prepare-video-upload",
  protect,
  prepareVideoUpload
);
module.exports = router;