import config from '@config';
import * as Sites from './sites/';
import { Scraper } from './sites/';
import { RedditScraper } from './sites/RedditScraper';

export interface UserScraperOpts {
    downloadPath?: string; // Path to download the files
    folderName?: string; // Folder name to store the files
    connections?: number;
    maxRetries?: number;
    useHeadLessBrowser?: boolean;
    overwriteExistingFiles?: boolean;
    mediaType?: ('image' | 'video' | 'audio' | 'pdf' | 'gif')[];
}

export type ScraperOpts = Required<UserScraperOpts>;

class ScraperService {
    private readonly opts: ScraperOpts;

    constructor(opts: UserScraperOpts) {
        this.opts = this.createScraperOpts(opts);
    }

    private createScraperOpts(opts: UserScraperOpts): ScraperOpts {
        return {
            connections: config.get('scraper.connections'),
            maxRetries: config.get('scraper.maxRetries'),
            downloadPath: opts.downloadPath ?? './downloads',
            useHeadLessBrowser: opts.useHeadLessBrowser ?? false,
            overwriteExistingFiles: opts.overwriteExistingFiles ?? false,
            folderName: opts.folderName ?? 'default',
            mediaType: opts.mediaType ?? ['image', 'video'],
        };
    }

    getScraper(ScraperClass: Scraper = Sites.DefaultScraper) {
        return new ScraperClass(this.opts);
    }
}

export default ScraperService;
