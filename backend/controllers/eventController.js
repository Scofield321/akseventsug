const path = require("path");
const supabase = require("../config/supabase");

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../models/eventModel");

// const { getEventMedia } = require("../models/eventMediaModel");
const {
  getEventMedia,
  createEventMedia,
} = require("../models/eventMediaModel");

const getEvents = async (req, res) => {
  try {
    const events = await getAllEvents();

    res.json(events);
  } catch (error) {
    console.error("🔴 Get events error:", error);

    res.status(500).json({
      message: "Failed to retrieve events",
    });
  }
};

const getSingleEvent = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const media = await getEventMedia(req.params.id);

    res.json({
      ...event,
      media,
    });
  } catch (error) {
    console.error("🔴 Get event error:", error);

    res.status(500).json({
      message: "Failed to retrieve event",
    });
  }
};

const createNewEvent = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      event_date,
      location,
      image_url,
      video_url,
      status,
    } = req.body;

    if (!title || !slug || !event_date) {
      return res.status(400).json({
        message: "Title, slug and event date are required",
      });
    }

    const event = await createEvent({
      title,
      slug,
      description,
      event_date,
      location,
      image_url,
      video_url,
      status,
    });

    // Add uploaded media to event_media table

    if (image_url) {
      await createEventMedia({
        event_id: event.id,
        media_type: "image",
        media_url: image_url,
        sort_order: 0,
      });
    }

    if (video_url) {
      await createEventMedia({
        event_id: event.id,
        media_type: "video",
        media_url: video_url,
        sort_order: 1,
      });
    }

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("🔴 Create event error:", error);

    res.status(500).json({
      message: "Failed to create event",
    });
  }
};

const updateExistingEvent = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const updatedEvent = await updateEvent(req.params.id, req.body);

    const { image_url, video_url } = req.body;

    if (image_url) {
      await createEventMedia({
        event_id: req.params.id,
        media_type: "image",
        media_url: image_url,
        sort_order: 0,
      });
    }

    if (video_url) {
      await createEventMedia({
        event_id: req.params.id,
        media_type: "video",
        media_url: video_url,
        sort_order: 1,
      });
    }

    res.json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("🔴 Update event error:", error);

    res.status(500).json({
      message: "Failed to update event",
    });
  }
};

const deleteExistingEvent = async (req, res) => {
  try {
    const event = await deleteEvent(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json({
      message: "Event deleted successfully",
      event,
    });
  } catch (error) {
    console.error("🔴 Delete event error:", error);

    res.status(500).json({
      message: "Event deleted successfully",
      event,
    });
  }
};

const uploadEventImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const fileExt = path.extname(req.file.originalname);

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}${fileExt}`;

    const filePath = `events/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("akseventsug")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("🔴 Supabase image upload error:", uploadError);

      return res.status(500).json({
        message: "Failed to upload image",
      });
    }

    const { data } = supabase.storage
      .from("akseventsug")
      .getPublicUrl(filePath);

    res.json({
      message: "Image uploaded successfully",
      image_url: data.publicUrl,
    });
  } catch (error) {
    console.error("🔴 Image upload error:", error);

    res.status(500).json({
      message: "Server error during image upload",
    });
  }
};

const uploadEventVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No video uploaded",
      });
    }

    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

    if (!allowedVideoTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Invalid video format. Please upload MP4, WebM or MOV.",
      });
    }

    const fileExt = path.extname(req.file.originalname);

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}${fileExt}`;

    const filePath = `events/videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("akseventsug")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("🔴 Supabase video upload error:", uploadError);

      return res.status(500).json({
        message: "Failed to upload video",
      });
    }

    const { data } = supabase.storage
      .from("akseventsug")
      .getPublicUrl(filePath);

    res.json({
      message: "Video uploaded successfully",
      video_url: data.publicUrl,
    });
  } catch (error) {
    console.error("🔴 Video upload error:", error);

    res.status(500).json({
      message: "Server error during video upload",
    });
  }
};

module.exports = {
  getEvents,
  getSingleEvent,
  createNewEvent,
  updateExistingEvent,
  deleteExistingEvent,
  uploadEventImage,
  uploadEventVideo,
};
