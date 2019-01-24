/*
Hey ! Are you awake ?
You've been good in your previous life,
 so good that you've been reincarnated into a more powerful form now.
You're now what you always have called a "God". In here actually you're just a construction worker.
Don't jump around trying your powers, you have only one power actually : you can create stars.
We're now giving you a free empty Universe, and the software to build what you want, because your powers are limited (for now)
A little head's up, the software has been developped by an incredibly lazy person from EA (he's in Hell now, you'll understand why)
 so you'll have to buy everything through micro-transactions 
Unfortunately, you can only pay with stars, an ungodly amount of stars to be more precise.
Long story short, you should start farming, you have worlds to build !
*/
let stars = new Big(0);
let stars_from_start = new Big(0);
let stars_per_second = new Big(0);

const buildings = new Map([['Nebula', {desc:'Create 1 star per second', price:125, production:1, interval:1000}],
                    ['Binary Star', {desc:'Create 2 stars per second', price:500, production:2, interval:1000}],
                    ['Supernovae', {desc:'Create 21 stars every 3 second', price:3500, production:21, interval:3000}],
                    ['Constellation', {desc:'Create 162 stars every 9 second', price:15000, production:81, interval:4500}],
                    ['Galaxy', {desc:'Create 2000 stars every 10 second', price:450000, production:2000, interval:10000}],
                    ['Galaxy Cluster', {desc:'Create 20000 stars every hour', price:1000000, production:20000, interval:60000}],
                    ['Little Bang', {desc:'Create 15000000 stars every 12 hours', price:7500000, production:15000000, interval:12*60*60*1000}],
                    ['Big Bang', {desc:'Create 60000000 stars every day (24h)', price:600000000, production:60000000, interval:24*60*60*1000}]]);

class God{
    constructor(){
        this._starsPerClic = new Big(1);
        this._upgradePrice = new Big(20);
        this._level = new Big(1);
    }
    createStars(){
        stars = stars.plus(this._starsPerClic);
        stars_from_start = stars_from_start.plus(this._starsPerClic);
    }
    upgradePower(){
        if(stars.gte(this._upgradePrice)){
            stars = stars.minus(this._upgradePrice)
            this._level = this._level.plus(1);
            this._starsPerClic = (this._starsPerClic.lte(Big(60)))?(this._level.pow(3).sqrt()).round():this._starsPerClic.times(0.1).plus(this._starsPerClic).round();
            //this._upgradePrice = (new Big(20)).times(this._level.pow(3).sqrt()).round();
            this._upgradePrice = this._upgradePrice.times(0.2).plus(this._upgradePrice).round();
        }else{
            alert('Not enough stars');
        }
    }
}

class Building{
    constructor(name, price, production, interval = 1000, count = 0){
        this._name = name;
        this._price = new Big(price);
        this._production = new Big(production);
        this._count = new Big(count);
        this._interval = interval;//for setInterval
    }
    tick(){
        return this._production.times(this._count);
    }
    buy(number=1){
        if(this._price.times(number).lte(stars)){
            stars = stars.minus(this._price.times(number));
            this._count = this._count.plus(number);
            stars_per_second = stars_per_second.plus(this._production.times(1000/this._interval)).round();
            updateUI();
        }else{
            alert('Not enough stars');
        }
    }
}

let g = new God();
document.getElementById('game-container').onclick = ()=>{
    g.createStars();
    updateUI();
}
document.getElementById('upgrade').onclick = ()=>{
    g.upgradePower();
    updateUI();
}
let intervals = new Map();
buildings.forEach( (v,k)=>{
    let bb = new Building(k,v.price,v.production,v.interval);
    let elt = document.createElement('div');
    /*let bt = document.createElement('button');
    bt.innerText = `Buy`;*/
    elt.innerHTML += `<span title="${v.desc}">${k}</span><br/>${v.price}`;
    //elt.append(bt);
    elt.onclick = ()=>{bb.buy(1)};
    document.getElementById('buildings').append(elt);
    let ii = setInterval(()=>{
        let tick = bb.tick()
        stars = stars.plus(tick);
        stars_from_start = stars_from_start.plus(tick);
    }, bb._interval)
    intervals.set(k, {interval:ii,b:bb});
})

updateUI = ()=>{
    document.getElementById('stars').innerText = stars.toString().length<12?stars.toString():stars.toExponential(1);
    document.getElementById('stars_from_start').innerText = stars_from_start.toString().length<12?stars_from_start.toString():stars_from_start.toExponential(1);
    document.getElementById('level').innerText = g._level.toString().length<12?g._level.toString():g._level.toExponential(1);
    document.getElementById('stars_per_clic').innerText = g._starsPerClic.toString().length<12?g._starsPerClic.toString():g._starsPerClic.toExponential(1);
    document.getElementById('upgrade_price').innerText = g._upgradePrice.toString().length<12?g._upgradePrice.toString():g._upgradePrice.toExponential(1);
    document.getElementById('stars_per_second').innerText = stars_per_second.toString().length<12?stars_per_second.toString():stars_per_second.toExponential(1);
}

let i = setInterval(() => {
    updateUI();
}, 500);
const next = (idx) =>{
    const times = [0,5000,7000,6000,7000,7000,7000,8000,10000,7000,5000];
    if(idx>10)
        return;
    setTimeout( ()=>{
        document.getElementsByClassName('page-'+idx).item(0).style.display = 'none';
        next(idx+1);
    }, times[idx]);
};
const skip = ()=>{
    for(let i=1;i<11;i++){
        document.getElementsByClassName('page-'+i).item(0).style.display = 'none';
    }
}
next(1);
//let b = new Building('Galaxy', 12, 150, 1000, 1);
const save = ()=>{
    let saveData = {};
    saveData.stars = stars;
    saveData.stars_from_start = stars_from_start;
    saveData.stars_per_second = stars_per_second;
    saveData.stars_per_clic = g._starsPerClic;
    saveData.level = g._level;
    saveData.upgradePrice = g._upgradePrice;
    saveData.buildings = [];
    intervals.forEach( (v,k)=>{
        saveData.buildings.push({name:k, count:v.b._count});
    });
    return btoa(JSON.stringify(saveData));
}

const load = (strSave)=>{
    try{
        let saveData = JSON.parse(atob(strSave));
        stars = new Big(saveData.stars);
        stars_from_start = new Big(saveData.stars_from_start);
        stars_per_second = new Big(saveData.stars_per_second);
        g._starsPerClic = new Big(saveData.stars_per_clic);
        g._level = new Big(saveData.level);
        g._upgradePrice = new Big(saveData.upgradePrice);
        saveData.buildings.map(building=>{
            if(intervals.has(building.name)){
                intervals.get(building.name).b._count = new Big(building.count);
            }
        });
    }catch(e){
        console.log(e);
        alert("Invalid save data");
    }
}

document.getElementById('saveGame').onclick = ()=>{
    prompt(`Copy and store this safely and use the "load" button to import you saved game\nNOTE : your game is also automatically saved in your browser`,`${save()}`)
}

document.getElementById('loadGame').onclick = ()=>{
    let saveData = prompt(`Paste here your data from a saved game`,``);
    load(saveData);
}
const autoSave = ()=>{
    let saveData = save();
    localStorage.setItem('cookie_save', saveData);
}
setInterval( ()=>{
    autoSave();
},5000);
if(localStorage.getItem('cookie_save')){
    if(confirm('Do you want to load your saved game ?')){
        skip();
        load(localStorage.getItem('cookie_save'));
    }
}