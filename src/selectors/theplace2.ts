import { Selectors } from '../scraper/BaseScraper';

function convertCacheToOriginalURL(value: string) {
    const url = value
        .replace('/cache', '')
        .replace('-gthumb-ghdata300', '')
        .replace('-gthumb-ghdata200', '');

    return `https://theplace-2.com${url}`;
}

const theplace2Selectors: Selectors = {
    photos: {
        listItem: '.pic-card',
        data: {
            likes: 'span[class="votes-wr"]',
            dimension: 'span[class="size-wr"]',
            image: {
                selector: 'img',
                attribute: 'src',
                convert: convertCacheToOriginalURL,
                download: true,
            },
        },
    },
};

export default theplace2Selectors;
