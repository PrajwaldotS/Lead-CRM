const listService = require('../services/listService');
const { success, error } = require('../utils/responseHelper');

const listController = {
  async getLists(req, res, next) {
    try {
      const lists = await listService.getAllLists();
      return success(res, lists, 'Lists retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getListById(req, res, next) {
    try {
      const list = await listService.getListById(req.params.id);
      return success(res, list, 'List retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async createList(req, res, next) {
    try {
      const list = await listService.createList(req.body);
      return success(res, list, 'List created successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateList(req, res, next) {
    try {
      const list = await listService.updateList(req.params.id, req.body);
      return success(res, list, 'List updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteList(req, res, next) {
    try {
      await listService.deleteList(req.params.id);
      return success(res, null, 'List deleted successfully');
    } catch (err) {
      next(err);
    }
  },

  async getListStats(req, res, next) {
    try {
      const stats = await listService.getListStats(req.params.id);
      return success(res, stats, 'List stats retrieved successfully');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = listController;
