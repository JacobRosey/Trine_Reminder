//Run with npm start

const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const cors = require('cors')
//const fs = require('fs')

const app = express()
app.use(cors())

const schedule = 'https://www.trinethunder.com/sports/sball/2021-22/schedule'
const news = 'https://www.trinethunder.com/sports/sball/2021-22/news'
const stats = 'https://www.trinethunder.com/sports/sball/2021-22/players/adrienneroseybff7'

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}
//app.METHOD(PATH, HANDLER)
app.listen(port);
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