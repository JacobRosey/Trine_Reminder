//Run with npm start

const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const cors = require('cors')
const router = express.Router()
const path = require('path')

const app = express()
app.use(cors())

const schedule = 'https://www.trinethunder.com/sports/sball/2021-22/schedule'
const news = 'https://www.trinethunder.com/sports/sball/2021-22/news'
const players = 'https://www.trinethunder.com/sports/sball/2021-22/teams/trine?view=roster'
const playerStats = 'https://www.trinethunder.com'


let port = process.env.PORT || 3000;
if(port == null || port == ""){
    port = 3000;
}

//app.METHOD(PATH, HANDLER)
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

app.use(express.static(path.join(__dirname, '/public')));

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
 });
 
app.use('/', router)

app.get('/record', (req, res) => {
    axios(schedule)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const recordArr = []

            $('.clearfix .cat .value', html).each(function(){
                var records = $(this).text()
                recordArr.push(records)
            })
            res.json(recordArr)
        }).catch(err => console.log(err))
})

app.get('/players', (req, res) => {
//Big thanks to jfriend00 on stackoverflow for
//the proper async/await/promise structure. And
//the bonus functions for seeing how long request takes
const zeroes = "000000000000000000000000000000";

function zeroPad(num, padLen) {
    let str = num + "";
    let padNum = padLen - str.length;
    if (padNum > 0) {
        str = zeroes.slice(0, padNum) + str;
    }
    return str;
}

const base = Date.now();

function log(...args) {
    let delta = Date.now() - base;
    let deltaPad = zeroPad(delta, 6);
    console.log(deltaPad + ": ", ...args);
}

let getPlayersT = 0;
let cheerioT = 0;

async function run() {

    async function getPlayers() {
        log("begin getPlayers()");
        let startT = Date.now();
        const playerLink = [];
        const response = await axios(players);
        const html = response.data;
        const $ = cheerio.load(html);

        $("td.text.pinned-col > a", html).each(function() {
            const link = $(this).attr("href");
            //if link not yet in array, push to array
            if (playerLink.indexOf(playerStats + link) === -1) {
                playerLink.push(playerStats + link);
            }
        });
        log("end getPlayers()")
        getPlayersT += Date.now() - startT;
        return playerLink;
    }

    async function getPlayerStats(playerLink) {
        log("begin getPlayerStats");
        const statsArray = [];
        await Promise.all(playerLink.map(async link => {
            log(`begin get ${link}`)
            const response = await axios.get(link);
            log(`after get ${link}`)
            const html = response.data;
            const startT = Date.now();
            const $ = cheerio.load(html);
            const statName = [];
            const statDesc = [];
            const statNum = [];

            $("h2 > span:nth-child(1)", html).each(function() {
                var name = $(this).text();
                statName.push(name);
            });
            $(".stat-title", html).each(function() {
                var stat1 = $(this).text();
                statDesc.push(stat1);
            });
            $(".stat-value", html).each(function() {
                var stat2 = $(this).text();
                statNum.push(stat2);
            });
            //Conditional is here because sometimes statsArray
            //gets filled multiple times
            if (statsArray.length < 63) {
                statsArray.push(statName, statDesc, statNum);
            }
            cheerioT += Date.now() - startT;
            log(`after cheerio parse ${link}`);
        }));
        return statsArray;
    }

    try {
        log("begin all")
        const playerLink = await getPlayers();
        const statsArray = await getPlayerStats(playerLink);
        log("end all")
        res.json(statsArray);
    } catch (e) {
        console.log(e);
    }
}

run().then(result => {
    console.log(result);
    console.log(`getPlayers() took ${getPlayersT}ms`);
    console.log(`cheerio processing took ${cheerioT}ms`);
}).catch(err => {
    console.log(err);
});
})
/*
app.get('/stats', (req, res) => {
    axios(stats)
    .then(response => {
        const html = response.data
        const $ = cheerio.load(html)
        const statDesc = []
        const statNum = []
        const statArr = [statDesc, statNum]

        $('.stat-title', html).each(function(){
            var stat1 = $(this).text()
            statDesc.push(stat1)
        })
        $('.stat-value', html).each(function(){
            var stat2 = $(this).text()
            statNum.push(stat2)
        })
        res.json(statArr)
    }).catch(err => console.log(err))
})
*/

