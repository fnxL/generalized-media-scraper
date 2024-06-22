import convict from 'convict';

const config = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV',
    },
    port: {
        doc: 'The port to bind.',
        format: 'port',
        default: 8080,
        env: 'PORT',
        arg: 'port',
    },
    scraper: {
        maxRetries: {
            doc: 'Maximum retires before the file download is aborted',
            format: 'int',
            default: 5,
        },
        connections: {
            doc: 'Maximum number of connections to use while downloading a file',
            format: 'int',
            default: 10,
        },
        downloadPath: {
            doc: ' Root path to download all media files from different sites',
            format: String,
            default: './downloads',
        },
        folderName: {
            doc: 'Folder name to store individual media files',
            format: String,
            default: 'default',
        },
        useHeadlessBrowser: {
            doc: 'Use headless chromium browser to render the html and scrape',
            format: Boolean,
            default: false,
        },
        overwriteExistingFiles: {
            doc: 'Overwrite the existing files if the file already exists in the folder',
            format: Boolean,
            default: false,
        },
    },
});

export default config;
