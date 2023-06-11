const CrawlE = require('crawl-e/v0.5.1')

let crawlE = new CrawlE({
    cinemas: [
        {
            name: 'TCL Chinese Theatres',
            address: '6925 Hollywood Blvd, Hollywood, CA 90028',
            website: 'http://www.tclchinesetheatres.com/',
            phone: '+49 3987 551063'
        }
    ],
    showtimes: {
        url: 'https://tickets.tclchinesetheatres.com/Browsing/Cinemas/Details/0001',
        movies: {
            box: '.film-item',
            title: 'h3.film-title',
            showtimes: {
                box: '.session-times time',
                datetime: '@datetime',
                datetimeFormat: 'YYYY-MM-DDTHH:mm:ss',
                datetimeLocale: 'en-US',
            },
          
        }
    }
})
crawlE.crawl()

