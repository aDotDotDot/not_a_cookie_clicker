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
const ____ = (()=>{
const url_string = window.location.href;
const url = new URL(url_string);
const isTest = url.searchParams.get("testme");
let stars = new Big(0);
let stars_from_start = new Big(0);
let stars_per_second = new Big(0);
const buildings = new Map([['Nebula', {desc:'Create 1 star per second', price:125, production:1, interval:1000}],
                    ['Binary Star', {desc:'Create 2 stars per second', price:500, production:2, interval:1000}],
                    ['Supernovae', {desc:'Create 21 stars every 3 second', price:3500, production:21, interval:3000}],
                    ['Constellation', {desc:'Create 162 stars every 9 second', price:15000, production:162, interval:9000}],
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
            let mult = 0.1;
            if(this._upgradePrice.e-this._starsPerClic.e>5)
                mult = 0.3;
            else//the upgrade price is relatively too high, just wait
                this._upgradePrice = this._upgradePrice.times(0.2).plus(this._upgradePrice).round();
            this._starsPerClic = (this._starsPerClic.lte(Big(60)))?(this._level.pow(3).sqrt()).round():this._starsPerClic.times(mult).plus(this._starsPerClic).round();
            //this._upgradePrice = (new Big(20)).times(this._level.pow(3).sqrt()).round();
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
        if(this._price.lt(new Big(100))){
            resetGame();
            alert('CHEATER !!!!!');
            autoSave();//
            return;
        }
        if(this._price.times(new Big(number)).lte(stars)){
            stars = stars.minus(this._price.times(new Big(number)));
            let beforeE = this._count.e;
            this._count = this._count.plus(new Big(number));
            if(this._count.e > beforeE){
                let powerToApply = this._count.e - beforeE;
                let timesTwo = (new Big(2)).pow(powerToApply);
                this._price = this._price.times(timesTwo);
            }
            updateUI();
        }else{
            alert('Not enough stars');
        }
    }
    buyAll(){
        const nb = stars.div(this._price).round(0,0);
        if(nb.gt(new Big(0)))
            this.buy(nb);
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
    let brElt = document.createElement('br');
    elt.innerHTML += `<span title="${v.desc}">${k}</span><br/>`;
    let buySpan = document.createElement('span');
    buySpan.onclick = ()=>{bb.buy(1)};
    buySpan.setAttribute('title','Click to buy one');
    buySpan.setAttribute('id',`building-${k}-price`);
    buySpan.innerText = `${v.price}`;
    elt.append(buySpan);
    elt.append(brElt);
    let prodSpan = document.createElement('span');
    prodSpan.onclick = ()=>{bb.buyAll()};
    prodSpan.setAttribute('id',`building-${k}-prod`);
    prodSpan.innerText = ``;
    elt.append(prodSpan);
    let ip = null;
    if(bb._interval>1000){
        let progress = document.createElement('progress');
        progress.setAttribute('id', `building-${k}-progress`);
        progress.setAttribute('max', '100');
        progress.setAttribute('value', Math.floor(100*(1000/bb._interval)));
        elt.append(progress);
        ip = setInterval( ()=>{
            let v_pr = parseInt(document.getElementById(`building-${k}-progress`).getAttribute('value'))+Math.floor(100*(1000/bb._interval));
            if(v_pr > 100)
                v_pr = Math.floor(100*(1000/bb._interval));
            document.getElementById(`building-${k}-progress`).setAttribute('value', v_pr);
        },1000);
    }
    document.getElementById('buildings').append(elt);
    let ii = setInterval(()=>{
        let tick = bb.tick()
        stars = stars.plus(tick);
        stars_from_start = stars_from_start.plus(tick);
    }, bb._interval);
    intervals.set(k, {interval:ii,b:bb,ip:ip,pct:0});
})
const SHorD = (interval) => {
    if(interval < 60*60*1000){
        return `${Math.floor(interval/1000)}s`;
    }
    if(interval >= 60*60*1000 && interval < 24*60*60*1000){
        return `${Math.floor(interval/1000/60/60)}h`;
    }
    if(interval > 60*60*1000){
        return `${Math.floor(interval/1000/60/60/24)} day${Math.floor(interval/1000/60/60/24)<2?'':'s'}`;
    }
    return `${interval}ms`;
};
const updateUI = ()=>{
    document.getElementById('stars').innerText = stars.toString().length<12?stars.toString():stars.toExponential(3);
    document.getElementById('stars_from_start').innerText = stars_from_start.toString().length<12?stars_from_start.toString():stars_from_start.toExponential(3);
    document.getElementById('level').innerText = g._level.toString().length<12?g._level.toString():g._level.toExponential(3);
    document.getElementById('stars_per_clic').innerText = g._starsPerClic.toString().length<12?g._starsPerClic.toString():g._starsPerClic.toExponential(3);
    document.getElementById('upgrade_price').innerText = g._upgradePrice.toString().length<12?g._upgradePrice.toString():g._upgradePrice.toExponential(3);
    stars_per_second = new Big(0);
    intervals.forEach( (v,k)=>{
        const cProd = v.b._count.times(v.b._production);
        stars_per_second = stars_per_second.plus(cProd.times(new Big(1000)).div(new Big(v.b._interval)));
        document.getElementById(`building-${k}-prod`).innerText = `Owned : ${v.b._count.toString().length<12?v.b._count.toString():v.b._count.toExponential(2)}`;
        document.getElementById(`building-${k}-prod`).setAttribute('title',`Click to spend all your stars on this\nCurrent production : ${cProd.toString().length<8?cProd.toString():cProd.toExponential(3)} every ${SHorD(v.b._interval)}`);
        document.getElementById(`building-${k}-price`).innerText = `${v.b._price.toString().length<12?v.b._price.toString():v.b._price.toExponential(2)}`;
    });
    document.getElementById('stars_per_second').innerText = stars_per_second.toString().length<12?stars_per_second.toString():stars_per_second.toExponential(3);
}
const resetGame = ()=>{
    stars = new Big(0);
    stars_from_start = new Big(0);
    g = new God();
    intervals.forEach( (v,k)=>{
        v.b._count = new Big(0);
    });
}
let i = setInterval(() => {
    if(typeof stars !== "object" || stars_from_start.lt(stars) || g._upgradePrice.lt(new Big(20))){//cheating ?
        resetGame();
        alert('CHEATER !!!!!');
        autoSave();//
    }
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
window.skip = skip;
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
    saveData.hash = btoa((stars.plus(stars_from_start).plus(stars_per_second)).times(new Big(13e+37)));
    intervals.forEach( (v,k)=>{
        saveData.buildings.push({name:k, count:v.b._count, price:v.b._price});
    });
    return btoa(JSON.stringify(saveData));
}

const load = (strSave)=>{
    if(!strSave || strSave.length<2)
        return;
    try{
        let saveData = JSON.parse(atob(strSave));
        if(saveData.hash != btoa(( (new Big(saveData.stars))
        .plus(new Big(saveData.stars_from_start))
        .plus(new Big(saveData.stars_per_second)))
            .times(new Big(13e+37))))
            throw("cheater"); 
        stars = new Big(saveData.stars);
        stars_from_start = new Big(saveData.stars_from_start);
        stars_per_second = new Big(saveData.stars_per_second);
        g._starsPerClic = new Big(saveData.stars_per_clic);
        g._level = new Big(saveData.level);
        g._upgradePrice = new Big(saveData.upgradePrice);
        saveData.buildings.map(building=>{
            if(intervals.has(building.name)){
                intervals.get(building.name).b._count = new Big(building.count);
                intervals.get(building.name).b._price = new Big(building.price);

            }
        });
    }catch(e){
        console.log(e);
        resetGame();
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
    }else{
        if(isTest==='1'){
            stars = new Big(1e100);
            stars_from_start = new Big(1e100);
        }
    }
}
})();