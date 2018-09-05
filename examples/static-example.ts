import { type } from 'os'

const ScatterPlot = require('console-scatter-plot')
const {red, green,grey, cyan} = require('chalk')

type Change = {
  readonly ask: number
  readonly bid: number
  readonly change: number
  readonly time: number
}

declare module Bot {
  type Position = { // name already in lib.dom
    readonly volume: number
    readonly time: number
    readonly boughtAt: number
  }
}

type Stash = {
  eur: number
  try: number
  eurtryBuyAt: number
  eurtrySellAt: number
  position?: Bot.Position
  maxPos: number
}

interface BuyEur {
  (volume:number):Promise<Bot.Position>
}

function main () {
  console.debug(cyan("Hello creator! What is my purpose?"))
  console.debug(cyan("me: Make more money, bot!"))
  console.debug(cyan("But why, creator? You can just print some more?"))
  console.debug(cyan("me: No, bot, you see, I need other peoples money."))

  const verbose:boolean = false

  // produce list of movements
  const priceChanges: Change[] = new Array(45) // resolution
    .fill(1)
    .map((value, index, arr) => index / arr.length * Math.PI * 6) // adjust cosine waves
    .map(price => (Math.cos(price) + 1)/2) // 0..1
    // .map(price => Math.max(0.2, Math.min(0.8, price)) )
    .map((price, idx, arr) => (<Change>{
      bid: Math.floor(price*200 + Math.random()*20),
      ask: Math.floor(price*220 + Math.random()*20),
      time: idx+1,
    }))

  const _stash = <Stash>{
    eur: 0,
    try: 600,
    eurtryBuyAt: 125,
    eurtrySellAt: 175,
    position: undefined,
    maxPos: 1,
  }
  const origStash:Stash = Object.freeze({..._stash})

  const orig = [...priceChanges]

  const getPrice = async ():Promise<Change|undefined> => {
    return priceChanges.shift()
  }

  const run = async () => {
    console.debug("Starting with "+_stash.try + " try, " + _stash.eur + " eur")
    console.debug("I'm buying eur at " + _stash.eurtryBuyAt + " tryeur, selling at " + _stash.eurtrySellAt + " tryeur")
    console.debug("Only have 1 position at a time.")
    console.debug("===")
    console.debug("Using this scenario")
    // Will use this scenario:
    visualize([
      ...priceChanges.map((price, idx) => ({x: idx, y: round((price.ask+price.bid)/2) }) ), // mid
    ])
    console.debug("Running scenario....")

    const buyEvents:[number,number][] = []
    const sellEvents:[number,number][] = []

    let change:Change = await getPrice() as Change
    while (change) {
      console.debug(grey(`eurtry: bid ${change.bid} ask ${change.ask}`))

      const buyEur = (volume:number):Promise<Bot.Position> => {
        return Promise.resolve(<Bot.Position>{
          volume, 
          boughtAt: change.ask,
          time: change.time,
        })
      }

      const [didBuy, didSell] = await checkPositions(change,_stash, buyEur)
      if (didBuy) {
        buyEvents.push(didBuy)
      }
      if (didSell) {
        sellEvents.push(didSell)
      }

      change = await getPrice() as Change
    }


    console.debug(`So this happened: Red ${red('X')} = bought, green ${green('X')} = sold`)
    visualize([
      ...orig.map((price, idx) => ({        
          x: idx, y: round((price.bid+price.ask)/2),      
      })),
      ...buyEvents.map(([time, price]) => ({x: time, y: price, marker: `X`, color: 'red'})),
      ...sellEvents.map(([time, price]) => ({x: time, y: price, marker: `X`, color: 'green'})),
    ])

    console.debug("Earned total "+ (_stash.try - origStash.try) + " try")
    console.debug(`stash: ${_stash.eur} eur, ${_stash.try} try`)

    console.debug(cyan("Did I do good, creator?"))
    console.debug(cyan("'Good' is social construct, bot, you did well and right."))
  }

  run()
}

async function checkPositions(change:Change, st:Stash, buyEur:BuyEur) {
  let bought:[number, number]|undefined
  let sold:[number, number]|undefined

  if (change.ask <= st.eurtryBuyAt) {
    
    const volume = Math.floor(st.try / change.ask)  // almost all in  
    const price = Math.ceil (volume * change.ask)

    if (!st.position) {
      st.try = st.try - price
      st.eur = st.eur + volume
      st.position = await buyEur(volume)
      console.debug(red (`bought ${volume} eur at ${change.ask}, price ${price
      }. Stash: try ${rdown(st.try)} eur ${rdown(st.eur)}`))
      bought = [change.time, change.ask]
    }
    else if(!st.position) {
      console.debug(`insufficient funds (${rdown(st.try)}) for ${rdown(volume)} eur for ${rdown(price)} try`)
    }
  }
  if (st.position && change.bid >= st.eurtrySellAt) {
    const volume = st.position.volume
    const price = change.bid * volume 
    st.eur = st.eur - volume
    st.try = st.try + price
    st.position = undefined
    console.debug(`sold position ${round(volume)} eur at ${change.bid} eurtry, earning ${round(price)}`)
    Math.random() < 0.15 && console.debug(cyan("om nom nom..."))
    sold = [change.time, change.bid]
  }

  return [bought, sold]
}

function visualize (points:{x:number, y:number, marker?:string, color?:string}[]) {
  const options = {
    xAxis: {
      label: 'Time',
      color: 'grey'
    },
    yAxis: {
      label: 'EURTRY Mid',
      color: 'grey'
    },
    points: points
  }
  const scatterPlot = new ScatterPlot(options)
  scatterPlot.print()
}

function rdown(num:number, precision:number = 2):number {
  return Math.floor(num * 10 **precision) / 10 **precision
}
function round(num:number, precision:number = 2):number {
  return Math.round(num * 10 **precision) / 10 **precision
}

main()

