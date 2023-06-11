const CrawlE = require('crawl-e/v0.5.1')

let crawlE = new CrawlE({
    cinemas: [
        {
            name: 'Kino Ebensee',
            address: 'Schulgasse 6, 4802 Ebensee',
            website: 'https://www.kino-ebensee.at/',
            phone: '0043 6133 6308'
        }
    ],
    showtimes: {
        url: ':cinema.website:/kinoprogramm.html',
        movies: {
            box: '.eventWrap',
            title: 'h2.eventHeader > a',
            showtimes: {
                box: '.spieltermine > .date.single',
                datetime: box => box.text().replace(' Uhr', '').trim(),
                datetimeLocale: 'de',
                datetimeFormat: 'dd, DD.MM.YY HH:mm',
            },
            attributes: '.genre span',
        }
    }
})
crawlE.crawl()