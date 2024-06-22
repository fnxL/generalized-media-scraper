# Generalized Media Scraper

- [Generalized Media Scraper](#generalized-media-scraper)
  - [Installing and running locally](#installing-and-running-locally)
  - [Selectors](#selectors)
  - [Usage](#usage)
    - [Creating scraper class for each site](#creating-scraper-class-for-each-site)
      - [Using the scraper](#using-the-scraper)
    - [Using the scraper directly without defining a site](#using-the-scraper-directly-without-defining-a-site)
  - [Scraper Options](#scraper-options)
  - [TODO](#todo)
  - [Libraries used](#libraries-used)


## Installing and running locally

```bash
git clone https://github.com/fnxL/generalized-media-scraper.git
pnpm install
pnpm start
```


## Selectors

The selector api is exactly the same as selectors in cheerio. Please refer [cheerio docs](https://cheerio.js.org/docs/basics/selecting) 

```js
{
    posts: {
        listItem: 'article', // selector for posts
        data: { // define the data that you want to receive for each post
            postTitle: ".post-title", // providing a selector directly will resolve to text content
            postImage: {
                selector: ".post-image",
                attribute: "src",
                download: true, // specify download: true to download the media
                mediaType: "image" // also specify the mediaType
            },
            articleTag: {
                attribute: "data-tag" // TODO only providing attribute should run the query on the root listItem / article node
            },
            video: {
                selector: "videoplayer",
                attribute: "src",
                download: true,
                mediaType: "video" // will handle all types of video downloading including m3u8 playlists.
            }
        }
    },
    articles: {
        listItem: '[role=article]', // maybe select all those nodes which have attribute role=article
        data: {
            // again you can define any type of data you want 
            articleNumber: ".article-number"
        }
    }
}
```

## Usage

### Creating scraper class for each site

Create a new file in the sites folder and define your selectors. For this example, we are going to scrape Reddit posts from http://new.reddit.com along with images and videos

```js
import { Selectors } from './BaseScraper';

// Define selectors for your scraper
const selectors: Selectors = {
    posts: {
        listItem: 'article', // Selector for the list of items/elements
        data: {
            // Here you can define the data that you want to scrape.
            title: {
                selector: 'shreddit-post',
                attribute: 'post-title',
            },
            postLink: {
                selector: 'shreddit-post',
                attribute: 'permalink',
                // If you want to convert the value before saving it, you can define a convert call back function.
                convert: (value: string) => `https://reddit.com${value}`,
            },
            commentCount: {
                selector: 'shreddit-post',
                attribute: 'comment-count',
            },
            subReddit: {
                selector: 'shreddit-post',
                attribute: 'subreddit-prefixed-name',
            },
            author: {
                selector: 'shreddit-post',
                attribute: 'author',
            },
            // If you want to download the media, you can set download to true and must provide mediaType
            imageUrl: {
                selector: '[role=presentation]',
                attribute: 'src',
                download: true,
                mediaType: 'image',
            },
        },
    },
};
```

- Create a scraper class that extends the `BaseScraper` and matches the filename
- Define the `folderName` in which you want the media to be saved and define a scrape method as below
- Finally export the class
  
```js
class RedditScrapper extends BaseScraper {
    constructor(opts: ScraperOpts) {
        super({ ...opts, folderName: 'reddit' });
        // you need to define the folderName in which the media will be saved
    }
    // you need to implement scrape method which calls _scrape method of BaseScraper and pass the selectors object that you defined earlier.
    async scrape(url: string, selector: Selectors = selectors) {
        return this._scrape(url, selector);
    }
}

export { RedditScrapper };
```
#### Using the scraper

```js
import ScraperService from './scraper/sites'
import {RedditScraper} from './scraper/sites/RedditScraper'

(async () => {
    const scraper = new ScraperService({
        useHeadLessBrowser: false,
        maxRetires: 10
    }).getScraper(RedditScraper)

    const data = await scraper.scrape("https://new.reddit.com/")

    console.log(data) // Maybe save the data into a file or db
})()
```

### Using the scraper directly without defining a site

It is possible to simply use the scraper without creating scraper classes, but you must provide the selectors when calling the scrape method.

```js
import ScraperService from './scraper/sites'

(async () => {
    const scraper = new ScraperService({
        useHeadLessBrowser: false, // use headless browser for pages that need rendering
        downloadPath: './downloads',
        folderName: 'example.com', // the media files will be stored in downloads/example.com folder
        maxRetires: 10,
    }).getScraper()

    const data = scraper.scrape("https://example.com", {
        posts: {
            listItem: 'article', // selector for posts
            data: { // define the data that you want to receive for each post
                postTitle: ".post-title", // providing a selector directly will resolve to text content
                postImage: {
                    selector: ".post-image",
                    attribute: "src",
                    download: true,
                    mediaType: "image"
                },
                articleTag: {
                    attribute: "data-tag" // TODO only providing attribute should run the query on the root listItem / article node
                },
                video: {
                    selector: "videoplayer",
                    attribute: "src",
                    download: true,
                    mediaType: "video" // will handle all types of video downloading including m3u8 playlists.
                }
            }
        }
    })
})()
```

## Scraper Options

You can configure these defaults in `config/development.json` or `config/production.json`

`downloadPath` | Default: `./downloads'` - Root path to download all media files from different sites

`folderName` | Default: `default` - Folder name to store individual media files

`connections` | Default: `10` - Number of connections to make while downloading a file

`maxRetries` | Default: `5` - Maximum retires before the file download is aborted

`useHeadLessBrowser` | Default: `false` - Will use headless chromium browser to render the html content. Defaults to false, which uses html returned by HttpRequest

`overwriteExistingFiles` | Default: `false`

## TODO

- Handle downloading different media types
- Maybe provide a way to do nested listItems?
- Logging
- Retry scraping based on maxRetries
- Introduce random delay before each retry

## Libraries used

- axios 
- cheerio - html5 compliant parser and query
- convict - config management
- tsc-alias - for resolving import path aliases after build
- playwright - headless chromium browser to get html for pages that need to be rendered
