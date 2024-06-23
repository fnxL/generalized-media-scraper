import util from 'util';
import ScraperService from './scraper/scraper.service';
import { RedditScraper } from './scraper/sites/RedditScraper';

async function scrp() {
    const scraper = new ScraperService({
        useHeadLessBrowser: false,
        downloadPath: './downloads',
    }).getScraper(RedditScraper);

    const data = await scraper.scrape('https://new.reddit.com/', 'popular');
    console.log(util.inspect(data, false, null, true /* enable colors */));
}

scrp();
