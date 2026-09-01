const path = require("path");
const supabase = require("../config/supabase");

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../models/eventModel");

const {
  getEventMedia,
  replaceEventMedia,
} = require("../models/eventMediaModel");


// ============================================================
// GET ALL EVENTS
// ============================================================

const getEvents = async (req, res) => {
  try {

    const events = await getAllEvents();

    res.json(events);

  } catch (error) {

    console.error(
      "🔴 Get events error:",
      error
    );

    res.status(500).json({
      message: "Failed to retrieve events",
    });
  }
};


// ============================================================
// GET SINGLE EVENT
// ============================================================

const getSingleEvent = async (req, res) => {
  try {

    const event = await getEventById(
      req.params.id
    );

    if (!event) {

      return res.status(404).json({
        message: "Event not found",
      });

    }

    const media = await getEventMedia(
      req.params.id
    );

    res.json({
      ...event,
      media,
    });

  } catch (error) {

    console.error(
      "🔴 Get event error:",
      error
    );

    res.status(500).json({
      message: "Failed to retrieve event",
    });
  }
};


// ============================================================
// CREATE EVENT
// ============================================================

const createNewEvent = async (req, res) => {

  try {

    const {
      title,
      slug,
      description,
      event_date,
      location,
      status,

      image_urls = [],
      video_urls = [],

      // Backwards compatibility
      image_url,
      video_url,
    } = req.body;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!title || !slug || !event_date) {

      return res.status(400).json({
        message:
          "Title, slug and event date are required",
      });

    }


    // --------------------------------------------------------
    // NORMALIZE IMAGE URLS
    // --------------------------------------------------------

    const imageUrls =
      Array.isArray(image_urls)
        ? image_urls.filter(Boolean)
        : [];


    // --------------------------------------------------------
    // NORMALIZE VIDEO URLS
    // --------------------------------------------------------

    const videoUrls =
      Array.isArray(video_urls)
        ? video_urls.filter(Boolean)
        : [];


    // --------------------------------------------------------
    // BACKWARDS COMPATIBILITY
    // --------------------------------------------------------

    if (
      imageUrls.length === 0 &&
      image_url
    ) {

      imageUrls.push(image_url);

    }


    if (
      videoUrls.length === 0 &&
      video_url
    ) {

      videoUrls.push(video_url);

    }


    // --------------------------------------------------------
    // PRIMARY MEDIA
    // --------------------------------------------------------

    const primaryImageUrl =
      imageUrls[0] || null;

    const primaryVideoUrl =
      videoUrls[0] || null;


    // --------------------------------------------------------
    // CREATE EVENT
    // --------------------------------------------------------

    const event = await createEvent({

      title,

      slug,

      description,

      event_date,

      location,

      image_url:
        primaryImageUrl,

      video_url:
        primaryVideoUrl,

      status,

    });


    // --------------------------------------------------------
    // SAVE MEDIA
    // --------------------------------------------------------

    const media =
      await replaceEventMedia(
        event.id,
        imageUrls,
        videoUrls
      );


    // --------------------------------------------------------
    // RETURN
    // --------------------------------------------------------

    res.status(201).json({

      message:
        "Event created successfully",

      event,

      media,

    });

  } catch (error) {

    console.error(
      "🔴 Create event error:",
      error
    );


    if (
      error.code === "23505"
    ) {

      return res.status(409).json({
        message:
          "An event with this slug already exists.",
      });

    }


    res.status(500).json({
      message:
        "Failed to create event",
    });
  }
};


// ============================================================
// UPDATE EVENT
// ============================================================

