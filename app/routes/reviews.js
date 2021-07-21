const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError")
const { campgroundSchema, reviewSchema } = require('../schemas.js')
const Review = require("../models/review")
const Campground = require("../models/campground")


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const message = error.details.map(el => el.message).join('.')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}

router.post("/", validateReview, async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)


})


router.delete('/:reviewId', catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;

    Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${id}`)
}))
module.exports = router;