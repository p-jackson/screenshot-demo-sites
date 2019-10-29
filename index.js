/* @ts-check */

const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const captureWebsite = require("capture-website");

const mkdir = promisify(fs.mkdir);

const DEMO_SITES = {
  leven: "https://levendemo.wordpress.com/?demo"
  // rockfield: "https://rockfielddemo.wordpress.com/?demo",
  // coutoire: "https://coutoiredemo.wordpress.com/?demo",
  // morden: "https://mordendemo.wordpress.com/?demo",
  // stratford: "https://stratforddemo.wordpress.com/?demo",
  // exford: "https://exforddemo.wordpress.com/?demo",
  // alves: "https://alvesdemo.wordpress.com/?demo",
  // rivington: "https://rivingtondemo.wordpress.com/?demo",
  // mayland: "https://maylanddemo.wordpress.com/?demo",
  // dalston: "https://dalstondemo.wordpress.com/?demo",
  // barnsbury: "https://barnsburydemo.wordpress.com/?demo",
  // balasana: "https://balasanademo.wordpress.com/?demo"
};

async function run() {
  try {
    await mkdir(path.resolve(process.cwd(), "shots"));
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }

  for (const [theme, url] of Object.entries(DEMO_SITES)) {
    console.log(`Capturing ${theme}`);

    console.log("  phone");
    const phonePath = path.resolve(
      process.cwd(),
      "shots",
      `preview-${theme}-phone.jpg`
    );
    await capture(url, phonePath, false);
    console.log(`    ${phonePath}`);

    console.log("  desktop");
    const desktopPath = path.resolve(
      process.cwd(),
      "shots",
      `preview-${theme}-desktop.jpg`
    );
    await capture(url, desktopPath, true);
    console.log(`    ${desktopPath}`);
  }
}

/**
 * @param {string} url
 * @param {string} output
 * @param {boolean} isDesktop
 */
async function capture(url, output, isDesktop) {
  await captureWebsite.file(url, output, {
    width: isDesktop ? 904 : 280,
    height: isDesktop ? 600 : 440,
    scaleFactor: 2, // Always take retina screenshots
    fullPage: true,
    overwrite: true,
    clickElement: ['.widget_eu_cookie_law_widget input[type="submit"]'],
    delay: 2, // Wait while the cookie banner fades out
    type: "jpeg",
    quality: 0.3,
    beforeScreenshot: async page => {
      await removeParallax(page);
    }
  });
}

/**
 * @param {import('puppeteer').Page} page
 */
async function removeParallax(page) {
  await page.evaluate(() => {
    const elements = document.querySelectorAll(".has-parallax");
    for (const element of elements) {
      element.classList.remove("has-parallax");
    }
  });
}

run().catch(e => {
  console.log(e.stack);
  process.exit(1);
});
