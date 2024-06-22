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
            doc: 'Maximum retires to try before aborting scraping',
            format: 'int',
            default: 3,
        },
        connections: {
            doc: 'Maximum number of connections to use while downloading a file',
            format: 'int',
            default: 5,
        },
        supportedSites: {
            doc: 'Array of supported sites',
            format: Array,
            default: ['reddit'],
        },
    },
});

export default config;
