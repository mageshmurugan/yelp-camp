const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary')
const { campgroundSchema } = require('../schemas.js');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });




module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
    // res.render('campgrounds/index', { campgrounds, messages: req.flash('success') })
}

module.exports.renderNewForm = async (req, res) => {
    if (req.session.campgrounds) {
        const camp = await req.session.campgrounds;
        res.render('campgrounds/new', { camp })
    } else {

        res.render('campgrounds/new')
    }

    // res.render('campgrounds/new',{messages:req.flash('success')})
}

module.exports.createCampground = async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const { error } = campgroundSchema.validate(req.body);
    // const orr = campgroundNew.validate(req.files);

    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        req.flash('primary', msg)
        // console.log(req.files)
        if (req.files) {
            const deletes = req.files.map(f => ({ url: f.path, filename: f.filename }));
            for (let delet of deletes) {
                // console.log(delet.filename)
                await cloudinary.uploader.destroy(delet.filename);
            }
        }
        const camp = req.body.campground;
        req.session.campgrounds = camp;

        // res.cookie('title', req.body.campground.title)
        res.redirect('/campgrounds/new')

    }
    else if (!req.files) {
        const msg = error.details.map(el => el.message).join(',')
        req.flash('primary', msg)
        // console.log(req.files)
        const camp = req.body.campground;
        // req.session.campgrounds = camp;
        res.redirect('/campgrounds/new')

    }
    else {
        const campground = await new Campground(req.body.campground)
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        const m = campground.title.split(' ');

        for (let i = 0; i < m.length; i++) {
            m[i] = m[i].charAt(0).toUpperCase() + m[i].slice(1);
        }
        const tit = m.join(' ');
        const a = tit.split(',');

        for (let i = 0; i < a.length; i++) {
            a[i] = a[i].charAt(0).toUpperCase() + a[i].slice(1);
        }
        const b = a.join(',');
        campground.title = b;
        const n = campground.location.split(',');

        for (let i = 0; i < n.length; i++) {
            n[i] = n[i].charAt(0).toUpperCase() + n[i].slice(1);
        }
        const loc = n.join(', ');
        const o = loc.split(' ');

        for (let i = 0; i < o.length; i++) {
            o[i] = o[i].charAt(0).toUpperCase() + o[i].slice(1);
        }
        const lo = o.join(' ');
        campground.location = lo;
        campground.author = req.user._id;
        await campground.save();
        console.log(campground)
        req.session.campgrounds = null;
        req.flash('success', 'Successfully made a new campground')
        // console.log(campground)
        res.redirect(`/campgrounds/${campground._id}`)

    }
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot Find That Campground')
        res.redirect('/campgrounds')
    } else {
        res.render('campgrounds/show', { campground })
    }
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campgrounds = await Campground.findById(id);
    if (!campgrounds) {
        req.flash('error', 'Cannot Find That Campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campgrounds })
}

module.exports.updateCampground = async (req, res) => {

    const { id } = req.params;
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        const deletes = req.files.map(f => ({ url: f.path, filename: f.filename }));
        for (let delet of deletes) {
            // console.log(delet.filename)
            await cloudinary.uploader.destroy(delet.filename);
        }
        req.flash('primary', msg);
        return res.redirect(`/campgrounds/${id}/edit`);
    } else {
        const s = req.body.campground;
        const t = s.title.split(',');

        for (let i = 0; i < t.length; i++) {
            t[i] = t[i].charAt(0).toUpperCase() + t[i].slice(1);
        }
        const u = t.join(',');
        const v = u.split(' ');

        for (let i = 0; i < v.length; i++) {
            v[i] = v[i].charAt(0).toUpperCase() + v[i].slice(1);
        }
        const ti = v.join(' ');
        req.body.campground.title = ti;
        const n = s.location.split(',');

        for (let i = 0; i < n.length; i++) {
            n[i] = n[i].charAt(0).toUpperCase() + n[i].slice(1);
        }
        const loc = n.join(',');
        const o = loc.split(' ');

        for (let i = 0; i < o.length; i++) {
            o[i] = o[i].charAt(0).toUpperCase() + o[i].slice(1);
        }
        const lo = o.join(' ');
        req.body.campground.location = lo;
        // console.log(req.body.campground)

        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        // const campgrounds = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true });
        const imgs = await req.files.map(f => ({ url: f.path, filename: f.filename }));
        await campground.images.push(...imgs);
        await campground.save();
        if (req.body.deleteImages && req.body.deleteImages.length < campground.images.length) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        } else if (req.body.deleteImages) {
            req.flash('primary', `you can delete only ${campground.images.length - 1} images`);
            return res.redirect(`/campgrounds/${campground._id}/edit`);
        }
        req.flash('success', 'Campground updated Successfully')
        res.redirect(`/campgrounds/${campground._id}`)

    }
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deleteImages = await Campground.findById(id);
    // console.log(deleteImages.images)
    for (let images of deleteImages.images) {
        // console.log(images.filename)
        await cloudinary.uploader.destroy(images.filename);
    }
    const deletedCampground = await Campground.findByIdAndDelete(id).populate('reviews');
    req.flash('success', ' Campground Deleted Successfully')

    res.redirect('/campgrounds')
}