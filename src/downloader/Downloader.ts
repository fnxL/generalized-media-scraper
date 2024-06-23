import path from 'path';
import NodeDownloader from 'nodejs-file-downloader';
import { ScraperOpts } from 'src/scraper/scraper.service';

class Downloader {
    private opts: ScraperOpts;
    constructor(opts: ScraperOpts) {
        this.opts = opts;
    }

    private async downloadHLS(url: string, dir: string) {
        // TODO: Implement HLS download
        console.log('Dowloading HLS playlist not implemented yet');
    }

    private async downloadFile(url: string, dir: string) {
        let fileName = '';
        let fileSize = 0; // in bytes
        let mimeType = '';
        const downloader = new NodeDownloader({
            url,
            directory: dir,
            cloneFiles: !this.opts.overwriteExistingFiles,
            onResponse: response => {
                mimeType = response.headers['content-type'] || '';
                fileSize = parseInt(response.headers['content-length'] || '0');
            },
            onBeforeSave: deducedName => {
                fileName = deducedName;
            },
            onProgress: function (percentage, chunk, remainingSize) {
                //Gets called with each chunk.
                console.log(`Progress: ${percentage}%`);
                console.log('Remaining bytes: ', remainingSize);
            },
            maxAttempts: this.opts.maxRetries,
        });

        try {
            // Download the file
            const { filePath, downloadStatus } = await downloader.download();
            const downloadPath = path.join(dir, fileName!);
            const data = {
                downloadPath,
                fileName,
                fileSize,
                mimeType,
            };
            return data;
        } catch (error) {
            //If all attempts fail, the last error is thrown.
            console.log('Failed to download file. Aborting');
            throw error;
        }
    }

    async download(url: string) {
        const dir = path.join(this.opts.downloadPath, this.opts.folderName);

        if (url.includes('.m3u8')) {
            return this.downloadHLS(url, dir);
        }

        return this.downloadFile(url, dir);
    }
}

export default Downloader;
