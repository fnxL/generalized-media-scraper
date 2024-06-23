import axios from 'axios';
import { chromium } from 'playwright';

class ContentFetcher {
    constructor() {}

    public async fetchHTMLContent(url: string, headless: boolean = false) {
        if (headless) {
            return this.fetchHeadless(url);
        }
        return this.httpFetch(url);
    }

    private async fetchHeadless(url: string) {
        const browser = await chromium.launch({
            headless: false,
        });
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForLoadState('domcontentloaded');
        const html = await page.content();
        await page.close();
        await browser.close();
        return html;
    }

    private async httpFetch(url: string) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

export default ContentFetcher;
