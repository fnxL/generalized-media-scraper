import config from '@config';
import DefaultScraper from './DefaultScraper';

export interface UserScraperOpts {
    downloadPath?: string; // Path to download the files
    folderName?: string; // Folder name to store the files
    maxRetries?: number;
    usePlaywright?: boolean;
    overwriteExistingFiles?: boolean;
    delay?: number[];
}

export type ScraperOpts = Required<UserScraperOpts>;

class ScraperService {
    private readonly opts: ScraperOpts;

    constructor(opts: UserScraperOpts) {
        this.opts = this.createScraperOpts(opts);
    }

    private createScraperOpts(opts: UserScraperOpts): ScraperOpts {
        return {
            maxRetries: opts.maxRetries || config.get('scraper.maxRetries'),
            downloadPath:
                opts.downloadPath || config.get('scraper.downloadPath'),
            usePlaywright:
                opts.usePlaywright || config.get('scraper.usePlaywright'),
            overwriteExistingFiles:
                opts.overwriteExistingFiles ||
                config.get('scraper.overwriteExistingFiles'),
            folderName: opts.folderName || config.get('scraper.folderName'),
            delay: opts.delay || config.get('scraper.delay'),
        };
    }

    getScraper() {
        return new DefaultScraper(this.opts);
    }
}

export default ScraperService;
