const mongoose = require('mongoose');
const wrapAsync = require('../utils/wrapAsync.js');
const Course = require('../models/course.js');
const router = require('express').Router();


router.post('/',wrapAsync(async (req, res) => {
    const {courseName, courseDescription, coursePrice, discount, discountType, discountActive } = req.body;
    const cname=courseName;
    const cdesc=courseDescription;
    const cprice=coursePrice;

    try {
        // Find the document
        let course = await Course.findOne({ cname });

        if (course) {
            // Update the existing course
            course.cdesc = cdesc;
            course.cprice = cprice;
            course.cdiscount = discount !== undefined ? discount : (course.cdiscount || 0);
            course.discountType = discountType || course.discountType || 'percentage';
            course.discountActive = discountActive !== undefined ? discountActive : (course.discountActive || false);
            await course.save();
            res.status(200).json({ message: `${cname} Course Updated successfully` });
        } else {
            // Create a new course
            course = new Course({
                cname,
                cdesc,
                cprice,
                cdiscount: discount || 0,
                discountType: discountType || 'percentage',
                discountActive: discountActive || false,
            });
            await course.save();
            res.status(200).json({ message: `${cname} Created successfully`});
        }

    } catch (error) {
        res.status(500).json({ message: 'An error occurred' });
    }
}));

router.get('/all',wrapAsync(async (req, res) => {
    try {
        const course = await Course.find(); // Find the course by cname
        if (course) {
            return res.status(200).send(course); // Send the course if found
        } else {
            return res.status(404).json({ error: "Course not found" }); // Return a 404 error if course not found
        }
    } catch (error) {
        console.error("Error retrieving course:", error);
        return res.status(500).json({ error: "Internal server error" }); // Return a 500 error for any other errors
    }
}));

router.get('/:cname',wrapAsync(async (req, res) => {
    const { cname } = req.params; // Extract the cname parameter from req.params
    try {
        const course = await Course.findOne({ cname }); // Find the course by cname
        if (course) {
            return res.status(200).send(course); // Send the course if found
        } else {
            return res.status(404).json({ error: "Course not found" }); // Return a 404 error if course not found
        }
    } catch (error) {
        console.error("Error retrieving course:", error);
        return res.status(500).json({ error: "Internal server error" }); // Return a 500 error for any other errors
    }
}));

// Get course with calculated final price
router.get('/:cname/pricing',wrapAsync(async (req, res) => {
    const { cname } = req.params;
    try {
        const course = await Course.findOne({ cname });
        if (course) {
            let finalPrice = course.cprice;
            let discountAmount = 0;
            
            if (course.discountActive && course.cdiscount > 0) {
                if (course.discountType === 'percentage') {
                    discountAmount = course.cprice * (course.cdiscount / 100);
                    finalPrice = course.cprice - discountAmount;
                } else {
                    discountAmount = course.cdiscount;
                    finalPrice = course.cprice - course.cdiscount;
                }
            }
            
            return res.status(200).json({
                courseName: course.cname,
                description: course.cdesc,
                originalPrice: course.cprice,
                discountActive: course.discountActive || false,
                discount: course.cdiscount || 0,
                discountType: course.discountType || 'percentage',
                discountAmount: discountAmount,
                finalPrice: finalPrice,
                savings: discountAmount,
                savingsPercentage: course.cprice > 0 ? ((discountAmount / course.cprice) * 100).toFixed(2) : 0
            });
        } else {
            return res.status(404).json({ error: "Course not found" });
        }
    } catch (error) {
        console.error("Error retrieving course pricing:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));





module.exports=router;