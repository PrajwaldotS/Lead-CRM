const listModel = require('../models/listModel');

const listService = {
  async getAllLists() {
    return listModel.findAll();
  },

  async getListById(id) {
    const list = await listModel.findById(id);
    if (!list) {
      throw { status: 404, message: 'List not found' };
    }
    return list;
  },

  async createList({ name, description }) {
    if (!name || name.trim() === '') {
      throw { status: 400, message: 'List name is required' };
    }
    return listModel.create({ name: name.trim(), description: description?.trim() });
  },

  async updateList(id, fields) {
    await this.getListById(id);
    const updated = await listModel.update(id, fields);
    if (!updated) {
      throw { status: 400, message: 'No valid fields to update' };
    }
    return updated;
  },

  async deleteList(id) {
    await this.getListById(id);
    return listModel.delete(id);
  },

  async getListStats(id) {
    await this.getListById(id);
    return listModel.getListStats(id);
  },
};

module.exports = listService;
