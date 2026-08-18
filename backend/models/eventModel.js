const pool = require("../config/db");


// ============================================================
// GET ALL EVENTS
// ============================================================

const getAllEvents = async () => {
  const result = await pool.query(
    `
      SELECT
        e.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', em.id,
              'event_id', em.event_id,
              'media_type', em.media_type,
              'media_url', em.media_url,
              'thumbnail_url', em.thumbnail_url,
              'sort_order', em.sort_order,
              'created_at', em.created_at
            )
            ORDER BY em.sort_order ASC, em.id ASC
          ) FILTER (WHERE em.id IS NOT NULL),
          '[]'
        ) AS media
      FROM events e
      LEFT JOIN event_media em
        ON em.event_id = e.id
      GROUP BY e.id
      ORDER BY e.event_date ASC
    `
  );

  return result.rows;
};


// ============================================================
// GET SINGLE EVENT
// ============================================================

const getEventById = async (id) => {
  const result = await pool.query(
    `
      SELECT *
      FROM events
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};


// ============================================================
// CREATE EVENT
// ============================================================

const createEvent = async ({
  title,
  slug,
  description,
  event_date,
  location,
  image_url,
  video_url,
  status,
}) => {
  const result = await pool.query(
    `
      INSERT INTO events (
        title,
        slug,
        description,
        event_date,
        location,
        image_url,
        video_url,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING *
    `,
    [
      title,
      slug,
      description || null,
      event_date,
      location || null,
      image_url || null,
      video_url || null,
      status || "draft",
    ]
  );

  return result.rows[0];
};


// ============================================================
// UPDATE EVENT
// ============================================================

const updateEvent = async (id, fields) => {
  /*
   * Only these columns are allowed to be updated.
   *
   * These names exactly match the PostgreSQL events table.
   */

  const allowedFields = [
    "title",
    "slug",
    "description",
    "event_date",
    "location",
    "image_url",
    "video_url",
    "status",
  ];


  const updates = [];
  const values = [];

  let parameterIndex = 1;


  /*
   * Build the UPDATE query dynamically,
   * but only using fields from allowedFields.
   */

  for (const field of allowedFields) {

    if (fields[field] !== undefined) {

      updates.push(
        `${field} = $${parameterIndex}`
      );

      values.push(
        fields[field]
      );

      parameterIndex++;
    }
  }


  /*
   * Nothing to update.
   */

  if (updates.length === 0) {
    return getEventById(id);
  }


  /*
   * Add updated_at automatically.
   */

  updates.push(
    "updated_at = CURRENT_TIMESTAMP"
  );


  /*
   * Add event ID as the final parameter.
   */

  values.push(id);


  const result = await pool.query(
    `
      UPDATE events
      SET ${updates.join(", ")}
      WHERE id = $${parameterIndex}
      RETURNING *
    `,
    values
  );


  return result.rows[0];
};


// ============================================================
// DELETE EVENT
// ============================================================

const deleteEvent = async (id) => {

  const result = await pool.query(
    `
      DELETE FROM events
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );


  /*
   * Because event_media.event_id has:
   *
   * ON DELETE CASCADE
   *
   * deleting the event automatically deletes
   * its related event_media records.
   */

  return result.rows[0];
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};