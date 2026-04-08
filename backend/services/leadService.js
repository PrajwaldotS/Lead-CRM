const leadModel = require('../models/leadModel');

const VALID_STATUSES = [
  'not_called', 'called_no_answer', 'call_back_later',
  'whatsapp_sent', 'interested', 'negotiation',
  'not_interested', 'wrong_number', 'converted',
];

const leadService = {
  async getLeads(queryParams) {
    const { page, limit, status, search, sort, order, follow_up_date, list_id } = queryParams;

    if (status && !VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `Invalid status: ${status}` };
    }

    return leadModel.findAll({
      page: parseInt(page, 10) || 1,
      limit: Math.min(parseInt(limit, 10) || 25, 100),
      status,
      search,
      sort,
      order,
      followUpFilter: follow_up_date,
      listId: list_id,
    });
  },

  async getLeadById(id) {
    const lead = await leadModel.findById(id);
    if (!lead) {
      throw { status: 404, message: 'Lead not found' };
    }
    return lead;
  },

  async importLeads(leads, listId = null) {
    if (!Array.isArray(leads) || leads.length === 0) {
      throw { status: 400, message: 'Leads must be a non-empty array' };
    }

    // Validate each lead
    const errors = [];
    const validLeads = [];

    leads.forEach((lead, index) => {
      const rowErrors = [];
      if (!lead.name || typeof lead.name !== 'string' || lead.name.trim() === '') {
        rowErrors.push('name is required');
      }
      
      let phoneStr = '';
      if (lead.phone && typeof lead.phone === 'string') {
        phoneStr = lead.phone.trim();
      }
      if (!phoneStr) {
         phoneStr = 'N/A';
      }

      if (rowErrors.length > 0) {
        errors.push({ row: index + 1, errors: rowErrors });
      } else {
        validLeads.push({
          name: lead.name.trim(),
          phone: phoneStr,
          location: lead.location?.trim() || null,
          category: lead.category?.trim() || null,
          source: lead.source?.trim() || 'apify',
        });
      }
    });

    if (validLeads.length === 0) {
      throw { status: 400, message: 'No valid leads found', errors };
    }

    const result = await leadModel.bulkInsert(validLeads, listId);
    return {
      ...result,
      skipped: leads.length - validLeads.length,
      validationErrors: errors,
    };
  },

  async updateLead(id, fields) {
    // Verify lead exists
    await this.getLeadById(id);

    if (fields.status && !VALID_STATUSES.includes(fields.status)) {
      throw { status: 400, message: `Invalid status: ${fields.status}` };
    }

    const updated = await leadModel.update(id, fields);
    if (!updated) {
      throw { status: 400, message: 'No valid fields to update' };
    }
    return updated;
  },

  async deleteLead(id) {
    await this.getLeadById(id);
    return leadModel.delete(id);
  },

  async getDashboardStats() {
    return leadModel.getStats();
  },

  async getFollowUps() {
    return leadModel.getFollowUps();
  },
};

module.exports = leadService;
