const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8080;


function iflixSearch() {
    let jsonData = {};
    let movieList = [];
    const range = Array.from({ length: 3 }, (x, i) => i + 1)
    const iflixUrl = 'https://nepalimoviedb.com/browse/?fullMovie=iflix&page='
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
                , headless: false
            });

            const page = await browser.newPage();
            page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36')
            for (const n in range) {
                await page.goto(iflixUrl + range[n], { "waitUntil": "networkidle0" });
                try {
                    await page.waitForSelector('div[class="movies-list-item"]');
                    const movieTitle = await page.$$('div[class="movies-list-item"]');
                    for (const item of movieTitle) {
                        const infoLink = await item.$('div[class="movies-list-item-content"]');
                        const nameItem = await infoLink.$('div[class="movie-title"]')
                        const movieName = await nameItem.evaluate(nameItem => nameItem.innerText, nameItem);
                        movieList.push(movieName)
                    }
                }
                catch (e) {
                    return reject(e)
                }
            };

            jsonData['iflixMovies'] = uniq = [...new Set(movieList)];
            await browser.close();
            return resolve(jsonData);
        }
        catch (e) {
            return reject(e)
        }
    })
}
app.get('/', (req, res) => {
    (async () => {
        iflixSearch(req.query.url).then(result => {
            res.setHeader('Content-Type', 'text/html');
            res.send(result);
        }).catch(console.error);
    })();
})

app.listen(port, function () {
    console.log('App listening on port ' + port)
})
