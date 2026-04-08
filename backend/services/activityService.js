const activityModel = require('../models/activityModel');
const leadModel = require('../models/leadModel');

const VALID_STATUSES = [
  'not_called', 'called_no_answer', 'call_back_later',
  'whatsapp_sent', 'interested', 'negotiation',
  'not_interested', 'wrong_number', 'converted',
];

const VALID_TYPES = ['call', 'whatsapp'];

const activityService = {
  async getActivitiesByLeadId(leadId) {
    // Verify lead exists
    const lead = await leadModel.findById(leadId);
    if (!lead) {
      throw { status: 404, message: 'Lead not found' };
    }
    return activityModel.findByLeadId(leadId);
  },

  async logActivity(data) {
    const { lead_id, type, note, outcome_status, follow_up_date, new_number } = data;

    // Validate required fields
    if (!lead_id) throw { status: 400, message: 'lead_id is required' };
    if (!type || !VALID_TYPES.includes(type)) {
      throw { status: 400, message: `type must be one of: ${VALID_TYPES.join(', ')}` };
    }
    if (!outcome_status || !VALID_STATUSES.includes(outcome_status)) {
      throw { status: 400, message: `outcome_status must be one of: ${VALID_STATUSES.join(', ')}` };
    }

    // Verify lead exists
    const lead = await leadModel.findById(lead_id);
    if (!lead) {
      throw { status: 404, message: 'Lead not found' };
    }

    return activityModel.create({
      lead_id,
      type,
      note,
      outcome_status,
      follow_up_date: follow_up_date || null,
      new_number: new_number || null,
    });
  },
};

module.exports = activityService;
