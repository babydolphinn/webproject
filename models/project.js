const mongoose = require('mongoose');

class ProjectModel {
    static getSchema() {
        return new mongoose.Schema({
            title: { type: String, required: true },
            category: { type: String, required: true },
            shortDescription: { type: String, required: true },
            fullDescription: { type: String, required: true },
            experience: { type: String, required: true }
        });
    }
    static getModel() {
        return mongoose.model('Project', this.getSchema());
    }
}

module.exports = ProjectModel.getModel();