const express= require('express')
const axios= require('axios')
const cheerio= require('cheerio')
const moment = require('moment')
const app = express()
const PORT = process.env.PORT ||8000

const devfolio="https://api.devfolio.co/api/hackathons?filter=all&page=1&limit=20"
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

axios.get(D2C)
.then(response =>{
    const jsondata = response.data
    // jsondata.data.data -> array with properties title,start_date,end_date,public_url
    jsondata.data.data.forEach(hack =>{
        const name = hack.title
        const start_d = hack.start_date;
        const end_d = hack.end_date;
        let start = moment.parseZone(start_d).format("DD-MM-YY");
        let end = moment.parseZone(end_d).format("DD-MM-YY");
        const date = start+ " to " +end
        const link = "https://dare2compete.com/"+hack.public_url
        hackathons.push({
            name,
            date,
            link
        })
        D2C_hackathons.push({
            name,
            date,
            link
        })
    })
    
}).catch(err => console.log(err))

axios.get(devpost)
.then(response =>{
    const jsondata = response.data
    // jsondata.hackathons -> array with properties title,submission_period_dates,url
    jsondata.hackathons.forEach(hack =>{
        const name = hack.title
        const date = hack.submission_period_dates
        const link = hack.url
        hackathons.push({
            name,
            date,
            link
        })
        devpost_hackathons.push({
            name,
            date,
            link
        })
    })
    
}).catch(err => console.log(err))

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