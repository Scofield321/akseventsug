const pool = require("../config/db");


// ============================================================
// GET ALL MEDIA FOR EVENT
// ============================================================

const getEventMedia = async (eventId) => {
  const result = await pool.query(
    `
      SELECT
        id,
        event_id,
        media_type,
        media_url,
        thumbnail_url,
        sort_order,
        created_at
      FROM event_media
      WHERE event_id = $1
      ORDER BY sort_order ASC, id ASC
    `,
    [eventId]
  );

  return result.rows;
};


// ============================================================
// GET SINGLE MEDIA
// ============================================================

const getMediaById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        id,
        event_id,
        media_type,
        media_url,
        thumbnail_url,
        sort_order,
        created_at
      FROM event_media
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
};


// ============================================================
// CREATE EVENT MEDIA
// ============================================================

const createEventMedia = async ({
  event_id,
  media_type,
  media_url,
  thumbnail_url = null,
  sort_order = 0,
}) => {

  if (!event_id) {
    throw new Error("event_id is required");
  }

  if (!media_type) {
    throw new Error("media_type is required");
  }

  if (!media_url) {
    throw new Error("media_url is required");
  }

  if (
    media_type !== "image" &&
    media_type !== "video"
  ) {
    throw new Error(
      'media_type must be either "image" or "video"'
    );
  }


  const result = await pool.query(
    `
      INSERT INTO event_media
      (
        event_id,
        media_type,
        media_url,
        thumbnail_url,
        sort_order
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [
      event_id,
      media_type,
      media_url,
      thumbnail_url,
      sort_order,
    ]
  );

  return result.rows[0];
};


// ============================================================
// DELETE SINGLE MEDIA
// ============================================================
//
// IMPORTANT:
// This deletes ONLY the PostgreSQL record.
//
// It does NOT delete the actual file from Supabase Storage.
//
// That is intentional.
//

const deleteEventMedia = async (id) => {

  const result = await pool.query(
    `
      DELETE FROM event_media
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return result.rows[0] || null;
};


// ============================================================
// DELETE ALL MEDIA FOR EVENT
// ============================================================
//
// Deletes all event_media database records belonging
// to an event.
//
// It does NOT delete files from Supabase Storage.
//

const deleteAllEventMedia = async (eventId) => {

  const result = await pool.query(
    `
      DELETE FROM event_media
      WHERE event_id = $1
      RETURNING *
    `,
    [eventId]
  );

  return result.rows;
};


// ============================================================
// REPLACE ALL EVENT MEDIA
// ============================================================
//
// This is the important part.
//
// When an event is updated:
//
// 1. Remove all old event_media rows.
// 2. Insert the current image URLs.
// 3. Insert the current video URLs.
// 4. Return the new media.
//
// The actual files remain safely inside Supabase Storage.
//

const replaceEventMedia = async (
  eventId,
  imageUrls = [],
  videoUrls = []
) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");


    // --------------------------------------------------------
    // DELETE EXISTING MEDIA
    // --------------------------------------------------------

    await client.query(
      `
        DELETE FROM event_media
        WHERE event_id = $1
      `,
      [eventId]
    );


    // --------------------------------------------------------
    // INSERT IMAGES
    // --------------------------------------------------------

    let sortOrder = 0;

    for (const imageUrl of imageUrls) {

      if (!imageUrl) {
        continue;
      }

      await client.query(
        `
          INSERT INTO event_media
          (
            event_id,
            media_type,
            media_url,
            thumbnail_url,
            sort_order
          )
          VALUES ($1, 'image', $2, NULL, $3)
        `,
        [
          eventId,
          imageUrl,
          sortOrder,
        ]
      );

      sortOrder++;
    }


    // --------------------------------------------------------
    // INSERT VIDEOS
    // --------------------------------------------------------

    for (const videoUrl of videoUrls) {

      if (!videoUrl) {
        continue;
      }

      await client.query(
        `
          INSERT INTO event_media
          (
            event_id,
            media_type,
            media_url,
            thumbnail_url,
            sort_order
          )
          VALUES ($1, 'video', $2, NULL, $3)
        `,
        [
          eventId,
          videoUrl,
          sortOrder,
        ]
      );

      sortOrder++;
    }


    // --------------------------------------------------------
    // GET NEW MEDIA
    // --------------------------------------------------------

    const result = await client.query(
      `
        SELECT
          id,
          event_id,
          media_type,
          media_url,
          thumbnail_url,
          sort_order,
          created_at
        FROM event_media
        WHERE event_id = $1
        ORDER BY sort_order ASC, id ASC
      `,
      [eventId]
    );


    await client.query("COMMIT");

    return result.rows;

  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();

  }
};


// ============================================================
// UPDATE MEDIA ORDER
// ============================================================

const updateMediaOrder = async (
  id,
  sort_order
) => {

  const result = await pool.query(
    `
      UPDATE event_media
      SET sort_order = $1
      WHERE id = $2
      RETURNING *
    `,
    [
      sort_order,
      id,
    ]
  );

  return result.rows[0] || null;
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  getEventMedia,

  getMediaById,

  createEventMedia,

  deleteEventMedia,

  deleteAllEventMedia,

  replaceEventMedia,

  updateMediaOrder,

};