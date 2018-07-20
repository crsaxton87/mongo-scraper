# NYT Scraper

![NYT Scraper Screenshot](./screenshot.jpg)

Deployed app available [here](https://mongo-scraper-crs87.herokuapp.com/).

### Overview

This app scrapes the latest articles from the front page of the New York Times, saves them to a Mongo database, then allows users to add or edit comments on the stored articles.

### Operation

1. To scrape new articles, click *Scrape*. A modal will appear telling the user how many new articles have been scraped and saved.
2. To save an article, click the *Save Article* button next to the article. To unsave, click the button again.
3. To view saved articles, click *Saved Articles* in the navigation bar. 
4. To add or edit a note on an article, click the *Add/Edit Note* button. In the notes modal, use the *Save Note* button to save and the *X* button to delete the note.

### Technology Used
* MongoDB
* Mongoose
* Cheerio
* Express
* Axios
* Handlebars
* Bootstrap
* jQuery
