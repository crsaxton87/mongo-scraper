//////////// DEPENDENCIES ////////////

const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const logger = require('morgan');
const axios = require('axios');
const path = require('path');
const method = require("method-override");

// Require models
const db = require('./models');

const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

//////////// MIDDLEWARE ////////////
// Use morgan to log requests
app.use(logger('dev'));
// Use body-parser for form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve public folder as static
app.use(express.static('public'));
// Set up Handlebars
app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");
// Method override
app.use(method("_method"));

//////////// Connect to MongoDB ////////////
const databaseUrl = 'mongodb://localhost:27017/nyt';

mongoose.Promise = Promise;

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else if (process.env.MONGOLAB_ORANGE_URI) {
    mongoose.connect(process.env.MONGOLAB_ORANGE_URI);
}
else {
	mongoose.connect(databaseUrl, { useNewUrlParser: true });
};

//////////// ROUTES ////////////

// Route to get all articles from db
app.get("/", function(req, res) {
    // Grab documents from Articles collection
    db.Article.find({}, null, {sort: {created: -1}}, function(err, data) {
        if(data.length === 0) {
            res.render("placeholder", {message: "No articles have been scraped yet. Click \"Scrape\" for newest articles."});
        }
        else {
            res.render("index", {articles: data});
        }
    })
    .catch(function(err) {
        res.json(err);
    });
});

// GET route for scraping NYT website
app.get("/scrape", function(req, res) {
    // Grab HTML
    axios.get("http://www.nytimes.com/section/world").then(function(response) {
        // Load into cheerio as $
        let $ = cheerio.load(response.data);

        // Save empty result object
        let results = [];
        // Grab every div.story-body
        $("div.story-body").each(function(i, element) {

            // Add text and link as properties of result object
            let title = $(element).find("h2.headline").text().trim();
            let link = $(element).find("a").attr("href");
            let summary = '';

            if ($(element).find("p.summary")) {
                summary = $(element).find("p.summary").text().trim();
            }

            // Feed information through Mongoose schema
            let entry = new db.Article({title:title,link:link,summary:summary});

            // Duplicate check
            if (!results.includes(entry)){
                results.push(entry);
            }
            // console.log(results);

        });

        db.Article.create(results, function(err, data) {
            if (err) {
                console.log("duplicates found");
            }
            console.log(data.length);
            res.json({added:data.length});
        });

    })
});

// Route to get saved articles
app.get("/saved", function(req, res) {
    db.Article.find({saved: true}, null, {sort: {created: -1}})
    .populate("note")
    .then(function(data){
        console.log(data);
        if(data.length === 0) {
            res.render("placeholder", {message: "No articles saved. Use \"Save Article\" button to save articles for later."});
        }
        else {
            res.render("saved", {saved: data});
        }
    });
});

// Route to save or un-save an article
app.post("/save/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id}, function(err, data) {
        console.log(data);
        if (data.saved) {
            console.log('false check');
            db.Article.findOneAndUpdate({_id: req.params.id}, {$set: {saved: false, buttonText: "Save Article"}}, { new: true }, function(err, data){
                // res.redirect("/");
                res.json(data);
            });
        }
        else {
            console.log('true check')
            db.Article.findOneAndUpdate({_id: req.params.id}, {$set: {saved: true, buttonText: "Unsave"}}, { new: true }, function(err, data) {
                // res.redirect("/saved");
                res.json(data);
            });
        }
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Route to grab specific article by id and populate with note
app.get("/articles/:id", function(req, res) {
    // Query using id parameter
    db.Article.findOne({ _id: req.params.id })
        // Populate associated notes
        .populate("note")
        .then(function(dbArticle) {
            // If found, send back
            res.json(dbArticle);
            console.log(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for saving / updating Article Notes
app.post("/articles/:id", function(req, res) {
    db.Note.remove({ title: req.body.title })
    .then(function(res) {
        res.json(res);
    })
    .catch(function(err) {
        res.json(err);
    });
    // Create new note with req.body
    db.Note.create(req.body)
        .then(function(dbNote) {
            // If Note created, associate with article req.params.id and return updated entry
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(dbArticle) {
            // If Article updated, send back to client
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for deleting Article Notes
app.post("/articles/delete/:ArtId/:NoteId", function(req, res) {
    db.Note.remove({ _id: req.params.NoteId }, function() {
        console.log(req.params.NoteId + " successfully removed");
    })
    .then(function(res) {
        res.json(res);
    })
    .catch(function(err) {
        res.json(err);
    });
    return db.Article.findOneAndUpdate({ _id: req.params.ArtId }, { note: null }, { new: true })
    .then(function(res) {
        res.json(res);
    })
    .catch(function(err) {
        res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT);
});
