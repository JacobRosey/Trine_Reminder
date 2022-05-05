const schedDisplay = document.querySelector('#feed')
const dateDisplay = document.querySelector('#dates')
const oppDisplay = document.querySelector('#opponents')
const statusDisplay = document.querySelector('#status')
const newsDisplay = document.querySelector('#news')
const recDisplay = document.querySelector('#record')
const statDisplay = document.querySelector('#stats')

//PWA service worker
if("serviceWorker" in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('service worker registered')
        console.log(registration.scope)
    }).catch(error => {
        console.log("service worker registration failed")
        console.log(error)
    })
} 

//Append the current team record for conference, overall, and win or loss streak
fetch('https://trine-scraper.herokuapp.com/record')
    .then(response => {return response.json()})
    .then(data => {
        let overall =  `<h3 id="overall-rec">Overall: `+data[0]+`</h3>`
        let conf = `<h3 id="conf-rec">Conference: `+data[2]+`</h3>`
        let streak = `<h3 id="streak">Current Streak: `+data[4]+`</h3>`

        recDisplay.innerHTML = overall + conf + streak
    })

fetch('https://trine-scraper.herokuapp.com/players')
.then(response => response.json())
.then(data => {
    let names =[];
    let statDesc = [];
    let statNum = [];
    const statsArea = document.getElementById('stats')

    for(let i=0; i<data.length; i++){
        if(data[i].length == 1){
            names.push(data[i])
        //Pitchers have appearances, position players have games played
        }if(data[i].includes("gp") || data[i].includes("app")){
            statDesc.push(data[i])
        }if(names.indexOf(data[i]) == -1 && statDesc.indexOf(data[i])== -1){
            statNum.push(data[i])
        }
        if(data[i].length == 6){
            //Change to class list switcher for 6/8 grid-template-col
            data[i].push('', '')
                
        }
    }
    console.log(names, statDesc, statNum)
    
    document.getElementById('waiting').remove()
    var select = document.getElementById('change-player')
    for(let i=0; i<names.length; i++){
        var name = names[i]
        var el = document.createElement('option')
        el.textContent = name
        el.value = name
        select.appendChild(el)
    }
    document.querySelector('#change-player').addEventListener('change', function() {
        statDisplay.innerHTML = ''
        for(let i=0; i<names.length; i++){
            if(this.value == names[i]){
                for(let j=0; j<statDesc[i].length; j++){
                    //Need to make #stats a class because id's override
                    //class properties
                    /*if(statDesc[i].length == 6 && !statsArea.classList.contains('pos-stats')){
                        statsArea.classList.add('pos-stats')
                    } else if(statDesc[i].length == 8 && statsArea.classList.contains('pos-stats')){
                        statsArea.classList.remove('pos-stats')
                    }*/
                    var statD = `<p id="stat-desc">`+statDesc[i][j]+`</p>`
                    statDisplay.innerHTML += statD
                }
                for(let j=0; j<statNum[i].length; j++){
                    var statN =  `<p id="stat-num">`+statNum[i][j]+`</p>`
                    statDisplay.innerHTML += statN
                }

            }
        }
    })

             
}).catch(err=>console.log(err))

//Append the 5 most recent news articles about the team
fetch('https://trine-scraper.herokuapp.com/news')
    .then(response => {return response.json()})
    .then(data => {
        console.log(data)
        
        for(let i=0; i<data[0].length; i++){
            let headline = `<div class ="news-div"<h3 id="headline">`+ data[0][i] +`</h3>`
            let date =    `<p id="news-date">`+ data[1][i] +`</p>`
            let link =    `<a id="src" target="_blank" href="`+ data[2][i]+
                               `"> Click Here to Read More</a><br><br></div>`

            newsDisplay.innerHTML += headline + date + link
        }
    }).catch(err=>console.log(err))

//Append the schedule for the entire season
fetch('https://trine-scraper.herokuapp.com/schedule')
    .then(response => {return response.json()})
    .then(data => {
        //Uncomment to see Active Game Alert
        //data[2][40] = "Top of 5th"
        for(let i=0; i<data[0].length; i++){
            //If i is even, #ccc background, if i is odd, white background
            var oddeven = ''
            if(i % 2 == 0){
                oddeven = 'even'
            } else  oddeven = 'odd'

            //Change dates to more readable format
            if(data[0][i].includes("Mar")){
                data[0][i] = data[0][i].replace('Mar', 'March ')
            }
            if(data[0][i].includes("Apr")){
                data[0][i] = data[0][i].replace('Apr', 'April ')
            }
            if(data[0][i].includes("May")){
                data[0][i] = data[0][i].slice(0, 3)+ " " + data[0][i].slice(3,5)
            }
            //Not sure why I used id instead of classes....
            //Fix that when everything else is finished
            let date = `<div class="animate-div"id="background-`+oddeven+`"><h3>`+ data[0][i] +`</h3>`
            let opponent = `<p id="sched-opp">`+ data[1][i] +`</p>`
            let status = `<p id="status">`+ data[2][i] +`</p></div><br>`
            
            if(data[2][i].includes("Top") || data[2][i].includes("Bottom")){
                const liveGame = document.getElementById('game-today')
                liveGame.classList.remove('hidden')
                liveGame.classList.add('game-today')
                //For now, the alert will only link to trine broadcasting on Vimeo,
                //meaning only home games will be watchable via the link
            }

            schedDisplay.innerHTML += date + opponent + status
        }
    }).catch(err => console.log(err))

function jumpToGame(){
    
    const status = document.querySelectorAll('#status');
    const anim = document.querySelectorAll('.animate-div')
    let statusArr = []

    const animDuration = {
        duration: 1500,
        iterations: 3,
        fill: 'backwards',
        easing: 'ease-in-out'
      }
    //Ideally you would find the next date (starting from today) which exists
    //in the DOM in the schedule section. However, this approach does the job
    //with much less code

    for(let i=0; i<status.length; i++){
        statusArr.push(status[i].innerHTML) 
        if(status[i].innerHTML.includes("PM")|| 
           status[i].innerHTML.includes("AM")|| 
           status[i].innerHTML.includes("of"))
            {
            status[i].scrollIntoView(true)
            if(window.innerWidth >= 400){
                window.scrollBy(0, -55)
            } else {window.scrollBy(0, -110)}
            
            let divBackground = anim[i].style.backgroundColor; 
            const foundGame = [
                       {backgroundColor: divBackground},
                       {transform: 'scale(1.05)'},
                       {backgroundColor: 'rgb(206, 194, 135)'},
                       {transform: 'scale(1)'},
                       {backgroundColor: divBackground}];
            //Add animation to div
            setTimeout(() => {anim[i].animate(foundGame, animDuration)}, 500)
            return;  
        } 
    } alert('The next game is TBD, or the season is over. Check back later!')
}
