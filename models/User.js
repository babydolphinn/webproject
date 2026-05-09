const mongoose = require('mongoose');

class UserModel {
    static getSchema() {
        return new mongoose.Schema({
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true,
                unique: true
            },
            password: {
                type: String,
                required: true
            },
            resetPasswordToken: String,
            resetPasswordExpires: Date
        });
    }

    static getModel() {
        return mongoose.model('User', this.getSchema());
    }
}

module.exports = UserModel.getModel();