const updateExistingEvent = async (
  req,
  res
) => {

  try {

    const eventId =
      req.params.id;


    // --------------------------------------------------------
    // CHECK EVENT EXISTS
    // --------------------------------------------------------

    const existingEvent =
      await getEventById(
        eventId
      );


    if (!existingEvent) {

      return res.status(404).json({
        message:
          "Event not found",
      });

    }


    // --------------------------------------------------------
    // REQUEST DATA
    // --------------------------------------------------------

    const {
      title,
      slug,
      description,
      event_date,
      location,
      status,

      image_urls = [],
      video_urls = [],

      // Backwards compatibility
      image_url,
      video_url,
    } = req.body;


    // --------------------------------------------------------
    // NORMALIZE IMAGE URLS
    // --------------------------------------------------------

    const imageUrls =
      Array.isArray(image_urls)
        ? image_urls.filter(Boolean)
        : [];


    // --------------------------------------------------------
    // NORMALIZE VIDEO URLS
    // --------------------------------------------------------

    const videoUrls =
      Array.isArray(video_urls)
        ? video_urls.filter(Boolean)
        : [];


    // --------------------------------------------------------
    // BACKWARDS COMPATIBILITY
    // --------------------------------------------------------

    if (
      imageUrls.length === 0 &&
      image_url
    ) {

      imageUrls.push(image_url);

    }


    if (
      videoUrls.length === 0 &&
      video_url
    ) {

      videoUrls.push(video_url);

    }


    // --------------------------------------------------------
    // PRIMARY MEDIA
    // --------------------------------------------------------

    const primaryImageUrl =
      imageUrls[0] || null;

    const primaryVideoUrl =
      videoUrls[0] || null;


    // --------------------------------------------------------
    // UPDATE EVENT
    // --------------------------------------------------------

    const updatedEvent =
      await updateEvent(
        eventId,
        {

          title,

          slug,

          description,

          event_date,

          location,

          status,

          image_url:
            primaryImageUrl,

          video_url:
            primaryVideoUrl,

        }
      );


    // --------------------------------------------------------
    // REPLACE ALL EVENT MEDIA
    // --------------------------------------------------------
    //
    // This removes the old event_media rows and inserts
    // exactly the media currently attached to the event.
    //
    // Supabase Storage files are NOT deleted.
    //
    // --------------------------------------------------------

    const media =
      await replaceEventMedia(
        eventId,
        imageUrls,
        videoUrls
      );


    // --------------------------------------------------------
    // RETURN UPDATED EVENT
    // --------------------------------------------------------

    res.json({

      message:
        "Event updated successfully",

      event:
        updatedEvent,

      media,

    });

  } catch (error) {

    console.error(
      "🔴 Update event error:",
      error
    );


    if (
      error.code === "23505"
    ) {

      return res.status(409).json({
        message:
          "An event with this slug already exists.",
      });

    }


    res.status(500).json({
      message:
        "Failed to update event",
    });
  }
};


// ============================================================
// DELETE EVENT
// ============================================================

const deleteExistingEvent = async (
  req,
  res
) => {

  try {

    const eventId =
      req.params.id;


    const event =
      await deleteEvent(
        eventId
      );


    if (!event) {

      return res.status(404).json({
        message:
          "Event not found",
      });

    }


    // --------------------------------------------------------
    // event_media records are automatically deleted because
    // event_media.event_id has ON DELETE CASCADE.
    //
    // Supabase Storage files are intentionally NOT deleted.
    // --------------------------------------------------------

    res.json({

      message:
        "Event deleted successfully",

      event,

    });

  } catch (error) {

    console.error(
      "🔴 Delete event error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete event",
    });
  }
};


// ============================================================
// UPLOAD EVENT IMAGE
// ============================================================

