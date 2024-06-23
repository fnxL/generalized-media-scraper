import BaseScraper, { Selectors } from '../BaseScraper';
import { ScraperOpts } from '../scraper.service';

const selectors: Selectors = {
    papers: {
        listItem: 'dt',
        data: {
            title: {
                selector: 'dd',
                nextSelector: '.list-title',
                convert: (value: string) => {
                    return value.split(':')[1].trim();
                },
            },
            author: {
                selector: 'dd',
                nextSelector: '.list-authors',
            },
            subjects: {
                selector: 'dd',
                nextSelector: '.list-subjects',
                convert: (value: string) => {
                    return value.split(':')[1].trim();
                },
            },
            pdf: {
                selector: 'a[title="Download PDF"]',
                attribute: 'href',
                convert: (value: string) => `https://arxiv.org${value}`,
                download: true,
            },
        },
    },
};

class ArxivScraper extends BaseScraper {
    constructor(opts: ScraperOpts) {
        super({ ...opts, folderName: 'arxiv' });
    }

    async scrape(
        url: string,
        folder: string = '',
        selector: Selectors = selectors,
    ) {
        return this._scrape(url, selector, folder);
    }
}

export default ArxivScraper;
