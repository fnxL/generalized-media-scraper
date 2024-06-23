import util from 'util';
import ScraperService from './scraper/scraper.service';
import ArxivScraper from './scraper/sites/ArxivScraper';

async function scrp() {
    const scraper = new ScraperService({
        useHeadLessBrowser: false,
        downloadPath: './downloads',
    }).getScraper(ArxivScraper);

    const data = await scraper.scrape(
        'https://arxiv.org/list/math.RA/recent',
        'math',
    );
    console.log(util.inspect(data, false, null, true /* enable colors */));
}

scrp();
