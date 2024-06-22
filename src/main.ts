import ScraperService from './scraper/scraper.service';
import { RedditScraper } from './scraper/sites/RedditScraper';

async function scrp() {
    const scraper = new ScraperService({
        useHeadLessBrowser: false,
        downloadPath: './downloads',
        folderName: 'reddit',
    }).getScraper(RedditScraper);

    const data = await scraper.scrape('https://new.reddit.com');
    console.log(data);
}

scrp();
