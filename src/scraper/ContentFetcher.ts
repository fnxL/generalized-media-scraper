import axios from 'axios';
import { chromium } from 'playwright';

class ContentFetcher {
    constructor() {}

    public async fetchHTMLContent(url: string, usePlaywright: boolean = false) {
        if (usePlaywright) {
            return this.fetchPlaywright(url);
        }
        return this.httpFetch(url);
    }

    private async fetchPlaywright(url: string) {
        const browser = await chromium.launch({
            headless: false,
        });
        console.log('Fetching using playwright...');
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForLoadState('networkidle');
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
