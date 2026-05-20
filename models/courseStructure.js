const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
}, { _id: false });

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    chapters: [chapterSchema],
}, { _id: false });

const courseStructureSchema = new mongoose.Schema({
    course: {
        type: String,
        enum: ['mdcat', 'nums'],
        required: true,
        unique: true,
    },
    subjects: [subjectSchema],
}, { timestamps: true });

const CourseStructure = mongoose.model('CourseStructure', courseStructureSchema);
module.exports = CourseStructure;
