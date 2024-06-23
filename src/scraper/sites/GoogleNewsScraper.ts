import BaseScraper, { Selectors } from '../BaseScraper';
import { ScraperOpts } from '../scraper.service';

const selectors: Selectors = {
    articles: {
        listItem: 'article',
        data: {
            title: 'a[data-n-tid=29]',
            articleLink: {
                selector: 'a',
                attribute: 'href',
                convert: (href: string) =>
                    `https://news.google.com${href.slice(1)}`,
            },
            image: {
                selector: 'figure > img',
                attribute: 'src',
                convert: (src: string) => `https://news.google.com${src}`,
                download: true,
            },
        },
    },
};

class GoogleNewsScraper extends BaseScraper {
    constructor(opts: ScraperOpts) {
        super({ ...opts, folderName: 'theplace-2.com' });
    }

    async scrape(
        url: string,
        modelFolder: string = '',
        selector: Selectors = selectors,
    ) {
        return this._scrape(url, selector, modelFolder);
    }
}

export { GoogleNewsScraper };
