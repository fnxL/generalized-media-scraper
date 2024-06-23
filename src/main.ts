import util from 'util';
import ScraperService from './scraper/scraper.service';
import redditSelectors from './selectors/reddit';

(async () => {
    const scraper = new ScraperService({
        usePlaywright: true,
        downloadPath: './downloads',
        folderName: 'reddit',
    }).getScraper();

    const data = await scraper.scrape(
        'https://www.reddit.com/r/popular/',
        'popular',
        redditSelectors,
    );
    console.log(util.inspect(data, false, null, true /* enable colors */));
})();
