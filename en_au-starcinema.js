const CrawlE = require('crawl-e/v0.5.1')
const cheerio = require('cheerio')
const esprima = require('esprima')
const moment = require('moment')

function getVariableByEsprima(declaration) {
    if (!declaration || !declaration.init) return

    function recursiveParse(property) {
        switch (property.type) {
            case 'ObjectExpression':
                let innerObject = {}
                property.properties.forEach(property => {
                    innerObject[property.key.value] = recursiveParse(property.value)
                })
                return innerObject
            case 'ArrayExpression':
                let innerArray = []
                property.elements.forEach(property => {
                    innerArray.push(recursiveParse(property))
                })
                return innerArray
            case 'Literal':
                return property.value
            default:
                break
        }
    }
    return recursiveParse(declaration.init)
}


let crawlE = new CrawlE({
    crawler: { is_booking_link_capable: true },
    hooks: {
        handleShowtimesResponse: (response, context, callback) => {
            try {
                const $ = cheerio.load(response.text)
                let movieDataIncludingString = $('script:contains("movieData")').html()

                const extractedVariables = esprima.parseScript(movieDataIncludingString)
                const { declarations } = extractedVariables.body[0]

                let requiredDeclaration = declarations.find(({ id }) => id.name === 'movieData')
                let movieData;
                try {
                    movieData = getVariableByEsprima(requiredDeclaration)
                } catch (error) {
                    return callback(error)
                }

                const showtimes = []
                for (let date in movieData) {
                    const movies = movieData[date]
                    movies.forEach(movie => {
                        movie.times.forEach(showtime => {
                            showtimes.push({
                                movie_title: movie.title,
                                start_at: moment(`${date} ${showtime.time}`, 'YYYY-MM-DD h:mma')
                                    .format('YYYY-MM-DDTHH:mm:ss'),
                                directors: movie.director ? [movie.director] : [],
                                booking_link: showtime.bookingLink,
                                attributes: showtime.attributes.map(attr => attr.shortName)
                            })
                        })
                    })
                }
                return callback(null, showtimes)
                
            } catch (error) {
                return callback(error)
            }
        }
    },
    cinemas: [{
        name: 'Multikulturelles Centrum Templin',
        address: 'Eaglehawk Town Hall, 2 Peg Leg Rd, Eaglehawk VIC Australia',
        website: 'https://www.starcinema.org.au/',
        phone: '03 5446 2025'
    }],
    showtimes: {
        url: ':cinema.website:',
    }
})

crawlE.crawl()