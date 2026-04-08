const pool = require('../config/db');

const listModel = {
  /**
   * Get all lead lists
   */
  async findAll() {
    const result = await pool.query(`
      SELECT ll.*, 
        (SELECT COUNT(*)::integer FROM leads l WHERE l.list_id = ll.id) as lead_count
      FROM lead_lists ll
      ORDER BY ll.created_at DESC
    `);
    return result.rows;
  },

  /**
   * Find list by ID
   */
  async findById(id) {
    const result = await pool.query(`
      SELECT ll.*, 
        (SELECT COUNT(*)::integer FROM leads l WHERE l.list_id = ll.id) as lead_count
      FROM lead_lists ll
      WHERE ll.id = $1
    `, [id]);
    return result.rows[0] || null;
  },

  /**
   * Create a new list
   */
  async create({ name, description }) {
    const result = await pool.query(
      `INSERT INTO lead_lists (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description || null]
    );
    return result.rows[0];
  },

  /**
   * Update a list
   */
  async update(id, { name, description }) {
    const setClauses = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE lead_lists SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex} RETURNING *
    `;
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  },

  /**
   * Delete a list (leads remain but become unlinked)
   */
  async delete(id) {
    const result = await pool.query('DELETE FROM lead_lists WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  },

  /**
   * Get stats per list
   */
  async getListStats(listId) {
    const result = await pool.query(`
      SELECT status, COUNT(*)::integer as count
      FROM leads WHERE list_id = $1
      GROUP BY status ORDER BY status
    `, [listId]);

    const totalResult = await pool.query(
      'SELECT COUNT(*)::integer as total FROM leads WHERE list_id = $1',
      [listId]
    );

    const stats = { total: totalResult.rows[0].total, byStatus: {} };
    for (const row of result.rows) {
      stats.byStatus[row.status] = row.count;
    }
    return stats;
  },
};

module.exports = listModel;
