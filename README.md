# Generalized Media Scraper

- [Generalized Media Scraper](#generalized-media-scraper)
  - [Installing and running locally](#installing-and-running-locally)
  - [Defining Selectors](#defining-selectors)
  - [Usage](#usage)
    - [Using the scraper](#using-the-scraper)
    - [Using provided selectors for popular sites](#using-provided-selectors-for-popular-sites)
      - [The Place 2](#the-place-2)
      - [Reddit](#reddit)
      - [Google News](#google-news)
      - [Arxiv](#arxiv)
  - [Scraper Options](#scraper-options)
  - [TODO](#todo)
  - [Libraries used](#libraries-used)


## Installing and running locally

```bash
git clone https://github.com/fnxL/generalized-media-scraper.git
pnpm install
pnpm start
```


## Defining Selectors

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
                // call back function which returns a string or an array
                download: true, // specify download: true to download the media
            },
            postTags: {
                listItems: ".tags span" // You can provide nested listItems like this
            },
            classList: {
                selector: 'shreddit-post',
                attribute: 'class',
                convert: (value: string) => value.split(' ')
            }, // will return an array of classList
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

### Using the scraper

```js
import util from 'util'
import ScraperService from './scraper/scraper.service';

(async () => {
    const scraper = new ScraperService({
        usePlaywright: true,
        downloadPath: './downloads',
        folderName: 'reddit'
    }).getScraper()

    const data = await scraper.scrape('https://reddit.com/r/popular', "popular", {
        posts: {
            listItem: 'article',
            data: {
                title: {
                    selector: 'shreddit-post',
                    attribute: 'post-title',
                },
                postLink: {
                    selector: 'shreddit-post',
                    attribute: 'permalink',
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
                image: {
                    selector: '[role=presentation]',
                    attribute: 'src',
                    download: true,
                },
                video: {
                    selector: 'shreddit-player',
                    attribute: 'src',
                    download: true,
                },
                postContent: 'div[data-post-click-location=text-body]',
            }
        }
    })
    console.log(util.inspect(data, false, null, true));
    // your data would look like this
/*
{
  posts: [
    {
      title: 'Episode discussion post for today - Episode 26',
      postLink: 'https://reddit.com/r/splitsvillaMTV/comments/1dmk7tl/episode_discussion_post_for_today_episode_26/',
      commentCount: '942',
      subReddit: 'r/splitsvillaMTV',
      author: 'Nervous_Dust_1178', 
      // no image property if the post does not have any image.
      postContent: ''// post content if any
    },
    {
      title: 'Post Match Thread: Afghanistan vs Australia',
      postLink: 'https://reddit.com/r/Cricket/comments/1dmdie6/post_match_thread_afghanistan_vs_australia/',
      commentCount: '772',
      subReddit: 'r/Cricket',
      author: 'CricketMatchBot',
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
### Using provided selectors for popular sites

#### The Place 2

You need to provide the model page to scrape photos.
Below example code will scrape 10 pages of images of Sydney Sweeney

```js
import util from 'util';
import ScraperService from './scraper/scraper.service';
import theplace2Selectors from './selectors/theplace2';
import delay from 'delay'

(async () => {
    const scraper = new ScraperService({
        usePlaywright: false,
        downloadPath: './downloads',
        folderName: 'theplace2',
    }).getScraper();

    for (let i = 1; i <= 10; i++) {
        // better to add delay of 1500 ms between each request
        await delay(1500)
        const data = await scraper.scrape(
            `https://theplace-2.com/photos/Sydney-Sweeney-md6824/page${i}/`,
            'Sydney Sweeny',
            theplace2Selectors,
        );
        console.log(util.inspect(data, false, null, true));
    }
})();
```

#### Reddit

Use playwright if you want to scrape more content.

Should be able to scrape posts from any subreddit(s)

```js
import ScraperService from './scraper/scraper.service';
import redditSelectors from './scraper/selectors/reddit';

(async () => {
    const scraper = new ScraperService({
        usePlaywright: true,
        downloadPath: './downloads',
        folderName: 'reddit'
    }).getScraper();

    const data = await scraper.scrape(
        'https://reddit.com/r/programming',
        'programming',
        redditSelectors
    );
    // media files will be stored in './downloads/reddit/programming/'
    const data2 = await scraper.scrape(
        'https://reddit.com/r/mkindia',
        'mkindia',
        redditSelectors
    );
    // media files will be stored in './downloads/reddit/mkindia/'
})();
```

#### Google News

```js
import googleNewsSelectors from './scraper/selectors/googlenews;

(async () => {
    const scraper = new ScraperService({
        usePlaywright: 'false',
        downloadPath: './downloads',
        folderName: 'googlenews'
    }).getScraper();

    const data = await scraper.scrape(
        'https://news.google.com/',
        'home',
        googleNewsSelectors
    ); // fetch all articles from home page
    const data2 = await scraper.scrape(
        'https://news.google.com/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-IN&gl=IN&ceid=IN%3Aen',
        'technology',
        googleNewsSelectors
    ); // fetch all articles from technology topic page
})();
```

#### Arxiv

You should link to the arxiv page which have list of entries, for eg: https://arxiv.org/list/math/new or https://arxiv.org/list/hep-ex/2024-01

```js
import arxivSelectors from './scraper/selectors/arxiv';

(async () => {
    const scraper = new ScraperService({
        usePlaywright: 'false',
        downloadPath: './downloads',
        folderName: 'arxiv'
    }).getScraper();

    const data = await scraper.scrape(
        'https://arxiv.org/list/math.RA/recent',
        'Math RA',
        arxivSelectors
    ); // fetch all papers from recent page of Math RA

    const data2 = await scraper.scrape(
        "https://arxiv.org/list/math/2024-04",
        "Math 2024-04",
        arxivSelectors
    ); // fetch all papers from April 2024 (only from the first page)
})();
```


## Scraper Options

You can configure these defaults in `config/development.json` or `config/production.json`

`downloadPath` | Default: `./downloads'` - Root path to download all media files from different sites

`folderName` | Default: `default` - Folder name to store individual media files

`maxRetries` | Default: `5` - Maximum retires before scraping & file download is terminated.

`usePlaywright` | Default: `false` - Will playwright chromium to render the html content. Defaults to false, which uses html returned by HttpRequest

`overwriteExistingFiles` | Default: `false`

`delay` | default: `[1000, 2000]` - Range of delay between each request in milliseconds

## TODO

- Handle downloading .m3u8 playlists
- ~~Maybe provide a way to scrape nested listItems?~~
- Logging
- Introduce random delay before each retry

## Libraries used

- axios 
- cheerio - html5 compliant parser and query
- convict - config management
- tsc-alias - for resolving import path aliases after build
- playwright - headless chromium browser to get html for pages that need to be rendered
