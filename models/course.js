const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const courseSchema = new Schema({
    cname: {
        type: String,
        enum: ['nums', 'mdcat', 'mdcat+nums'],
        required: true
    },
    cdesc: {
        type: String,
        required: true
    },
    cprice: {
        type: Number,
        required: true
    },
    cdiscount: {
        type: Number,
        default: 0
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    discountActive: {
        type: Boolean,
        default: false
    },
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;