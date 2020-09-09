const puppeteer = require("puppeteer");
const Sheet = require("./sheet");

//Be sure to preclude the url with "old" when scraping reddit
const url =
  "https://old.reddit.com/r/investing/comments/dhuq60/bernie_sanders_unveils_plan_to_raise_corporate/";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "load" });
  } catch (err) {
    console.error(err);
    await browser.close();
  }

  const sheet = new Sheet();
  await sheet.load();

  //Create sheet with a title
  const title = await page.$eval(".top-matter a", (el) => el.textContent);

  const sheetIndex = await sheet.addSheet(title.slice(0, 99), [
    "points",
    "text",
  ]);

  //open up "load more comments" links

  let expandButtons = await page.$$(".morecomments a");
  while (expandButtons.length) {
    for (let button of expandButtons) {
      await page.evaluate((selector) => {
        return selector.click();
      }, button);
      await page.waitFor(400);
    }
    expandButtons = await page.$$(".morecomments a");
  }

  //scrape all comment text and point values

  const comments = await page.$$(".entry");

  let rows = [];
  for (let comment of comments) {
    //scrape points
    const points = await comment
      .$eval(".score", (el) => el.textContent)
      .catch((err) => console.log({ points: 0 }));

    //scrape text
    const rawText = await comment
      .$eval(".md p", (text) => text.textContent)
      .catch((err) => console.error("No text found"));

    if (points && rawText) {
      const text = rawText.replace(/\n/g, "");
      rows = [...rows, { points, text }];
    }
  }

  //sort comments by points
  const sorted = rows.sort(
    (a, b) =>
      parseInt(b.points.split(" ")[0]) - parseInt(a.points.split(" ")[0])
  );

  //insert into google sheet
  await sheet.addRows(sorted, sheetIndex);

  await browser.close();
})();
