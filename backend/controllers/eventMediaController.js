const path = require("path");

const supabase = require("../config/supabase");

const {
  getEventMedia,
  getMediaById,
  createEventMedia,
  deleteEventMedia,
  updateMediaOrder,
} = require("../models/eventMediaModel");

const {
  getEventById,
} = require("../models/eventModel");


// ============================================================
// GET MEDIA FOR EVENT
// ============================================================

const getMedia = async (req, res) => {
  try {

    const eventId = req.params.eventId;

    // --------------------------------------------------------
    // CHECK EVENT EXISTS
    // --------------------------------------------------------

    const event =
      await getEventById(eventId);

    if (!event) {

      return res.status(404).json({
        message: "Event not found",
      });
    }


    // --------------------------------------------------------
    // GET MEDIA
    // --------------------------------------------------------

    const media =
      await getEventMedia(eventId);


    res.json(media);

  } catch (error) {

    console.error(
      "🔴 Get event media error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to retrieve event media",
    });
  }
};


// ============================================================
// UPLOAD MEDIA FOR EXISTING EVENT
// ============================================================

const uploadMedia = async (req, res) => {
  try {

    const eventId =
      req.params.eventId;


    // --------------------------------------------------------
    // CHECK EVENT EXISTS
    // --------------------------------------------------------

    const event =
      await getEventById(eventId);

    if (!event) {

      return res.status(404).json({
        message:
          "Event not found",
      });
    }


    // --------------------------------------------------------
    // CHECK FILE
    // --------------------------------------------------------

    if (!req.file) {

      return res.status(400).json({
        message:
          "No media file uploaded",
      });
    }


    console.log(
      "📁 Uploaded media:",
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
    // DETERMINE FILE TYPE
    // --------------------------------------------------------

    const fileExt =
      path.extname(
        req.file.originalname
      ).toLowerCase();


    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
    ];


    const videoExtensions = [
      ".mp4",
      ".webm",
      ".mov",
    ];


    const isImage =
      req.file.mimetype.startsWith(
        "image/"
      ) ||
      imageExtensions.includes(
        fileExt
      );


    const isVideo =
      req.file.mimetype.startsWith(
        "video/"
      ) ||
      videoExtensions.includes(
        fileExt
      );


    if (!isImage && !isVideo) {

      return res.status(400).json({
        message:
          "Only JPG, PNG, WEBP, GIF, MP4, WebM or MOV files are allowed",
      });
    }


    // --------------------------------------------------------
    // VALIDATE VIDEO
    // --------------------------------------------------------

    if (isVideo) {

      if (
        !videoExtensions.includes(
          fileExt
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid video format. Please upload MP4, WebM or MOV.",
        });
      }
    }


    // --------------------------------------------------------
    // DETERMINE MEDIA TYPE
    // --------------------------------------------------------

    const mediaType =
      isImage
        ? "image"
        : "video";


    // --------------------------------------------------------
    // CREATE UNIQUE FILE NAME
    // --------------------------------------------------------

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}${fileExt}`;


    const folder =
      mediaType === "image"
        ? "events/images"
        : "events/videos";


    const filePath =
      `${folder}/${fileName}`;


    // --------------------------------------------------------
    // DETERMINE CONTENT TYPE
    // --------------------------------------------------------

    let contentType =
      req.file.mimetype;


    if (mediaType === "video") {

      if (fileExt === ".mp4") {
        contentType = "video/mp4";
      }

      else if (
        fileExt === ".webm"
      ) {
        contentType = "video/webm";
      }

      else if (
        fileExt === ".mov"
      ) {
        contentType =
          "video/quicktime";
      }
    }


    // --------------------------------------------------------
    // UPLOAD TO SUPABASE STORAGE
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
            contentType,
            upsert: false,
          }
        );


    if (uploadError) {

      console.error(
        "🔴 Supabase media upload error:",
        uploadError
      );

      return res.status(500).json({
        message:
          "Failed to upload media",
      });
    }


    // --------------------------------------------------------
    // GET PUBLIC URL
    // --------------------------------------------------------

    const {
      data: publicUrlData,
    } =
      supabase.storage
        .from("akseventsug")
        .getPublicUrl(
          filePath
        );


    const mediaUrl =
      publicUrlData?.publicUrl;


    if (!mediaUrl) {

      console.error(
        "🔴 Supabase returned no public URL"
      );

      return res.status(500).json({
        message:
          "Media uploaded but public URL could not be generated",
      });
    }


    // --------------------------------------------------------
    // GET CURRENT SORT ORDER
    // --------------------------------------------------------

    const existingMedia =
      await getEventMedia(
        eventId
      );


    const sortOrder =
      existingMedia.length;


    // --------------------------------------------------------
    // SAVE MEDIA URL IN POSTGRESQL
    // --------------------------------------------------------

    const media =
      await createEventMedia({

        event_id:
          eventId,

        media_type:
          mediaType,

        media_url:
          mediaUrl,

        thumbnail_url:
          null,

        sort_order:
          sortOrder,

      });


    // --------------------------------------------------------
    // RETURN MEDIA
    // --------------------------------------------------------

    res.status(201).json({

      message:
        "Media uploaded successfully",

      media,

    });

  } catch (error) {

    console.error(
      "🔴 Media upload error:",
      error
    );

    res.status(500).json({
      message:
        "Server error during media upload",
    });
  }
};


// ============================================================
// DELETE EVENT MEDIA
// ============================================================

const deleteMedia = async (req, res) => {
  try {

    const mediaId =
      req.params.mediaId;


    // --------------------------------------------------------
    // FIND MEDIA
    // --------------------------------------------------------

    const media =
      await getMediaById(
        mediaId
      );


    if (!media) {

      return res.status(404).json({
        message:
          "Media not found",
      });
    }


    // --------------------------------------------------------
    // DELETE DATABASE RECORD
    // --------------------------------------------------------

    const deletedMedia =
      await deleteEventMedia(
        mediaId
      );


    /*
     * We deliberately delete the database
     * record here.
     *
     * The actual Supabase Storage file is
     * handled separately below.
     */


    // --------------------------------------------------------
    // DELETE FILE FROM SUPABASE STORAGE
    // --------------------------------------------------------

    try {

      const mediaUrl =
        media.media_url;


      /*
       * Extract the storage path from
       * the public Supabase URL.
       *
       * Example:
       *
       * https://.../storage/v1/object/public/
       * akseventsug/events/images/file.jpg
       *
       * We only need:
       *
       * events/images/file.jpg
       */

      const marker =
        "/storage/v1/object/public/akseventsug/";


      const markerIndex =
        mediaUrl.indexOf(
          marker
        );


      if (
        markerIndex !== -1
      ) {

        const filePath =
          mediaUrl.substring(
            markerIndex +
              marker.length
          );


        const {
          error: storageError,
        } =
          await supabase.storage
            .from("akseventsug")
            .remove([
              filePath,
            ]);


        if (storageError) {

          console.error(
            "⚠️ Media database record deleted, but Supabase file deletion failed:",
            storageError
          );

        }

      }

    } catch (storageError) {

      console.error(
        "⚠️ Storage cleanup error:",
        storageError
      );

    }


    // --------------------------------------------------------
    // RETURN RESULT
    // --------------------------------------------------------

    res.json({

      message:
        "Media deleted successfully",

      media:
        deletedMedia,

    });

  } catch (error) {

    console.error(
      "🔴 Delete media error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete media",
    });
  }
};


// ============================================================
// UPDATE MEDIA ORDER
// ============================================================

const updateMediaOrderController = async (
  req,
  res
) => {
  try {

    const mediaId =
      req.params.mediaId;


    const {
      sort_order,
    } = req.body;


    // --------------------------------------------------------
    // VALIDATE SORT ORDER
    // --------------------------------------------------------

    if (
      sort_order === undefined ||
      sort_order === null
    ) {

      return res.status(400).json({
        message:
          "sort_order is required",
      });
    }


    const media =
      await getMediaById(
        mediaId
      );


    if (!media) {

      return res.status(404).json({
        message:
          "Media not found",
      });
    }


    // --------------------------------------------------------
    // UPDATE ORDER
    // --------------------------------------------------------

    const updatedMedia =
      await updateMediaOrder(
        mediaId,
        sort_order
      );


    res.json({

      message:
        "Media order updated successfully",

      media:
        updatedMedia,

    });

  } catch (error) {

    console.error(
      "🔴 Update media order error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update media order",
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

  getMedia,

  uploadMedia,

  deleteMedia,

  updateMediaOrder:
    updateMediaOrderController,

};