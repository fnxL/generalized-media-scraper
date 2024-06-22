import axios from 'axios';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { ScraperOpts } from '../scraper.service';
import { validateUrl } from '@utils';

interface AttributeSelector {
    selector: string;
    attribute: string;
    convert?: (value: string) => void;
    download?: boolean;
    mediaType?: 'image' | 'video' | 'audio' | 'pdf' | 'gif';
}

interface ListItem {
    listItem: string;
    data: {
        [key: string]: string | undefined | AttributeSelector;
    };
}

export interface Selectors {
    [key: string]: ListItem;
}

// Type guard to check if an object conforms to RootSelector
function isAttributeSelector(obj: any): obj is AttributeSelector {
    return (
        'selector' in obj &&
        'attribute' in obj &&
        typeof obj.selector === 'string' &&
        typeof obj.attribute === 'string'
    );
}

class BaseScraper {
    opts: ScraperOpts;
    constructor(opts: ScraperOpts) {
        this.opts = opts;
    }

    async fetchHTMLContent(url: string) {
        return this.opts.useHeadLessBrowser
            ? await this.fetchHeadless(url)
            : await this.httpFetch(url);
    }

    async _scrape(url: string, selectors: Selectors) {
        validateUrl(url);
        const html = await this.fetchHTMLContent(url);
        const data: any = {};
        for (const [key, value] of Object.entries(selectors)) {
            const keyData: any = [];
            const $ = cheerio.load(html);
            const elements = $(value.listItem);

            elements.each((index, element) => {
                const listData: any = {};
                for (const [prop, propValue] of Object.entries(value.data)) {
                    if (isAttributeSelector(propValue)) {
                        if (propValue.convert) {
                            const value = $(element)
                                .find(propValue.selector)
                                .attr(propValue.attribute);

                            if (!value) continue;
                            listData[prop] = propValue.convert(value);
                            continue;
                        }
                        listData[prop] = $(element)
                            .find(propValue.selector)
                            .attr(propValue.attribute);
                        continue;
                    }

                    if (typeof propValue === 'string') {
                        listData[prop] = $(element).find(propValue).text();
                        continue;
                    }
                }
                keyData.push(listData);
            });
            data[key] = keyData;
        }
        return data;
    }

    async fetchHeadless(url: string) {
        const browser = await chromium.launch({
            headless: false,
        });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForLoadState('domcontentloaded');
        const html = await page.content();
        await page.close();
        await browser.close();
        return html;
    }

    async httpFetch(url: string) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
}

export default BaseScraper;
