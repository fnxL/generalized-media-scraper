import path from 'path';
import NodeDownloader from 'nodejs-file-downloader';
import { ScraperOpts } from 'src/scraper/scraper.service';

class Downloader {
    opts: ScraperOpts;
    constructor(opts: ScraperOpts) {
        this.opts = opts;
    }

    async download(url: string) {
        const dir = path.join(this.opts.downloadPath, this.opts.folderName);

        let fileName: string;
        const downloader = new NodeDownloader({
            url,
            directory: dir,
            cloneFiles: !this.opts.overwriteExistingFiles,
            onBeforeSave: deducedName => {
                fileName = deducedName;
            },
            maxAttempts: this.opts.maxRetries,
        });

        try {
            // Download the file
            const { filePath, downloadStatus } = await downloader.download();
            const downloadPath = path.join(dir, fileName!);
            return downloadPath;
        } catch (error) {
            console.log(error);
        }
    }
}

export default Downloader;
