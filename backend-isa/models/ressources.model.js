const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ResourcesSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    promotion: { type: Schema.Types.ObjectId, ref: 'Promotion', required: true },
    type: { type: String, enum: ['video', 'document', "external_link"], required: true },
    professor: { type: Schema.Types.ObjectId, ref: 'user', required: true }

}, { timestamps: true })

const Resources = mongoose.model("Resources", ResourcesSchema)

module.exports = Resources