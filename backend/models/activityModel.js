const pool = require('../config/db');

const activityModel = {
  /**
   * Get all activities for a lead, ordered by most recent
   */
  async findByLeadId(leadId) {
    const result = await pool.query(
      'SELECT * FROM activities WHERE lead_id = $1 ORDER BY created_at DESC',
      [leadId]
    );
    return result.rows;
  },

  /**
   * Create a new activity and update the related lead
   */
  async create({ lead_id, type, note, outcome_status, follow_up_date, new_number }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the activity
      const activityResult = await client.query(
        `INSERT INTO activities (lead_id, type, note, outcome_status, follow_up_date, new_number)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [lead_id, type, note || null, outcome_status, follow_up_date || null, new_number || null]
      );

      // Build lead update
      const leadUpdates = [
        'status = $1',
        'attempt_count = attempt_count + 1',
        'last_contacted_at = NOW()',
        'updated_at = NOW()',
      ];
      const leadParams = [outcome_status];
      let paramIdx = 2;

      if (follow_up_date) {
        leadUpdates.push(`next_follow_up = $${paramIdx}`);
        leadParams.push(follow_up_date);
        paramIdx++;
      } else {
        leadUpdates.push('next_follow_up = NULL');
      }

      if (new_number) {
        leadUpdates.push(`phone = $${paramIdx}`);
        leadParams.push(new_number);
        paramIdx++;
      }

      leadParams.push(lead_id);

      const leadResult = await client.query(
        `UPDATE leads SET ${leadUpdates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        leadParams
      );

      await client.query('COMMIT');

      return {
        activity: activityResult.rows[0],
        lead: leadResult.rows[0],
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = activityModel;
