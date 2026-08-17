const pool = require("../config/db");

const getEventMedia = async (eventId) => {
  const result = await pool.query(
    `SELECT *
     FROM event_media
     WHERE event_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [eventId]
  );

  return result.rows;
};


const getMediaById = async (id) => {
  const result = await pool.query(
    `SELECT *
     FROM event_media
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};


const createEventMedia = async ({
  event_id,
  media_type,
  media_url,
  thumbnail_url,
  sort_order = 0,
}) => {
  const result = await pool.query(
    `INSERT INTO event_media
      (
        event_id,
        media_type,
        media_url,
        thumbnail_url,
        sort_order
      )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
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


const deleteEventMedia = async (id) => {
  const result = await pool.query(
    `DELETE FROM event_media
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0];
};


const updateMediaOrder = async (id, sort_order) => {
  const result = await pool.query(
    `UPDATE event_media
     SET sort_order = $1
     WHERE id = $2
     RETURNING *`,
    [sort_order, id]
  );

  return result.rows[0];
};


module.exports = {
  getEventMedia,
  getMediaById,
  createEventMedia,
  deleteEventMedia,
  updateMediaOrder,
};