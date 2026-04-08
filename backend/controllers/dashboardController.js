const leadService = require('../services/leadService');
const { success } = require('../utils/responseHelper');

const dashboardController = {
  async getStats(req, res, next) {
    try {
      const stats = await leadService.getDashboardStats();
      return success(res, stats, 'Dashboard stats retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getFollowUps(req, res, next) {
    try {
      const followUps = await leadService.getFollowUps();
      return success(res, followUps, 'Follow-ups retrieved');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dashboardController;
