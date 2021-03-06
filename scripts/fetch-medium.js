const fetch = require("node-fetch");
const fs = require("fs");

fetch(
  "https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40michaelwesthadley"
)
  .then(res => res.json())
  .then(json => json.items.filter(item => item.categories.length > 0))
  .then(items => fs.writeFileSync("./src/data/medium.json", JSON.stringify(items)));
