# Generalized Media Scraper

- [Generalized Media Scraper](#generalized-media-scraper)
  - [Installing and running locally](#installing-and-running-locally)
  - [Selectors](#selectors)
  - [Usage](#usage)
    - [Creating scraper class for each site](#creating-scraper-class-for-each-site)
      - [Using the scraper](#using-the-scraper)
    - [Using the scraper directly without defining a site](#using-the-scraper-directly-without-defining-a-site)
    - [Using some of the inbuilt provided scrapers](#using-some-of-the-inbuilt-provided-scrapers)
      - [Reddit Scraper](#reddit-scraper)
      - [Google News scraper](#google-news-scraper)
      - [ArxivScraper](#arxivscraper)
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

You need to define a selector object which defines the structure of the data that you want to scrape.

```js
{
    posts: {
        listItem: 'article', // selector for posts
        data: { // define the data that you want to receive for each post
            postTitle: ".post-title", // providing a selector directly will resolve to text content
            postImage: {
                selector: ".post-image",
                attribute: "src",
                convert: (value: string) => `http://example.com/${value}` 
                // you can transform values by specifying a 
                // call back  function which returns a string.
                download: true, // specify download: true to download the media
            },
            postTags: {
                listItems: ".tags span" // You can provide nested listItems like this
            },
            video: { // select videos to download
                selector: "video",
                attribute: "src",
                download: true,
            },
            postAuthors: {
                selector: "dd",
                nextSelector: ".post-author"
                /* This will select a single 'dd' element 
                   which is just next to 'article', and will
                   return text from elements that are descendants of 'dd'
                   and have '.post-author' class
                */
            },
            pdf: {
                selector: 'dd',
                nextSelector: {
                    selector: 'a[data="Download PDF"]'
                    attribute: 'href'
                }
                /* This will select a single 'dd' element 
                   which is just next to the root listItem 'article', 
                   and will attribute value of href of anchor elements 
                   that are descendats of 'dd' that have 
                   data attribute="Download PDF" 
                */
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
            image: {
                selector: '[role=presentation]',
                attribute: 'src',
                download: true,
            },
            postContent: 'div[data-post-click-location=text-body]'
        },
    },
};
```

- Create a scraper class that extends the `BaseScraper`.
- Define the `folderName` in which you want the media to be saved and define a scrape method as below
- Finally export the class
  
```js
class RedditScrapper extends BaseScraper {
    constructor(opts: ScraperOpts) {
        super({ ...opts, folderName: 'reddit' });
        // you need to define the folderName in which the media will be saved
    }
    // you need to implement scrape method which calls _scrape method of BaseScraper and pass the selectors object that you defined earlier.
    
    // also accept parameter for folder, this will create a new folder inside the downloadPath for each URL
    async scrape(url: string, folder: string = '', selector: Selectors = selectors) {
        return this._scrape(url, selector, folder);
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
        usePlaywright: true,
        maxRetires: 10
    }).getScraper(RedditScraper)

    const data = await scraper.scrape("https://new.reddit.com/")
 // const data = await scraper.scrape("http://reddit.com/r/mkindia", "mkindia") 
    /* 
    you can scrape posts from any subreddit, 
    optionally provide a foldername 
    for this subreddit to store 
    files in that folder 
    */

    console.log(data) // Maybe save this data into a file or db
// Your resulting data would look like this.
/*
{
  posts: [
    {
      title: 'Episode discussion post for today - Episode 26',
      postLink: 'https://reddit.com/r/splitsvillaMTV/comments/1dmk7tl/episode_discussion_post_for_today_episode_26/',
      commentCount: '942',
      subReddit: 'r/splitsvillaMTV',
      author: 'Nervous_Dust_1178',
      image: undefined, // if no image exists for the post, it would return undefined
      postContent: ''// post content if any
    },
    {
      title: 'Post Match Thread: Afghanistan vs Australia',
      postLink: 'https://reddit.com/r/Cricket/comments/1dmdie6/post_match_thread_afghanistan_vs_australia/',
      commentCount: '772',
      subReddit: 'r/Cricket',
      author: 'CricketMatchBot',
      image: undefined,
      postContent: '' 
    },
    {
      title: 'Zaheer and Sonakshi’s wedding pics',
      postLink: 'https://reddit.com/r/BollyBlindsNGossip/comments/1dmnc9j/zaheer_and_sonakshis_wedding_pics/',
      commentCount: '112',
      subReddit: 'r/BollyBlindsNGossip',
      author: 'Just_Gift_619',
      image: {
        originalUrl: 'https://preview.redd.it/zaheer-and-sonakshis-wedding-pics-v0-xnj93t6xzb8d1.jpg?width=640&crop=smart&auto=webp&s=cc7e034fc13e8a8d9f05f9b0e6ecf222f41bd15c',
        filePath: 'downloads\\reddit\\zaheer-and-sonakshis-wedding-pics-v0-xnj93t6xzb8d1.jpg',
        fileName: 'zaheer-and-sonakshis-wedding-pics-v0-xnj93t6xzb8d1.jpg',
        size: 73635,
        mimeType: 'image/jpeg'
      },
      postContent: ''
    }
  ]
}
*/

})()
```

### Using the scraper directly without defining a site

It is possible to simply use the scraper without creating scraper classes, but you must provide the selectors when calling the scrape method.

```js
import ScraperService from './scraper/sites'

(async () => {
    const scraper = new ScraperService({
        usePlaywright: false, // use playwright browser for pages that need rendering
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

### Using some of the inbuilt provided scrapers 

#### Reddit Scraper

Use playwright if you want to scrape more content.

Should be able to scrape posts from any subreddit(s)

```js
import RedditScraper from './scraper/sites/RedditScraper';

(async () => {
    const scraper = new ScraperService({
        usePlaywright: true,
        downloadPath: './downloads',
    }).getScraper(RedditScraper);

    const data = await scraper.scrape(
        'https://reddit.com/r/programming',
        'programming',
    );
    const data2 = await scraper.scrape(
        'https://reddit.com/r/mkindia',
        'mkindia',
    );

    // save your data to a file or database
})();
```

#### Google News scraper

```js
import GoogleNewsScraper from './scraper/sites/GoogleNewsScraper';

(async () => {
    const scraper = new ScraperService({
        downloadPath: './downloads',
    }).getScraper(GoogleNewsScraper);

    const data = await scraper.scrape(
        'https://news.google.com/',
        'home',
    ); // fetch all articles from home page
    const data2 = await scraper.scrape(
        'https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen',
        'technology',
    ); // fetch all articles from technology topic page

    // save your data to a file or database
})();
```

#### ArxivScraper

You should link to the arxiv page which have list of entries, for eg: https://arxiv.org/list/math/new or https://arxiv.org/list/hep-ex/2024-01



```js
import ArxivScraper from './scraper/sites/ArxivScraper';

(async () => {
    const scraper = new ScraperService({
        downloadPath: './downloads',
    }).getScraper(ArxivScraper);

    const data = await scraper.scrape(
        'https://arxiv.org/list/math.RA/recent',
        'Math RA',
    ); // fetch all papers from recent page of Math RA

    // save your data to a file or database

    const data2 = await scraper.scrape(
        "https://arxiv.org/list/math/2024-04",
        "Math 2024-04"
    ); // fetch all papers from April 2024 (only from the first page)
})();
```

## Scraper Options

You can configure these defaults in `config/development.json` or `config/production.json`

`downloadPath` | Default: `./downloads'` - Root path to download all media files from different sites

`folderName` | Default: `default` - Folder name to store individual media files

`connections` | Default: `10` - Number of connections to make while downloading a file

`maxRetries` | Default: `5` - Maximum retires before the file download is aborted

`usePlaywright` | Default: `false` - Will playwright chromium to render the html content. Defaults to false, which uses html returned by HttpRequest

`overwriteExistingFiles` | Default: `false`

## TODO

- Handle downloading .m3u8 playlists
- Maybe provide a way to scrape nested listItems?
- Logging
- Introduce random delay before each retry

## Libraries used

- axios 
- cheerio - html5 compliant parser and query
- convict - config management
- tsc-alias - for resolving import path aliases after build
- playwright - headless chromium browser to get html for pages that need to be rendered