const uploadEventImage = async (
  req,
  res
) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        message:
          "No image uploaded",
      });

    }


    // --------------------------------------------------------
    // VALIDATE IMAGE
    // --------------------------------------------------------

    if (
      !req.file.mimetype ||
      !req.file.mimetype.startsWith(
        "image/"
      )
    ) {

      return res.status(400).json({
        message:
          "Only image files are allowed",
      });

    }


    // --------------------------------------------------------
    // FILE EXTENSION
    // --------------------------------------------------------

    const fileExt =
      path
        .extname(
          req.file.originalname
        )
        .toLowerCase();


    // --------------------------------------------------------
    // UNIQUE FILE NAME
    // --------------------------------------------------------

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}${fileExt}`;


    const filePath =
      `events/images/${fileName}`;


    // --------------------------------------------------------
    // UPLOAD TO SUPABASE
    // --------------------------------------------------------

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from("akseventsug")
        .upload(
          filePath,
          req.file.buffer,
          {
            contentType:
              req.file.mimetype,

            upsert:
              false,
          }
        );


    if (uploadError) {

      console.error(
        "🔴 Supabase image upload error:",
        uploadError
      );

      return res.status(500).json({
        message:
          "Failed to upload image",
      });

    }


    // --------------------------------------------------------
    // GET PUBLIC URL
    // --------------------------------------------------------

    const {
      data
    } =
      supabase.storage
        .from("akseventsug")
        .getPublicUrl(
          filePath
        );


    const imageUrl =
      data?.publicUrl;


    if (!imageUrl) {

      return res.status(500).json({
        message:
          "Image uploaded but no public URL was returned",
      });

    }


    console.log(
      "🟢 Image uploaded successfully:",
      imageUrl
    );


    res.status(201).json({

      message:
        "Image uploaded successfully",

      image_url:
        imageUrl,

    });

  } catch (error) {

    console.error(
      "🔴 Image upload error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during image upload",
    });
  }
};


// ============================================================
// UPLOAD EVENT VIDEO
// ============================================================

// ============================================================
// UPLOAD EVENT VIDEO
// ============================================================

const uploadEventVideo = async (
  req,
  res
) => {

  try {

    // --------------------------------------------------------
    // CHECK FILE
    // --------------------------------------------------------

    if (!req.file) {

      return res.status(400).json({
        message:
          "No video uploaded",
      });

    }

    console.log(
      "📁 Video received:",
      {
        originalname:
          req.file.originalname,

        mimetype:
          req.file.mimetype,

        size:
          req.file.size,
      }
    );


    // --------------------------------------------------------
    // VALIDATE VIDEO MIME TYPE
    // --------------------------------------------------------

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];


    if (
      !allowedVideoTypes.includes(
        req.file.mimetype
      )
    ) {

      console.error(
        "🔴 Invalid video MIME type:",
        req.file.mimetype
      );

      return res.status(400).json({
        message:
          `Invalid video format: ${req.file.mimetype}. Please upload MP4, WebM or MOV.`,
      });

    }


    // --------------------------------------------------------
    // FILE EXTENSION
    // --------------------------------------------------------

    const fileExt =
      path
        .extname(
          req.file.originalname
        )
        .toLowerCase();


    const allowedExtensions = [
      ".mp4",
      ".webm",
      ".mov",
    ];


    if (
      !allowedExtensions.includes(
        fileExt
      )
    ) {

      console.error(
        "🔴 Invalid video extension:",
        fileExt
      );

      return res.status(400).json({
        message:
          "Invalid video extension. Please upload MP4, WebM or MOV.",
      });

    }


    // --------------------------------------------------------
    // UNIQUE FILE NAME
    // --------------------------------------------------------

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}${fileExt}`;


    const filePath =
      `events/videos/${fileName}`;


    console.log(
      "📤 Uploading video to Supabase:",
      {
        bucket:
          "akseventsug",

        filePath,

        contentType:
          req.file.mimetype,

        size:
          req.file.size,
      }
    );


    // --------------------------------------------------------
    // UPLOAD TO SUPABASE
    // --------------------------------------------------------

    const {
      error: uploadError
    } =
      await supabase.storage
        .from("akseventsug")
        .upload(
          filePath,
          req.file.buffer,
          {
            contentType:
              req.file.mimetype,

            upsert:
              false,
          }
        );


    // --------------------------------------------------------
    // HANDLE SUPABASE ERROR
    // --------------------------------------------------------

    if (uploadError) {

      console.error(
        "🔴 SUPABASE VIDEO UPLOAD FAILED"
      );

      console.error(
        "Error object:",
        uploadError
      );

      console.error(
        "Error message:",
        uploadError.message
      );

      console.error(
        "Error details:",
        uploadError.details
      );

      console.error(
        "Error hint:",
        uploadError.hint
      );

      return res.status(500).json({
        message:
          "Failed to upload video",

        error:
          uploadError.message ||
          "Unknown Supabase storage error",
      });

    }


    // --------------------------------------------------------
    // GET PUBLIC URL
    // --------------------------------------------------------

    const {
      data
    } =
      supabase.storage
        .from("akseventsug")
        .getPublicUrl(
          filePath
        );


    const videoUrl =
      data?.publicUrl;


    if (!videoUrl) {

      console.error(
        "🔴 Supabase returned no public video URL"
      );

      return res.status(500).json({
        message:
          "Video uploaded but no public URL was returned",
      });

    }


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    console.log(
      "🟢 Video uploaded successfully:",
      videoUrl
    );


    res.status(201).json({

      message:
        "Video uploaded successfully",

      video_url:
        videoUrl,

    });


  } catch (error) {

    console.error(
      "🔴 VIDEO UPLOAD SERVER ERROR:",
      error
    );

    console.error(
      "Error message:",
      error.message
    );

    console.error(
      "Error stack:",
      error.stack
    );

    res.status(500).json({
      message:
        "Server error during video upload",

      error:
        error.message ||
        "Unknown server error",
    });

  }
};

