import BaseScraper from '../BaseScraper';
import { Selectors } from '../BaseScraper';
import { ScraperOpts } from '../scraper.service';

class DefaultScraper extends BaseScraper {
    constructor(opts: ScraperOpts) {
        super(opts);
    }

    async scrape(url: string, selector: Selectors) {
        return this._scrape(url, selector);
    }
}

export default DefaultScraper;
