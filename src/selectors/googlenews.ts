import { Selectors } from '../scraper/BaseScraper';
import { ScraperOpts } from '../scraper/scraper.service';

const googleNewsSelectors: Selectors = {
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

export default googleNewsSelectors;
