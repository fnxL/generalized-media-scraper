import path from 'path';
import NodeDownloader from 'nodejs-file-downloader';
import { ScraperOpts } from 'src/scraper/scraper.service';

class Downloader {
    private opts: ScraperOpts;
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
            onProgress: function (percentage, chunk, remainingSize) {
                //Gets called with each chunk.
                console.log('% ', percentage);
                console.log('Current chunk of data: ', chunk);
                console.log('Remaining bytes: ', remainingSize);
            },
            maxAttempts: this.opts.maxRetries,
        });

        try {
            // Download the file
            const { filePath, downloadStatus } = await downloader.download();
            const downloadPath = path.join(dir, fileName!);
            return downloadPath;
        } catch (error) {
            //If all attempts fail, the last error is thrown.
            console.log('Failed to download file. Aborting');
            throw error;
        }
    }
}

export default Downloader;