// ============================================================
// PREPARE DIRECT SUPABASE VIDEO UPLOAD
// ============================================================

const prepareVideoUpload = async (req, res) => {
  try {
    const {
      fileName,
      contentType,
    } = req.body;

    if (!fileName) {
      return res.status(400).json({
        message: "File name is required.",
      });
    }

    if (!contentType || !contentType.startsWith("video/")) {
      return res.status(400).json({
        message: "A valid video content type is required.",
      });
    }

    const fileExt =
      path
        .extname(fileName)
        .toLowerCase();

    const allowedExtensions = [
      ".mp4",
      ".webm",
      ".mov",
    ];

    if (!allowedExtensions.includes(fileExt)) {
      return res.status(400).json({
        message:
          "Invalid video format. Please upload MP4, WebM or MOV.",
      });
    }

    // --------------------------------------------------------
    // UNIQUE FILE NAME
    // --------------------------------------------------------

    const uniqueFileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}${fileExt}`;

    const filePath =
      `events/videos/${uniqueFileName}`;

    // --------------------------------------------------------
    // CREATE SIGNED UPLOAD URL
    // --------------------------------------------------------

    const {
      data,
      error,
    } =
      await supabase.storage
        .from("akseventsug")
        .createSignedUploadUrl(
          filePath
        );

    if (error) {
      console.error(
        "🔴 Failed to create signed video upload URL:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to prepare video upload.",
      });
    }

    if (!data?.signedUrl) {
      return res.status(500).json({
        message:
          "Supabase did not return a signed upload URL.",
      });
    }

    // --------------------------------------------------------
    // PUBLIC URL
    // --------------------------------------------------------

    const {
      data: publicUrlData,
    } =
      supabase.storage
        .from("akseventsug")
        .getPublicUrl(
          filePath
        );

    const publicUrl =
      publicUrlData?.publicUrl;

    if (!publicUrl) {
      return res.status(500).json({
        message:
          "Video upload URL was created but public URL could not be generated.",
      });
    }

    console.log(
      "🟢 Prepared direct video upload:",
      filePath
    );

    res.json({
      message:
        "Video upload prepared successfully",

      signedUrl:
        data.signedUrl,

      token:
        data.token,

      path:
        filePath,

      video_url:
        publicUrl,
    });

  } catch (error) {

    console.error(
      "🔴 Prepare video upload error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while preparing video upload.",
    });
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getEvents,
  getSingleEvent,
  createNewEvent,
  updateExistingEvent,
  deleteExistingEvent,
  uploadEventImage,
  prepareVideoUpload,
};