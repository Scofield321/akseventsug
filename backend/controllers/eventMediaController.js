const path = require("path");

const supabase = require("../config/supabase");

const {
  createEventMedia,
  getEventMedia,
  deleteEventMedia,
} = require("../models/eventMediaModel");

const { getEventById } = require("../models/eventModel");

// =========================================
// GET EVENT MEDIA
// =========================================

const getMedia = async (req, res) => {
  try {
    const event = await getEventById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const media = await getEventMedia(req.params.eventId);

    res.json(media);
  } catch (error) {
    console.error("🔴 Get event media error:", error);

    res.status(500).json({
      message: "Failed to retrieve event media",
    });
  }
};

// =========================================
// UPLOAD EVENT MEDIA
// =========================================

const uploadMedia = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check event exists

    const event = await getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Check file

    console.log("📁 Uploaded file:", {
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
    });

    if (!req.file) {
      return res.status(400).json({
        message: "No media file uploaded",
      });
    }

    // =========================================
    // DETERMINE MEDIA TYPE
    // =========================================

    const fileExt = path.extname(req.file.originalname).toLowerCase();

    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    const videoExtensions = [".mp4", ".webm", ".mov"];

    const isImage =
      req.file.mimetype.startsWith("image/") ||
      imageExtensions.includes(fileExt);

    const isVideo =
      req.file.mimetype.startsWith("video/") ||
      videoExtensions.includes(fileExt);

    if (!isImage && !isVideo) {
      return res.status(400).json({
        message: "Only JPG, PNG, WEBP, GIF, MP4, WebM or MOV files are allowed",
      });
    }

    // =========================================
    // VALIDATE VIDEO FORMAT
    // =========================================

    if (isVideo) {
      if (!videoExtensions.includes(fileExt)) {
        return res.status(400).json({
          message: "Invalid video format. Please upload MP4, WebM or MOV.",
        });
      }
    }

    // File extension

    // const fileExt = path.extname(req.file.originalname);

    // Unique filename

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}${fileExt}`;

    const mediaType = isImage ? "image" : "video";

    const folder = isImage ? "events/images" : "events/videos";

    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase

    const { error: uploadError } = await supabase.storage
      .from("akseventsug")
      .upload(filePath, req.file.buffer, {
        contentType: isVideo
          ? fileExt === ".mp4"
            ? "video/mp4"
            : fileExt === ".webm"
              ? "video/webm"
              : "video/quicktime"
          : req.file.mimetype,

        upsert: false,
      });

    if (uploadError) {
      console.error("🔴 Supabase media upload error:", uploadError);

      return res.status(500).json({
        message: "Failed to upload media",
      });
    }

    // Get public URL

    const { data } = supabase.storage
      .from("akseventsug")
      .getPublicUrl(filePath);

    // Get current media count

    const existingMedia = await getEventMedia(eventId);

    const sortOrder = existingMedia.length;

    // Save in database

    const media = await createEventMedia({
      event_id: eventId,

      media_type: mediaType,

      media_url: data.publicUrl,

      thumbnail_url: null,

      sort_order: sortOrder,
    });

    res.status(201).json({
      message: "Media uploaded successfully",

      media,
    });
  } catch (error) {
    console.error("🔴 Media upload error:", error);

    res.status(500).json({
      message: "Server error during media upload",
    });
  }
};

// =========================================
// DELETE EVENT MEDIA
// =========================================

const deleteMedia = async (req, res) => {
  try {
    const media = await deleteEventMedia(req.params.mediaId);

    if (!media) {
      return res.status(404).json({
        message: "Media not found",
      });
    }

    res.json({
      message: "Media deleted successfully",

      media,
    });
  } catch (error) {
    console.error("🔴 Delete media error:", error);

    res.status(500).json({
      message: "Failed to delete media",
    });
  }
};

module.exports = {
  getMedia,
  uploadMedia,
  deleteMedia,
};
