var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");

var app = express();

var dbbaseUrl = "scrapedb";
var collections = ["ycombinator"];

var db = mongojs(dbbaseUrl, collections);

db.on("error", function(error) {
  console.log("Database Error" + error);
});

app.get("/", function(req, res) {
  res.json("Hello world!");
});

app.get("/all", function(req, res) {
  db.ycombinator.find({}, function(error, found) {
    if (error) {
      console.log(error);
    } else {
      res.json(found);
    }
  });
});

app.get("/scrape", function(req, res) {
  axios.get("https://news.ycombinator.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $(".title").each(function(i, element) {
      var title = $(element)
        .children("a")
        .text();

      var link = $(element)
        .children("a")
        .attr("href");
      console.log({
        title: title,
        link: link
      });
      if (title && link) {
        db.ycombinator.insert(
          {
            title: title,
            link: link
          },
          function(error, inserted) {
            if (error) {
              console.log(error);
            } else {
              console.log(inserted);
            }
          }
        );
      }
    });
  });
  res.send("Scraped successfully");
});

app.listen(3000, function() {
  console.log("app is listening on port 3000");
});
