const express= require('express')
const axios= require('axios')
const cheerio= require('cheerio')
const moment = require('moment')
const { kill } = require('nodemon/lib/monitor/run')
const app = express()
const PORT = process.env.PORT ||8000

let devfolio="https://api.devfolio.co/api/hackathons?filter=all&page=1&limit=20"
const D2C="https://dare2compete.com/api/public/opportunity/search-new?opportunity=hackathons&sort=&dir=&filters=,All,Open,All&types=teamsize,payment,oppstatus,eligible&atype=explore&page=1&showOlderResultForSearch=false"
const MLH="https://mlh.io/seasons/2022/events"
const devpost="https://devpost.com/api/hackathons"
let hackathons =[]
let devfolio_hackathons =[]
let devpost_hackathons =[]
let D2C_hackathons =[]
let MLH_hackathons=[]
axios.get(MLH)
.then(response =>{
    const html = response.data
    const $ = cheerio.load(html)
    $('.event-wrapper',html).each(function () {
        const name = $(this).find('.event-name').text();
        const link =$(this).find('a').attr('href');
        const date =$(this).find('.event-date').text();
        hackathons.push({
            name,
            date,
            link
        });
        MLH_hackathons.push({
            name,
            date,
            link,
        });
    });
}).catch(err => console.log(err));

for(let i =1;i<=18;i++){
    devfolio="https://api.devfolio.co/api/hackathons?filter=all&page="+i+"&limit=20";

axios.get(devfolio)
.then(response =>{
    const jsondata = response.data
    // jsondata.result[] -> array with properties name , location , starts_at,ends_at,is_online
    jsondata.result.forEach(hack =>{
        const name = hack.name
        const start_d = hack.starts_at;
        const end_d = hack.ends_at;
        let start = moment.parseZone(start_d).format("DD-MM-YY");
        let end = moment.parseZone(end_d).format("DD-MM-YY");
        const date = start+" to "+end;
        const link = hack.hackathon_setting.site ;       
        hackathons.push({
            name,
            date,
            link,
        });
        devfolio_hackathons.push({
            name,
            date,
            link,
        });
    })
}).catch(err => console.log(err))
}
axios.get(D2C)
.then(response =>{
    const jsondata = response.data
    let next_url = jsondata.data.next_page_url
    if(next_url){
        axios.get(next_url)
        .then(response =>{
            const jsondata = response.data;
            jsondata.data.data.forEach(hack =>{
                const name = hack.title
                const start_d = hack.start_date;
                const end_d = hack.end_date;
                let start = moment.parseZone(start_d).format("DD-MM-YY");
                let end = moment.parseZone(end_d).format("DD-MM-YY");
                const date = start+ " to " +end
                const link = "https://dare2compete.com/"+hack.public_url
                prizes =[]
                hack.prizes.forEach(prize => {
                    const rank = prize.rank
                    const cash = prize.cash
                    const currency = prize.currencyCode
                    prizes.push({
                        rank,
                        cash,
                        currency
                    })
                })
                hackathons.push({
                    name,
                    date,
                    link,
                    prizes
                })
                D2C_hackathons.push({
                    name,
                    date,
                    link,
                    prizes           
                })
            })
            
        }).catch(err => console.log(err))
    }
    // jsondata.data.data -> array with properties title,start_date,end_date,public_url
    jsondata.data.data.forEach(hack =>{
        const name = hack.title
        const start_d = hack.start_date;
        const end_d = hack.end_date;
        let start = moment.parseZone(start_d).format("DD-MM-YY");
        let end = moment.parseZone(end_d).format("DD-MM-YY");
        const date = start+ " to " +end
        const link = "https://dare2compete.com/"+hack.public_url
        prizes =[]
        hack.prizes.forEach(prize => {
            const rank = prize.rank
            const cash = prize.cash
            const currency = prize.currencyCode
            prizes.push({
                rank,
                cash,
                currency
            })
        })
        hackathons.push({
            name,
            date,
            link,
            prizes
        })
        D2C_hackathons.push({
            name,
            date,
            link,
            prizes           
        })
    })
    
}).catch(err => console.log(err))


for(let i =1;i<10;i++){
    let link = "https://devpost.com/api/hackathons?page="+i
    axios.get(link)
.then(response =>{
    const jsondata = response.data
    // jsondata.hackathons -> array with properties title,submission_period_dates,url,prize_amount
    jsondata.hackathons.forEach(hack =>{
        const name = hack.title
        const date = hack.submission_period_dates
        const link = hack.url
        const prize = hack.prize_amount.replace("<span data-currency-value>",'').replace('</span>','')
        hackathons.push({
            name,
            date,
            link,
            prize
        })
        devpost_hackathons.push({
            name,
            date,
            link,
            prize
        })
    })
    
}).catch(err => console.log(err))

}
app.get('/',(req,res)=>{
    res.json(hackathons)
})
app.get('/mlh',(req,res)=>{
    res.json(MLH_hackathons);
})
app.get('/devpost',(req,res)=>{
    res.json(devpost_hackathons);
})
app.get('/devfolio',(req,res)=>{
    res.json(devfolio_hackathons)
})
app.get('/d2c',(req,res)=>{
    res.json(D2C_hackathons)
})
app.listen(PORT)