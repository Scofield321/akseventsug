const pool = require("../config/db");

const getAllEvents = async () => {
  const result = await pool.query(
    `SELECT *
     FROM events
     ORDER BY event_date ASC`
  );

  return result.rows;
};

const getEventById = async (id) => {
  const result = await pool.query(
    `SELECT *
     FROM events
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

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
    `INSERT INTO events
      (
        title,
        slug,
        description,
        event_date,
        location,
        image_url,
        video_url,
        status
      )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      title,
      slug,
      description,
      event_date,
      location,
      image_url,
      video_url,
      status || "draft",
    ]
  );

  return result.rows[0];
};

const updateEvent = async (id, fields) => {
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

  for (const field of allowedFields) {
    if (fields[field] !== undefined) {
      updates.push(`${field} = $${parameterIndex}`);
      values.push(fields[field]);
      parameterIndex++;
    }
  }

  if (updates.length === 0) {
    return getEventById(id);
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE events
     SET ${updates.join(", ")},
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $${parameterIndex}
     RETURNING *`,
    values
  );

  return result.rows[0];
};

const deleteEvent = async (id) => {
  const result = await pool.query(
    `DELETE FROM events
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};