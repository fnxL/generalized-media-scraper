import util from 'util';
import ScraperService from './scraper/scraper.service';

(async () => {
    const scraper = new ScraperService({
        usePlaywright: true,
        downloadPath: './downloads',
        folderName: 'reddit',
    }).getScraper();

    const data = await scraper.scrape(
        'https://www.reddit.com/r/interestingasfuck/',
        'interestingasfuck',
        {
            posts: {
                listItem: 'article',
                data: {
                    title: {
                        selector: 'shreddit-post',
                        attribute: 'post-title',
                    },
                    image: {
                        selector: '[role=presentation]',
                        attribute: 'src',
                    },
                    video: {
                        selector: 'shreddit-player',
                        attribute: 'src',
                        download: true,
                    },
                },
            },
        },
    );
    console.log(util.inspect(data, false, null, true /* enable colors */));
})();
