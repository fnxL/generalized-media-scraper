import config from '@config';
import BaseScraper from './BaseScraper';

export interface UserScraperOpts {
    downloadPath?: string; // Path to download the files
    folderName?: string; // Folder name to store the files
    connections?: number;
    maxRetries?: number;
    useHeadLessBrowser?: boolean;
    overwriteExistingFiles?: boolean;
}

export type ScraperOpts = Required<UserScraperOpts>;

class ScraperService {
    private readonly opts: ScraperOpts;

    constructor(opts: UserScraperOpts) {
        this.opts = this.createScraperOpts(opts);
    }

    private createScraperOpts(opts: UserScraperOpts): ScraperOpts {
        return {
            connections: opts.connections || config.get('scraper.connections'),
            maxRetries: opts.maxRetries || config.get('scraper.maxRetries'),
            downloadPath:
                opts.downloadPath || config.get('scraper.downloadPath'),
            useHeadLessBrowser:
                opts.useHeadLessBrowser ||
                config.get('scraper.useHeadlessBrowser'),
            overwriteExistingFiles:
                opts.overwriteExistingFiles ||
                config.get('scraper.overwriteExistingFiles'),
            folderName: opts.folderName || config.get('scraper.folderName'),
        };
    }

    getScraper<T extends BaseScraper>(
        ScraperClass: new (opts: ScraperOpts) => T,
    ): T {
        return new ScraperClass(this.opts);
    }
}

export default ScraperService;