app.get('/schedule', (req, res) => {

axios(schedule)
.then(response => {
    const html = response.data
    const $ = cheerio.load(html)
    const gameDate = []
    const gameOpp = []
    const gameStatus = []
    const gameResult = []
    const games = [gameDate, gameOpp, gameStatus]

    //Find all elements of given class names within each event row element
    $('.e_date', html).each(function(){
        var date = $(this).text()
        gameDate.push(date)
    })
    $('.team-name', html).each(function(){
        var opponent = $(this).text()
        gameOpp.push(opponent)
    })
    $('.e_status', html).each(function(){
        var status = $(this).text()
        gameStatus.push(status)
    })
    $('.e_result', html).each(function (){
        var result = $(this).text()
        gameResult.push(result)
    })

    schedApp.cleanData(games,gameResult);
    res.json(games)
    }).catch(err => console.log(err))
})

app.get('/news', (req, res) => {

axios(news)
.then(response => {
    const html = response.data
    const $ = cheerio.load(html)
    const newsHeadline = []
    const newsDate = []
    const newsSrc = []
    const articles = [newsHeadline, newsDate, newsSrc]

    //Only grabbing the 5 most recent articles
    $('.title',html).each(function (){
        const headline = $(this).text()
        if(newsHeadline.length < 5){
            newsHeadline.push(headline)
        }
    })
    $('.details .date', html).each(function(){
        const date = $(this).text()
        if(newsDate.length < 5){
            newsDate.push(date)
        }
    })
    $('.title-box', html).each(function(){
        const src = $(this).attr('href')
        if(newsSrc.length < 5){
            newsSrc.push("https://trinethunder.com/"+src)
        } 
    }) 
    newsApp.logNews(articles)
    res.json(articles)
    }).catch(err => console.log(err))
})

var schedApp = new function(){
    this.cleanData = function(data, result){
        //Iterate through 2d array to access all data
        for(let i=0; i<data.length; i++){
            for(let j=0; j<data[i].length; j++){
                //If current array is date array
                if(i===0){
                    //Delete period, spaces from month abbrev.
                    data[i][j] = data[i][j].replace(/[ .]/g, "")

                    //Remove zero if not followed by end of string
                    data[i][j] = data[i][j].replace(/0(?!$)/, '')

                    //Every other date is blank, but here I set blanks to the same date
                    //as the last game. If the date is blank, it's played on same 
                    //date as last game. check Trine schedule to see what I mean
                    if(data[i][j].length == 1){
                        data[i][j] = data[i][j-1]
                    }
                    
                }
                if(i===2){
                    //Replace "Final" with the the result, i.e. "W, 4-1"
                    if(data[i][j].includes("Final")){
                        data[i][j] = result[j]
                    } //Include score with current inning
                    if(data[i][j].includes("Top" || "Bottom")){
                        data[i][j] = result[j] + " " + data[i][j]
                    }
                }
            }
        } 
    }

}

var newsApp = new function(){
    var archiveArr = [];
    this.logNews = function(articles){
        for(let i=0; i<articles.length; i++){
            for(let j=0; j<articles[i].length; j++){
                console.log(articles[i][j] + "\n")
                /*if(i == 0){
                    if(articles[i][j].includes("Rosey")){
                        archiveArr += articles[0][j] + articles[1][j] + articles[2][j]
                    }
                }*/
            }
        }
        /*
        let content = '';
        content = archiveArr[0] + archiveArr[1] + archiveArr[2]
        if('/Users/jacobrosey/Desktop/Web Dev Projects/Trine Reminder/archive.txt'.includes(!content)){
            fs.writeFile('/Users/jacobrosey/Desktop/Web Dev Projects/Trine Reminder/archive.txt', content, { flag: 'a+' }, err =>
            {
                if(err){
                    console.error(err)
                    return
                }
    
            }) 
        }*/
    }
}
    