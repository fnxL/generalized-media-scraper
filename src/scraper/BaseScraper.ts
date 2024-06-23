import * as cheerio from 'cheerio';
import { ScraperOpts } from './scraper.service';
import { validateUrl } from '@utils';
import ContentFetcher from './ContentFetcher';
import Downloader from '../downloader/Downloader';

interface AttributeSelector {
    selector: string;
    attribute: string;
    convert?: (value: string) => string;
    download?: boolean;
    mediaType?: 'image' | 'video' | 'audio' | 'pdf' | 'gif';
}

interface ListItem {
    listItem: string;
    data: {
        [key: string]: string | AttributeSelector;
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
        this.contentFetcher = contentFetcher || new ContentFetcher();
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
        const html = await this.contentFetcher.fetchHTMLContent(url);
        const $ = cheerio.load(html);
        const data: any = {};
        for (const [key, value] of Object.entries(selectors)) {
            data[key] = await this.processSelector($, value);
        }
        return data;
    }

    private processSelector($: cheerio.CheerioAPI, list: ListItem) {
        const keyData: any = [];
        const elements = $(list.listItem);
        elements.each((index, element) => {
            const data = this.extractDataFromListItem($, element, list);
            keyData.push(data);
        });

        return Promise.all(keyData);
    }

    private async extractDataFromListItem(
        $: cheerio.CheerioAPI,
        element: cheerio.AnyNode,
        { data }: ListItem,
    ) {
        const elementData: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                elementData[key] = $(element).find(value).text();
            } else {
                elementData[key] = await this.extractAttribute(
                    $,
                    element,
                    value,
                );
            }
        }
        return elementData;
    }

    private async extractAttribute(
        $: cheerio.CheerioAPI,
        element: cheerio.AnyNode,
        value: AttributeSelector,
    ) {
        const attrVal = $(element).find(value.selector).attr(value.attribute);
        if (!attrVal) return;

        // TODO Handle Downloading media
        const convertedValue = value.convert ? value.convert(attrVal) : attrVal;
        if (value.download) {
            const file = await this.downloader.download(convertedValue);
            if (!file) return;
            const { downloadPath, fileName, fileSize, mimeType } = file;
            const data = {
                originalUrl: convertedValue,
                filePath: downloadPath,
                fileName,
                size: fileSize,
                mimeType,
            };
            return data;
        }
        return convertedValue;
    }
}

export default BaseScraper;
