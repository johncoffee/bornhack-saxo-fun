# bot

This simple trading bot was made for the saxo hack-me challenge at Bornhack 2018.

I wrote the basic (async) logic to stream in price changes, buy, and sell. But didn't even get to actually calling the HTTP.


## Installation

`npm install` to install dependencies

then `tsc` to compile typescript

### Running

`node examples/static-example.js`

### development

`nodemon examples/static-example.js --delay=300ms -e=js`


# Going further

* Actually do API calls
* Create a new saxo account on running the scenario
* Describe what to do at the end of a scenario / aka exit strategy
* Deployable bot (docker)
