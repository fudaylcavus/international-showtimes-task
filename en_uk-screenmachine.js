const CrawlE = require('crawl-e/v0.5.1')

let crawlE = new CrawlE({
    cinemas: {
        list: {
            url: 'https://www.screenmachine.co.uk/',
            box: '.locations-list .card',
            website: (box) => {
                const endpoint = box.find('.location_info a').attr('href')
                if (!endpoint) {
                    return null
                }

                if (endpoint.indexOf('screenmachine.co.uk') === -1) {
                    return `https://www.screenmachine.co.uk${endpoint}`
                }
                return endpoint
            },
            address: '.card-body .address',
            slug: {
                selector: '.card-header h3',
                mapper: value => {
                    let locationName = value.match(/[A-Za-z]+/g)
                    return (
                        locationName ?
                            locationName.join('-')
                            : value
                    ).toLowerCase()
                }
            },
            name: {
                selector: '.card-header h3',
                mapper: value => {
                    let locationName = value.match(/[A-Za-z]+/g)
                    if (locationName) {
                        return locationName.join(', ')
                    }

                    return value
                }
            },
        },
    },
    showtimes: {
        url: ':cinema.website:',
        movies: {
            box: '.film-card',
            title: '.header a',
            showtimes: {
                box: '.screening-item',
                datetime: box => {
                    return box.find('span').html().split('<br>')[0].trim()
                },
                datetimeLocale: 'en-GB',
                datetimeFormat: 'DD.MM.YY, HH:mm',
            }
        }
    }
})
crawlE.crawl()