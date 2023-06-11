const CrawlE = require("crawl-e/v0.5.1");
const puppeteer = require("puppeteer");
const moment = require("moment");


let crawlE = new CrawlE({
    crawler: { is_booking_link_capable: true },
    hooks: {
        handleCinemasResponse: async (response) => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(response.text);

            const siteData = await page.evaluate(() => {
                try {
                    return pc;
                } catch (error) {
                    return null
                }
            });

            await browser.close();

            let cinemas;
            if (siteData) {
                try {
                    cinemas = siteData.cinemas.map((cinema) => {
                        return {
                            name: cinema.CinemaName,
                            id: cinema.CinemaId,
                            slug: cinema.CinemaName.replace(/\s+/g, '-').toLowerCase(),
                            website: `${siteData.api.movie}movies/${siteData.circuit}/${cinema.CinemaId}`,
                            address: cinema.Address1
                                + ' '
                                + cinema.Address2
                                + ' '
                                + cinema.City
                                + ' '
                                + cinema.StateName
                                + ' '
                                + cinema.ZipCode,
                            phone: cinema.Phone,
                            lat: Number(cinema.Latitude),
                            lon: Number(cinema.Longitude),
                        }
                    });
                } catch (e) {
                    throw new Error('cinemas:hook - JSON Data structure might be changed, some keys are not found');
                }
                return cinemas
            }

            throw new Error('cinemas:hook - Website might be changed, variable not found!');
        },
        handleShowtimesResponse: (response, context, callback) => {
            const movies = response.body;
            if (!movies) {
                return callback(new Error('showtimes:hook - response.body is empty'));
            }

            const is3D = experiences => experiences.some(({ Name }) => Name.match(/3D/gi));

            const showtimes = [];
            try {
                movies.forEach((movie) => {
                    movie.Sessions.forEach((session) => {
                        const startingDate = session.NewDate;

                        session.Times.forEach((time) => {
                            const startingTime = time.StartTime;
                            const startDT = moment(`${startingDate} ${startingTime}`, 'YYYY-MM-DD HH:mm A').format('YYYY-MM-DDTHH:mm:ss');

                            showtimes.push({
                                movie_title: movie.Title,
                                start_at: startDT,
                                directors: movie.Director.split(',').map(director => director.trim()),
                                audotorium: `${time.CinemaName} ${time.Screen}`,
                                booking_link: `https://www.showbizcinemas.com/booking/?sessionId=${time.Scheduleid}`,
                                is_3d: is3D(time.Experience),
                            });

                            ;
                        });
                    });
                });
            } catch (e) {
                console.error(e);
                return callback(new Error('showtimes:hook - JSON Data structure might be changed, some keys are not found'));
            }

            return callback(null, showtimes);
        },
    },
    cinemas: {
        list: {
            url: 'https://www.showbizcinemas.com/movies/nowplaying/',
        }
    },
    showtimes: {
        url: ':cinema.website:?startDate=:date:&endDate=:date:',
        urlDateFormat: 'YYYY-MM-DD',
    }
})

crawlE.crawl()