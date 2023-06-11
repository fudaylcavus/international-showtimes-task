const CrawlE = require('crawl-e/v0.5.1')

let crawlE = new CrawlE({
    cinemas: [
        {
            name: 'Multikulturelles Centrum Templin',
            address: 'Prenzlauer Allee 6, 17268 Templin, Deutschland',
            website: 'https://www.mkc-templin.de',
            phone: '+49 3987 551063'
        }
    ],
    showtimes: {
        url: ':cinema.website:/kino/kino-im-mkc/',
        movies: {
            box: '.list-item-kino',
            title: 'h3',
            dates: {
                box: '.item-spielzeit',
                date: '.tag',
                dateLocale: 'de',
                dateFormat: 'dd. DD.MM.',
                showtimes: {
                    box: '.zeit',
                    time: {
                        selector: '.spielzeit',
                        mapper: value => value.replace('Uhr', '').trim()
                    }
                },
            },
            attributes: '.genre span',
        }
    }
})
crawlE.crawl()

