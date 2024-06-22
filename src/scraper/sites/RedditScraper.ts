import BaseScraper from './BaseScraper';
import { Selectors } from './BaseScraper';
import { ScraperOpts } from '../scraper.service';

// Define selectors for your scraper
const selectors: Selectors = {
    articles: {
        listItem: 'article', // Selector for the list of items/elements
        data: {
            // Here you can define the data that you want to scrape.
            title: {
                selector: 'shreddit-post',
                attribute: 'post-title',
            },
            postLink: {
                selector: 'shreddit-post',
                attribute: 'permalink',
                // If you want to convert the value before saving it, you can define a convert call back function.
                convert: (value: string) => `https://reddit.com${value}`,
            },
            commentCount: {
                selector: 'shreddit-post',
                attribute: 'comment-count',
            },
            subReddit: {
                selector: 'shreddit-post',
                attribute: 'subreddit-prefixed-name',
            },
            author: {
                selector: 'shreddit-post',
                attribute: 'author',
            },
            // If you want to download the media, you can set download to true and must provide mediaType
            imageUrl: {
                selector: '[role=presentation]',
                attribute: 'src',
                download: true,
                mediaType: 'image',
            },
        },
    },
};

class RedditScraper extends BaseScraper {
    constructor(opts: ScraperOpts) {
        super({ ...opts, folderName: 'reddit' });
        // you need to define the folderName in which the media will be saved
    }

    // you need to call implement scrape method which calls _scrape method and pass the selectors
    async scrape(url: string, selector: Selectors = selectors) {
        return this._scrape(url, selector);
    }
}

// File name and ClassName should match. Should named export.
export { RedditScraper };
