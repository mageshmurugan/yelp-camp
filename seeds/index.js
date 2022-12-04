const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 15; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '62e3ec75ab2aa61afc02a3ed',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)},${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/magesh/image/upload/v1659197537/YelpCamp/tiqxtpz9tdqq8grzyfof.jpg',
                    filename: 'YelpCamp/tiqxtpz9tdqq8grzyfof'
                },
                {
                    url: 'https://res.cloudinary.com/magesh/image/upload/v1659197542/YelpCamp/mqchbz9zotqych2uljhj.jpg',
                    filename: 'YelpCamp/mqchbz9zotqych2uljhj'
                }
            ]
        })
        await camp.save();
    }
}


seedDB().then(() => {
    mongoose.connection.close()
})    
