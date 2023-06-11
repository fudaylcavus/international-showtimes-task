const CrawlE = require('crawl-e/v0.5.1')

let crawlE = new CrawlE({
    cinemas: {
        list: {
            url: 'https://spotlightcinemas.com/corporate/',
            box: '.dropdown-item:not(.disabled):not(*[href="/corporate"])',
            website: {
                selector: ':box',
                attribute: 'href',
                mapper: href => `http://spotlightcinemas.com${href}`
            },
            slug: {
                selector: ':box',
                attribute: 'href',
                mapper: href => href.replace('/', '')
            }
        },
        details: {
            url: ':cinema.website:',
            address: {
                selector: 'footer .nav-item h5',
                attribute: 'ownText()',
                mapper: value => value.trim()
            }
        }
    },
    showtimes: {
        url: ':cinema.website:/index.php?date=:date:',
        urlDateFormat: 'YYYYMMDD',
        movies: {
            box: '.card',
            title: '.card-title',
            attributes: {
                selector: '.card-text',
                mapper: text => text.split('|').map(attr => attr.trim())
            },
            showtimes: {
                box: '.buy-ticket',
                time: box => {
                    return box.text().match(/\d:\d{2}/g)[0] + ' PM'
                },
                timeFormat: 'h:mm A',
                timeLocale: 'en-US',
                is3d: box => box.text().match(/3D/gi) !== null
            }
        }
    }
})
crawlE.crawl()