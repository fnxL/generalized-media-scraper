import util from 'util';
import ScraperService from './scraper/scraper.service';
import { RedditScraper } from './scraper/sites/RedditScraper';
import { GoogleNewsScraper } from './scraper/sites/GoogleNewsScraper';

async function scrp() {
    const scraper = new ScraperService({
        useHeadLessBrowser: false,
        downloadPath: './downloads',
    }).getScraper(GoogleNewsScraper);

    const data = await scraper.scrape('https://news.google.com/');
    console.log(util.inspect(data, false, null, true /* enable colors */));
}

scrp();
