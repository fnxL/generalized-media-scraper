import { Selectors } from '../BaseScraper';

const arxivSelectors: Selectors = {
    papers: {
        listItem: 'dt',
        data: {
            title: {
                selector: 'dd',
                nextSelector: '.list-title',
                convert: (value: string) => {
                    return value.split(':')[1].trim();
                },
            },
            author: {
                selector: 'dd',
                nextSelector: '.list-authors',
            },
            subjects: {
                selector: 'dd',
                nextSelector: '.list-subjects',
                convert: (value: string) => {
                    return value.split(':')[1].trim();
                },
            },
            pdf: {
                selector: 'a[title="Download PDF"]',
                attribute: 'href',
                convert: (value: string) => `https://arxiv.org${value}`,
                download: true,
            },
        },
    },
};

export default arxivSelectors;
