const activityService = require('../services/activityService');
const { success, error } = require('../utils/responseHelper');

const activityController = {
  async getActivities(req, res, next) {
    try {
      const activities = await activityService.getActivitiesByLeadId(req.params.leadId);
      return success(res, activities, 'Activities retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async logActivity(req, res, next) {
    try {
      const result = await activityService.logActivity(req.body);
      return success(res, result, 'Activity logged successfully', 201);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = activityController;
