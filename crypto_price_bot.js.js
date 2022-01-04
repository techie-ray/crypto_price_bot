const fetch = require('node-fetch')

const jsdom = require('jsdom')

const twilio = require('twilio')
const api = new twilio('INSERT YOUR SID HERE', 'INSERT YOUR AUTH TOKEN HERE')

async function fetchHTML(url){
	try{
		//accessing the url (link to the website)
		const response = await fetch(url)
		
		//getting the text of the url
		const txt = await response.text()
		
		//convert the text into an object. This is our final output
		// const page = new DOMParser().parseFromString(txt, 'text/html')
		const page = new jsdom.JSDOM(txt)
		return page
	}
	catch(e){
		return false
	}
}

function getPrice(page){
	const obj = page.window.document.querySelector('.priceValue ')
	let price = obj.textContent
	const priceAsNumber = Number(price.replace(/[^0-9.-]+/g,""))
	return priceAsNumber
}

function checkThreshold(price, threshold){
	if(price > threshold){
		// console.log(`The price is over $${threshold}`)
		return true
	}
	else{
		// console.log(`The price is NOT over $${threshold}`)
		return false
	}
}

function sendMessage(cryptoName, price){
	let msg = `The current price of ${cryptoName} is $${price}`
	api.messages
  		.create({
		     body: msg,
		     from: 'INSERT YOUR TRIAL PHONE NUMBER HERE',
		     to: 'INSERT YOUR OWN PHONE NUMBER (i.e. TO RECEIVE THE TEXTS)'
		})
  		.then(message => console.log(message.sid));
}


//Create an array of crypto names
// const cryptoNameArray = ['bitcoin', 'ethereum', 'cardano', 'ripple']
const cryptoDictionary = {
	'bitcoin': 45000, 
	'ethereum': 6000,
	'cardano': 1.50,
	'ripple': 1
}

for(const cryptoName in cryptoDictionary){
	//Create a template URL where we can switch in our crypto names
	let templateURL = `https://coinmarketcap.com/currencies/${cryptoName}/`

	fetchHTML(templateURL).then((page) => {
		const price = getPrice(page)
		console.log(`The current price of ${cryptoName} is $${price}`)
		if(checkThreshold(price, cryptoDictionary[cryptoName])){
			sendMessage(cryptoName, price)
		}	
	})	
}




