import BaseScraper from '../BaseScraper';
import { Selectors } from '../BaseScraper';
import { ScraperOpts } from '../scraper.service';

class DefaultScraper extends BaseScraper {
    constructor(opts: ScraperOpts) {
        super(opts);
    }

    async scrape(
        url: string,
        folder: string,
        selector: Selectors,
    ): Promise<any>;
    async scrape(url: string, selector: Selectors): Promise<any>;
    async scrape(url: string, arg2: string | Selectors, arg3?: Selectors) {
        let folder: string | undefined;
        let selector: Selectors;

        if (typeof arg2 === 'string') {
            folder = arg2;
            selector = arg3 as Selectors;
        } else {
            selector = arg2;
        }

        return this._scrape(url, selector, folder);
    }
}

export default DefaultScraper;
