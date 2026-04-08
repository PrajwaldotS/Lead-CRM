const pool = require('../config/db');

const leadModel = {
  /**
   * Get paginated leads with optional filters
   */
  async findAll({ page = 1, limit = 25, status, search, sort = 'created_at', order = 'desc', followUpFilter, listId }) {
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`l.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(l.name ILIKE $${paramIndex} OR l.phone ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (followUpFilter === 'today') {
      conditions.push(`l.next_follow_up::date = CURRENT_DATE`);
    } else if (followUpFilter === 'upcoming') {
      conditions.push(`l.next_follow_up::date > CURRENT_DATE`);
    } else if (followUpFilter === 'missed') {
      conditions.push(`l.next_follow_up::date < CURRENT_DATE AND l.status NOT IN ('converted', 'not_interested', 'wrong_number')`);
    }

    if (listId) {
      conditions.push(`l.list_id = $${paramIndex}`);
      params.push(parseInt(listId, 10));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Whitelist sortable columns
    const allowedSorts = ['created_at', 'updated_at', 'name', 'status', 'attempt_count', 'last_contacted_at', 'next_follow_up', 'priority'];
    const safeSort = allowedSorts.includes(sort) ? sort : 'created_at';
    const safeOrder = order === 'asc' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) FROM leads l ${whereClause}`;
    const dataQuery = `
      SELECT l.* FROM leads l
      ${whereClause}
      ORDER BY l.${safeSort} ${safeOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params.slice(0, paramIndex - 1)),
      pool.query(dataQuery, params),
    ]);

    return {
      leads: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit),
    };
  },

  /**
   * Find a single lead by ID
   */
  async findById(id) {
    const result = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  /**
   * Bulk insert leads from JSON import
   */
  async bulkInsert(leads, listId = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const inserted = [];
      for (const lead of leads) {
        const result = await client.query(
          `INSERT INTO leads (name, phone, location, category, source, list_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING
           RETURNING *`,
          [lead.name, lead.phone, lead.location || null, lead.category || null, lead.source || 'apify', listId]
        );
        if (result.rows[0]) {
          inserted.push(result.rows[0]);
        }
      }

      await client.query('COMMIT');
      return { inserted: inserted.length, leads: inserted };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Update lead fields
   */
  async update(id, fields) {
    const allowedFields = ['name', 'phone', 'location', 'category', 'status', 'source', 'attempt_count', 'priority', 'last_contacted_at', 'next_follow_up'];
    const setClauses = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE leads
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },

  /**
   * Delete a lead
   */
  async delete(id) {
    const result = await pool.query('DELETE FROM leads WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  },

  /**
   * Get aggregate stats by status
   */
  async getStats() {
    const result = await pool.query(`
      SELECT
        status,
        COUNT(*)::integer as count
      FROM leads
      GROUP BY status
      ORDER BY status
    `);

    const totalResult = await pool.query('SELECT COUNT(*)::integer as total FROM leads');

    const stats = {
      total: totalResult.rows[0].total,
      byStatus: {},
    };

    for (const row of result.rows) {
      stats.byStatus[row.status] = row.count;
    }

    return stats;
  },

  /**
   * Get follow-up leads grouped by today/upcoming/missed
   */
  async getFollowUps() {
    const todayQuery = `
      SELECT * FROM leads
      WHERE next_follow_up::date = CURRENT_DATE
        AND status NOT IN ('converted', 'not_interested', 'wrong_number')
      ORDER BY next_follow_up ASC
    `;
    const upcomingQuery = `
      SELECT * FROM leads
      WHERE next_follow_up::date > CURRENT_DATE
        AND status NOT IN ('converted', 'not_interested', 'wrong_number')
      ORDER BY next_follow_up ASC
    `;
    const missedQuery = `
      SELECT * FROM leads
      WHERE next_follow_up::date < CURRENT_DATE
        AND status NOT IN ('converted', 'not_interested', 'wrong_number')
      ORDER BY next_follow_up ASC
    `;

    const [today, upcoming, missed] = await Promise.all([
      pool.query(todayQuery),
      pool.query(upcomingQuery),
      pool.query(missedQuery),
    ]);

    return {
      today: today.rows,
      upcoming: upcoming.rows,
      missed: missed.rows,
    };
  },
};

module.exports = leadModel;
