import axios from 'axios';
import delay, { rangeDelay } from 'delay';
import { chromium } from 'playwright';

class ContentFetcher {
    private maxRetries: number;
    private delay: number[];
    constructor(maxRetries: number, delay: number[]) {
        this.maxRetries = maxRetries;
        this.delay = delay;
    }

    public async fetchHTMLContent(url: string, usePlaywright: boolean = false) {
        for (let attempts = 0; attempts < this.maxRetries; attempts++) {
            rangeDelay(this.delay[0], this.delay[1]);
            try {
                if (usePlaywright) {
                    return this.fetchPlaywright(url);
                }
                return this.httpFetch(url);
            } catch (error) {
                console.log(`Failed to fetch ${url}, retrying...`);
                if (attempts == this.maxRetries - 1) {
                    console.log(
                        `Failed to fetch ${url} after ${this.maxRetries} attempts`,
                    );
                    throw error;
                }
            }
        }
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
