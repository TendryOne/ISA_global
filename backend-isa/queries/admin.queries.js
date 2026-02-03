const { generatePassword } = require("../function/generatePassword");
const Admin = require("../models/admin.model");
const SuperAdmin = require("../models/superAdmin.model");
const User = require("../models/user.model");
const { EncryptPassword } = require("../secure/securepassword");



class AdminQueries {
    constructor() {
        this.model = User;
    }

    async getAdmin(pageQuery, perPageQuery, searchQuery, roleQuery) {
        try {
            let page = parseInt(pageQuery) || 1;
            let perPage = parseInt(perPageQuery) || 10;


            let query = {};
            if (searchQuery) {
                const searchRegex = new RegExp(searchQuery.trim(), 'i');
                query.$or = [
                    { name: { $regex: searchRegex } },
                    { firstName: { $regex: searchRegex } }
                ];
            }
            if (roleQuery !== '') {
                query.role = roleQuery;
            } else {
                query.role = { $in: ['admin', 'superAdmin'] };
            }


            const total = await this.model.countDocuments({ ...query });
            const admins = await this.model.find({ ...query })
                .select('-password')
                .skip((page - 1) * perPage)
                .limit(perPage)
                .sort({ createdAt: -1 });

            return { total, admins };
        } catch (error) {
            throw error
        }
    }


    async getUsersById(id) {
        try {
            return await this.model.findById(id).select('-password');
        } catch (error) {
            throw error
        }
    }

    async UpdateUsersById(id, update, session = null) {
        try {
            const Model = update.role === 'superAdmin' ? SuperAdmin : Admin;
            const options = { new: true };
            if (session) options.session = session;

            return await Model.findByIdAndUpdate(id, update, options).select('-password');

        } catch (error) {
            throw error
        }
    }

    async CreateUser(data, session = null) {
        try {


            let newUser;
            if (data.role === 'superAdmin') {
                newUser = new SuperAdmin(data);
            } else {
                newUser = new Admin(data);
            }

            return await newUser.save({ session });
        } catch (error) {
            throw error
        }
    }

    async DeleteUser(id, session = null) {
        try {
            return await this.model.findByIdAndDelete(id, { session });
        } catch (error) {
            throw error
        }
    }
}

module.exports = new AdminQueries