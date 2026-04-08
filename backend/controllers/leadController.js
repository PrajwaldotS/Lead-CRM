const leadService = require('../services/leadService');
const listService = require('../services/listService');
const { success, error } = require('../utils/responseHelper');

const leadController = {
  async getLeads(req, res, next) {
    try {
      const result = await leadService.getLeads(req.query);
      return success(res, result, 'Leads retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getLeadById(req, res, next) {
    try {
      const lead = await leadService.getLeadById(req.params.id);
      return success(res, lead, 'Lead retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async importLeads(req, res, next) {
    try {
      const { leads, listName, listDescription } = req.body;
      
      let listId = null;
      if (listName && listName.trim()) {
        const list = await listService.createList({ 
          name: listName.trim(), 
          description: listDescription?.trim() || null 
        });
        listId = list.id;
      }

      const result = await leadService.importLeads(leads, listId);
      return success(res, { ...result, listId }, 'Leads imported successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateLead(req, res, next) {
    try {
      const lead = await leadService.updateLead(req.params.id, req.body);
      return success(res, lead, 'Lead updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteLead(req, res, next) {
    try {
      await leadService.deleteLead(req.params.id);
      return success(res, null, 'Lead deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = leadController;
