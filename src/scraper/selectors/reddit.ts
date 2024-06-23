import { Selectors } from '../BaseScraper';

const redditSelectors: Selectors = {
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
        },
    },
};

export default redditSelectors;
