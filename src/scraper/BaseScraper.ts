import * as cheerio from 'cheerio';
import { ScraperOpts } from './scraper.service';
import { validateUrl } from '@utils';
import ContentFetcher from './ContentFetcher';
import Downloader from '../downloader/Downloader';

interface Common {
    convert?: (value: string) => string | string[];
    download?: boolean;
}

interface AttributeSelector extends Common {
    selector: string;
    attribute: string;
}

interface NextSelector extends Common {
    selector: string;
    nextSelector: string | AttributeSelector;
}

interface ListItem {
    listItem: string;
    data?: {
        [key: string]: string | AttributeSelector | NextSelector | ListItem;
    };
}

export interface Selectors {
    [key: string]: ListItem;
}

class BaseScraper {
    private opts: ScraperOpts;
    protected contentFetcher: ContentFetcher;
    private downloader: Downloader;
    private defaultFolder: string;

    constructor(
        opts: ScraperOpts,
        contentFetcher?: ContentFetcher,
        downloader?: Downloader,
    ) {
        this.opts = opts;
        this.contentFetcher =
            contentFetcher ||
            new ContentFetcher(this.opts.maxRetries, this.opts.delay);
        this.downloader = downloader || new Downloader(opts);
        this.defaultFolder = this.opts.folderName;
    }

    protected async _scrape(
        url: string,
        selectors: Selectors,
        folderName?: string,
    ) {
        // set a new nested folder name if provided
        if (folderName)
            this.opts.folderName = `${this.opts.folderName}/${folderName}`;
        else this.opts.folderName = this.defaultFolder;

        validateUrl(url);
        const html = await this.contentFetcher.fetchHTMLContent(
            url,
            this.opts.usePlaywright,
        );
        const $ = cheerio.load(html);
        const data: any = {};
        for (const [key, value] of Object.entries(selectors)) {
            data[key] = await this.processSelector($, value);
        }
        return data;
    }

    private processSelector(
        $: cheerio.CheerioAPI,
        list: ListItem,
        element?: cheerio.AnyNode,
    ) {
        const keyData: any = [];
        const elements = element
            ? $(element).find(list.listItem)
            : $(list.listItem);
        elements.each((index, element) => {
            const data = this.extractDataFromListItem($, element, list);
            keyData.push(data);
        });

        return Promise.all(keyData);
    }

    private async extractDataFromListItem(
        $: cheerio.CheerioAPI,
        element: cheerio.AnyNode,
        list: ListItem,
    ) {
        if (!list.data) {
            // listItem has no data to extract, so just select the text
            return $(element).find(list.listItem).text().trim();
        }

        const elementData: any = {};
        for (const [key, value] of Object.entries(list.data)) {
            if (typeof value === 'string') {
                elementData[key] = $(element).find(value).text().trim();
            } else if ('listItem' in value) {
                // Recursive call for nested list
                elementData[key] = await this.processSelector(
                    $,
                    value,
                    element,
                );
            } else {
                const data = await this.extractAttribute($, element, value);
                if (data) elementData[key] = data;
            }
        }
        return elementData;
    }

    private async extractAttribute(
        $: cheerio.CheerioAPI,
        element: cheerio.AnyNode,
        value: AttributeSelector | NextSelector,
    ) {
        if ('attribute' in value) {
            const attrVal = $(element)
                .find(value.selector)
                .attr(value.attribute);

            if (!attrVal) return;

            const convertedValue = value.convert
                ? value.convert(attrVal)
                : attrVal;

            if (value.download) {
                return this.handleDownload(convertedValue);
            }
            return convertedValue;
        }

        if ('nextSelector' in value) {
            // select immediate next element
            const nextElement = $(element).next();
            if (typeof value.nextSelector === 'string') {
                const val = $(nextElement)
                    .find(value.nextSelector)
                    .text()
                    .trim();
                if (!val) return;

                const convertedVal = value.convert ? value.convert(val) : val;

                if (value.download) {
                    return this.handleDownload(convertedVal);
                }

                return convertedVal;
            }

            const val = nextElement
                .find(value.nextSelector.selector)
                .attr(value.nextSelector.attribute);

            if (!val) return;

            const convertedVal = value.nextSelector.convert
                ? value.nextSelector.convert(val)
                : val;

            if (value.nextSelector.download) {
                return this.handleDownload(convertedVal);
            }
            return convertedVal;
        }

        return;
    }

    private async handleDownload(url: string | string[]) {
        if (typeof url === 'string') {
            const file = await this.downloader.download(url);
            if (!file) return;
            const { downloadPath, fileName, fileSize, mimeType } = file;
            const data = {
                originalUrl: url,
                filePath: downloadPath,
                fileName,
                size: fileSize,
                mimeType,
            };
            return data;
        }
    }
}

export default BaseScraper;
