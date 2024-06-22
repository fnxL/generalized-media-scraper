export function validateUrl(url: string) {
    if (!url) {
        throw new Error('URL is required');
    }

    if (!url.startsWith('http')) {
        throw new Error('Invalid URL - must start with http(s)://');
    }
}
