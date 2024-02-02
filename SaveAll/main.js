const Apify = require('apify');
const firebase = require('firebase');

	function extractPreOpenMarket(apiObject, iframeSrc) { // this function extract Nifty Total Market Sectors data from apiObject and then store it into localStorage
		var ApiMainObject = apiObject;
		//var timeStamp = apiObject['timestamp'].split(' ')[0]
		var timeStamp = apiObject['timestamp']
		var Category = ''

		if (iframeSrc.includes('https://www.nseindia.com/api/market-data-pre-open?key=FO') == true) {
			Category = 'FnO';
		}
		if (iframeSrc.includes('https://www.nseindia.com/api/market-data-pre-open?key=ALL') == true) {
			Category = 'ALL';
		}

		var tempObj = {};
		
		var dataArray = []
		if (iframeSrc.includes('https://www.nseindia.com/api/market-data-pre-open?key=FO') == true) {
			for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all Data Arrays
			var alias = apiObject['data'][d] //for short-handing
			var Symbol = alias['metadata']['symbol']
			
			 delete alias['metadata']['chartTodayPath']
			 delete alias['metadata']['symbol']
			delete alias['metadata']['purpose']
			delete alias['metadata']['yearHigh']
			delete alias['metadata']['yearLow']

			tempObj[Symbol] = alias
			//dataArray.push( alias )
			
		} //for Loop ENDS HERE

		}
		else
		{
			for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all Data Arrays
			var alias = apiObject['data'][d] //for short-handing
			var Symbol = alias['metadata']['symbol']
			
			 delete alias['metadata']['chartTodayPath']
			 delete alias['metadata']['symbol']
			delete alias['metadata']['purpose']
			delete alias['metadata']['yearHigh']
			delete alias['metadata']['yearLow']
			
			delete alias['metadata']['marketCap']
			delete alias['detail']['preOpenMarket']['lastUpdateTime']
			delete alias['metadata']['identifier']

			tempObj[Symbol] = alias
			//dataArray.push( alias )
			
			} //for Loop ENDS HERE
		}
		
		
		ApiMainObject["data"] = tempObj
		//apiObject["data"] = dataArray;
		
		var id = "pre_open_market" +"/"+ Category;
	
		return [ ApiMainObject, timeStamp, id ]
	
	}		// extractPreOpenMarket(apiObject, iframeSrc) ENDS HERE

	function extractTradingDates(apiObject, iframeSrc){ // this function extracts previous trading date and then save it into IndexedDB

		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var date = new Date( apiObject[1]['marketCurrentTradingDate'] )
		var dayOfMonth = String(date.getDate());
		if (dayOfMonth.length < 2) {
		  dayOfMonth = '0' + dayOfMonth;
		}
		var currentTradingDate = dayOfMonth +'-'+ months[date.getMonth()] +'-'+ date.getFullYear()
		date =new Date( apiObject[1]['marketPreviousTradingDate'] )
		var dayOfMonth = String(date.getDate());
		if (dayOfMonth.length < 2) {
		  dayOfMonth = '0' + dayOfMonth;
		}
		var previousTradingDate = dayOfMonth +'-'+ months[date.getMonth()] +'-'+ date.getFullYear()
		
		var nextTradingDate =  apiObject[1]['marketNextTradingDate']
		
		//var tradingDates={ "marketCurrentTradingDate":currentTradingDate, "marketPreviousTradingDate":previousTradingDate, "marketNextTradingDate":nextTradingDate }
		var tradingDates = { "currentTradingDate":currentTradingDate, "previousTradingDate":previousTradingDate, "nextTradingDate":nextTradingDate }
		
		var timeStamp = currentTradingDate;
		
		var id = "trading_dates";
	
		return [ tradingDates, timeStamp, id ]
		
		
	} // extractTradingDates(apiObject) function ENDS HERE

	function extractSectorStockNamesData(apiObject, iframeSrc) { // coded on 31-Dec-2022. this function extracts stock names of any given sector and it puts data in database
	//modified on 5 Jan 2023
		
		//var iframeSrc = window.location.href
		var ApiMainObject = {};
		var timeStamp = apiObject['timestamp'].split(' ')[0]
		var indexName = ''
		var sectorName = ''
		var stockNamesArray = []
		
		if (iframeSrc.includes('https://www.nseindia.com/api/market-data-pre-open') == true) { // if iframeSrc is for pre market sector stocks then run this block
			if (iframeSrc.includes('https://www.nseindia.com/api/market-data-pre-open?key=FO') == true) {
				sectorName = 'FnO';
				indexName = 'FnO';
			}
			else if (iframeSrc.includes('https://www.nseindia.com/api/market-data-pre-open?key=BANKNIFTY') == true) {
				sectorName = 'NIFTY BANK';
				indexName = 'NIFTY_BANK';
			}
			else if (iframeSrc.includes('https://www.nseindia.com/api/market-data-pre-open?key=NIFTY') == true) {
				sectorName = 'NIFTY 50';
				indexName = 'NIFTY_50';
			}

			
			for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all Data Arrays
				var Symbol = apiObject['data'][d]['metadata']['symbol']
					stockNamesArray.push(Symbol)
				}
			stockNamesArray = stockNamesArray.sort()

		}
		else if (iframeSrc.includes('https://www.nseindia.com/api/equity-stockIndices?index=SECURITIES%20IN%20F%26O') == true) { // if iframeSrc is for FnO sector stocks then run this block
		
				sectorName = 'FnO';
				indexName = 'FnO';
				
			for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all Data Arrays
				var Symbol = apiObject['data'][d]['symbol']
				if(Symbol.includes('NIFTY') == false)
				{
					stockNamesArray.push(Symbol)
				}
					
				}
			stockNamesArray = stockNamesArray.sort()
		
		}
		else {
			
				sectorName = apiObject['name']
				indexName = apiObject['metadata']['indexName'].replace(/ /g,'_')
			
			for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all Data Arrays
				var Symbol = apiObject['data'][d]['symbol']
				if(Symbol.includes('NIFTY') == false)
				{
					stockNamesArray.push(Symbol)
				}
					
				}
			stockNamesArray = stockNamesArray.sort()
		}
		
		ApiMainObject["sectorName"] = sectorName.replace(/&amp;/g,'&');
		ApiMainObject["Symbols"] = stockNamesArray;

		if( stockNamesArray.length > 1 )
		{
			
			//console.log(ApiMainObject)	
			//return [indexName, ApiMainObject];
		var id = 'sector_stockNames' + '/' + indexName;
		return [ ApiMainObject, timeStamp, id ]
			
		}
		
		
	}		// extractSectorStockNamesData(apiObject) ENDS HERE

	function extractAllIndicesPerformace(apiObject, iframeSrc) { // this function extract All Indices Performance data from apiObject and then store it into localStorage
		
		var ApiMainObject = apiObject;

		var tempObj = {};
		var timeStamp = apiObject['timestamp'].split(' ')[0]
		
		for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all Indices, but here we are justing fetching few indices performances out of all
			var alias = apiObject['data'][d] //for short-handing
			var data = alias //for short-handing
			var Symbol = alias['indexSymbol']
			
			var pb= Number(alias['pb'])
			var pe= Number(alias['pe'])
			var dy= Number(alias['dy'])
			var advances=0
			var declines=0
			var unchanged=0
			if( alias['advances'] == undefined || alias['declines'] == undefined || alias['unchanged'] == undefined )
			{	}
			else {
				advances=Number( alias['advances'] )
				declines=Number( alias['declines'] )
				unchanged=Number( alias['unchanged']  )
			}
		
		//console.log(alias['key'], Symbol)
			data['advances'] = advances
			data['declines'] = declines
			data['unchanged'] = unchanged
			
			data['pe'] = pe
			data['pb'] = pb
			data['dy'] = dy
			
			
			
			//if (alias['key'] == 'BROAD MARKET INDICES' && Symbol == 'NIFTY 50' || alias['key'] == 'BROAD MARKET INDICES' && Symbol == 'INDIA VIX') { //fetch Data of 'INDIA VIX' and 'NIFTY 50' from 'BROAD MARKET INDICES' index performance
			if ( alias['key'] == 'BROAD MARKET INDICES'  ) { //fetch Data of 'INDIA VIX' and 'NIFTY 50' from 'BROAD MARKET INDICES' index performance
			
				{
			delete data['chart30dPath']
			delete data['chart365dPath']
			delete data['date30dAgo']
			delete data['date365dAgo']
			delete data['indexSymbol']
			delete data['key']
			delete data['oneMonthAgo']
			delete data['oneWeekAgo']
			delete data['oneYearAgo']
			delete data['perChange30d']
			delete data['perChange365d']
			delete data['yearHigh']
			delete data['yearLow']
			delete data['chartTodayPath']
			
			}
				tempObj[Symbol] = data
			}
			else if (alias['key'] == 'SECTORAL INDICES') {  //fetch Data of all Sectors/index from 'SECTORAL INDICES' index performance
				//tempObj[Symbol] = [alias["last"], alias["low"], alias["high"], alias["open"], alias["percentChange"], alias["previousClose"], alias["variation"], pb, pe, advances, declines, unchanged ]
				{
			delete data['chart30dPath']
			delete data['chart365dPath']
			delete data['date30dAgo']
			delete data['date365dAgo']
			delete data['indexSymbol']
			delete data['key']
			delete data['oneMonthAgo']
			delete data['oneWeekAgo']
			delete data['oneYearAgo']
			delete data['perChange30d']
			delete data['perChange365d']
			delete data['yearHigh']
			delete data['yearLow']
			delete data['chartTodayPath']
			
			}
				tempObj[Symbol] = data
			}
			else if ( Symbol == 'NIFTY INFRA' || Symbol == 'NIFTY ENERGY' || Symbol == 'NIFTY COMMODITIES' || Symbol == 'NIFTY INDIA CONSUMPTION' || Symbol == 'NIFTY PSE'  || Symbol == 'NIFTY SERV SECTOR' ) { //fetch Data of specific index
				//tempObj[Symbol] = [alias["last"], alias["low"], alias["high"], alias["open"], alias["percentChange"], alias["previousClose"], alias["variation"], pb, pe, advances, declines, unchanged ]
				{
			delete data['chart30dPath']
			delete data['chart365dPath']
			delete data['date30dAgo']
			delete data['date365dAgo']
			delete data['indexSymbol']
			delete data['key']
			delete data['oneMonthAgo']
			delete data['oneWeekAgo']
			delete data['oneYearAgo']
			delete data['perChange30d']
			delete data['perChange365d']
			delete data['yearHigh']
			delete data['yearLow']
			delete data['chartTodayPath']
			
			}
			tempObj[Symbol] = data
			}
			
			
			
		} //for Loop ENDS HERE


		
		
		delete ApiMainObject['dates'];
		delete ApiMainObject['date30dAgo'];
		delete ApiMainObject['date365dAgo'];
		
		ApiMainObject['data'] = tempObj;
	
			var id = "index_performace";
			
		//console.log( ApiMainObject )
		return [ApiMainObject, timeStamp, id]

	}		// extractAllIndicesPerformace(apiObject) ENDS HERE

	function extractStockFuture(apiObject, iframeSrc) { // this function extract Stock Future data from apiObject and then store it into localStorage
	
		var ApiMainObject = apiObject;

		var timeStamp = apiObject['timestamp'].split(' ')[0]

		for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all Indices, but here we are justing fetching few indices performances out of all
			//var alias = apiObject['data'][d] //for short-handing
			delete ApiMainObject['data'][d]['meta'];
			delete ApiMainObject['data'][d]['optionType'];
			delete ApiMainObject['data'][d]['strikePrice'];

		} //for Loop ENDS HERE


		delete ApiMainObject['marketStatus'];
		
		var id = "stock_futures"
	
		return [ ApiMainObject, timeStamp, id ]

	}		// extractStockFuture(apiObject) ENDS HERE

	function extractMostActiveUnderlying(apiObject, iframeSrc) { // this function extract Most Active Underlying/Stocks/Indices data from apiObject and then store it into localStorage

		var ApiMainObject = apiObject;

		var tempObj = {};
		var timeStamp = apiObject['timestamp'].split(' ')[0]

		var id = "most_active_underlying"
		
		return [ ApiMainObject, timeStamp, id ]

	} // extractMostActiveUnderlying(apiObject) ENDS HERE

	function extractMostActiveFutureContracts(apiObject, iframeSrc) { // this function extract Most Active Future Contracts data from apiObject and then store it into localStorage

		var ApiMainObject = apiObject;
		
		ApiMainObject ["timeStamp"] = apiObject['volume']['timestamp']
		
		var tempObj = {};
		var timeStamp = apiObject['volume']['timestamp'].split(' ')[0]
	
		
		for (var d = 0; d < apiObject['value']['data'].length; d++) { // loop for accessing all Indices, but here we are justing fetching few indices performances out of all
			//var alias = apiObject['data'][d] //for short-handing
			delete ApiMainObject['value']['data'][d]['optionType'];
			delete ApiMainObject['value']['data'][d]['strikePrice'];

		} //for Loop ENDS HERE
		
		for (var d = 0; d < apiObject['volume']['data'].length; d++) { // loop for accessing all Indices, but here we are justing fetching few indices performances out of all
			//var alias = apiObject['data'][d] //for short-handing
			delete ApiMainObject['volume']['data'][d]['optionType'];
			delete ApiMainObject['volume']['data'][d]['strikePrice'];

		} //for Loop ENDS HERE
		
		delete ApiMainObject['value']['timestamp']
		delete ApiMainObject['volume']['timestamp']
		
		
		
		var id = "most_active_future_contracts"
	
		return [ ApiMainObject, timeStamp, id ]

	}		// extractMostActiveFutureContracts(apiObject) ENDS HERE

	function extractStockOptions(apiObject, iframeSrc) { // this function extract Stock Options data from apiObject and then store it into localStorage
		var ApiMainObject = apiObject;

		var timeStamp = apiObject['timestamp'].split(' ')[0]

		for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all Indices, but here we are justing fetching few indices performances out of all
			//var alias = apiObject['data'][d] //for short-handing
			delete ApiMainObject['data'][d]['meta'];
		} //for Loop ENDS HERE


		delete ApiMainObject['marketStatus'];
		
		var id = "stock_options";
	
		return [ ApiMainObject, timeStamp, id ]


	}		// extractMostActiveFutureContracts(apiObject) ENDS HERE

	function extractSpurtsInOIByUnderlyings(apiObject, iframeSrc) { // this function extracts Spurts in Open Interest by Underlyings and then save it into IndexedDB
		
		var ApiMainObject = apiObject;

		var timeStamp = apiObject['timestamp'].split(' ')[0]
		var dataArray = []
		for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all Indices, but here we are justing fetching few indices performances out of all
			var alias = apiObject['data'][d] //for short-handing
			var Symbol = alias['symbol']
			if( Symbol != "-" )
			{
				dataArray.push( alias )
			}
		} //for Loop ENDS HERE


		ApiMainObject["data"] = dataArray
		var id = "spurts_in_open_interest_by_underlyings"
		
		return [ ApiMainObject, timeStamp, id ]
	
	} // extractSpurtsInOIByUnderlyings(apiObject ENDS HERE
	
	function extractSpurtsInOIByContracts(apiObject, iframeSrc){ // this function extracts Spurts in Open Interest by Contracts and then save it into IndexedDB

		var ApiMainObject = apiObject;

		var tempObj = {};
		var timeStamp = apiObject['timestamp'].split(' ')[0]

		for ( var dataArr of apiObject['data']) { 
    
		for ( var slide_rise_labels in dataArr ) 
		{
			var alias = dataArr[ slide_rise_labels ]
			tempObj[ slide_rise_labels ] = alias
		}
		}	


		ApiMainObject['data'] = tempObj
		
		delete ApiMainObject['currTradingDate'];
		delete ApiMainObject['prevTradingDate'];
		
		var id = "spurts_in_open_interest_by_contracts"
		
		return [ ApiMainObject, timeStamp, id ]
	} // extractSpurtsInOIByContracts(apiObject) function ENDS HERE

	function extractMostActiveOptionContracts(apiObject, iframeSrc) { // this function extract Most Active Option Contracts data from apiObject and then store it into localStorage
				
		var ApiMainObject = apiObject;
		
		ApiMainObject ["timeStamp"] = apiObject['volume']['timestamp']
	
		var timeStamp = apiObject['volume']['timestamp'].split(' ')[0]
	
		delete ApiMainObject['value']['timestamp']
		delete ApiMainObject['volume']['timestamp']
		
	
		var id = "most_active_option_contracts"
	
		return [ ApiMainObject, timeStamp, id ]
		

	}		// extractMostActiveOptionContracts(apiObject) ENDS HERE

	function extractMostActiveContracts(apiObject, iframeSrc) { // this function extract Most Active Contracts data from apiObject and then store it into localStorage
			
		var ApiMainObject = apiObject;
		
		ApiMainObject ["timeStamp"] = apiObject['volume']['timestamp']
	
		var timeStamp = apiObject['volume']['timestamp'].split(' ')[0]
	
		delete ApiMainObject['value']['timestamp']
		delete ApiMainObject['volume']['timestamp']
		
	
		var id = "most_active_contracts"
	
		return [ ApiMainObject, timeStamp, id ]

	}		// extractMostActiveContracts(apiObject) ENDS HERE

	function extractMostActiveCalls(apiObject, iframeSrc) { // this function extract Most Active Contracts data from apiObject and then store it into localStorage

		var ApiMainObject = apiObject;
		
		ApiMainObject ["timeStamp"] = apiObject['volume']['timestamp']
	
		var timeStamp = apiObject['volume']['timestamp'].split(' ')[0]
	
		delete ApiMainObject['value']['timestamp']
		delete ApiMainObject['volume']['timestamp']
		
	
		var id = "most_active_calls"
	
		return [ ApiMainObject, timeStamp, id ]

	}		// extractMostActiveCalls(apiObject) ENDS HERE

	function extractMostActivePuts(apiObject, iframeSrc) { // this function extract Most Active Contracts data from apiObject and then store it into localStorage
	
		var ApiMainObject = apiObject;
		
		ApiMainObject ["timeStamp"] = apiObject['volume']['timestamp']
	
		var timeStamp = apiObject['volume']['timestamp'].split(' ')[0]
	
		delete ApiMainObject['value']['timestamp']
		delete ApiMainObject['volume']['timestamp']
		
	
		var id = "most_active_puts"
	
		return [ ApiMainObject, timeStamp, id ]
		
	}		// extractMostActivePuts(apiObject) ENDS HERE


	function extractSecuritiesInFnO( apiObject, iframeSrc ) { // this function extract FnO's Securities and out of which it just pick only two stocks (AARTIIND, MOTHERSON) and add these two stocks in nifty_total_market's last entry 

		var ApiMainObject = apiObject;
		
		var timeStamp = apiObject['timestamp'].split(' ')[0]
	
		ApiMainObject['advances']=Number( apiObject['advance']['advances'] )
		ApiMainObject['declines']=Number( apiObject['advance']['declines'] )
		ApiMainObject['unchanged']=Number( apiObject['advance']['unchanged'] )
		
		var dataObj = {};
		
		for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all FnO stocks
			var alias = apiObject['data'][d] //for short-handing
			var Symbol = alias['symbol']
			
			alias['dayHigh'] =  Number( alias['dayHigh'] )
			alias['dayLow'] =  Number( alias['dayLow'] )
			alias['lastPrice'] =  Number( alias['lastPrice'] )
			alias['open'] =  Number( alias['open'] )
			alias['previousClose'] =  Number( alias['previousClose'] )
			
			
			delete alias['chart30dPath']
			delete alias['chart365dPath']
			delete alias['chartTodayPath']
			delete alias['date30dAgo']
			delete alias['date365dAgo']
			delete alias['identifier']
			delete alias['lastUpdateTime']
			delete alias['meta']
			delete alias['nearWKH']
			delete alias['nearWKL']
			delete alias['perChange30d']
			delete alias['perChange365d']
			delete alias['series']
			delete alias['symbol']
			delete alias['yearHigh']
			delete alias['yearLow']
			
			
			dataObj [ Symbol ] = alias
		
		} //for Loop ENDS HERE
		
		ApiMainObject['data'] = dataObj
		
		delete ApiMainObject['date30dAgo']
		delete ApiMainObject['date365dAgo']
		delete ApiMainObject['marketStatus']
		delete ApiMainObject['metadata']
		delete ApiMainObject['name']
		delete ApiMainObject['advance']
	
		//var id ='nifty_total_market'
		var id ='equity_market'
	
			return [ ApiMainObject, timeStamp, id ]
	}		// extractSecuritiesInFnO(apiObject) ENDS HERE

	function extractNiftyTotalMarket(apiObject, iframeSrc) { // this function extract Nifty Total Market Sectors data from apiObject and then store it into localStorage
	
	
		var ApiMainObject = apiObject;
		
		var timeStamp = apiObject['timestamp'].split(' ')[0]
	
		ApiMainObject['advances']=Number( apiObject['advance']['advances'] )
		ApiMainObject['declines']=Number( apiObject['advance']['declines'] )
		ApiMainObject['unchanged']=Number( apiObject['advance']['unchanged'] )
		
		var dataObj = {};
		
		for (var d = 0; d < apiObject['data'].length; d++) { // loop for accessing all FnO stocks
			var alias = apiObject['data'][d] //for short-handing
			var Symbol = alias['symbol']
			
			alias['dayHigh'] =  Number( alias['dayHigh'] )
			alias['dayLow'] =  Number( alias['dayLow'] )
			alias['lastPrice'] =  Number( alias['lastPrice'] )
			alias['open'] =  Number( alias['open'] )
			alias['previousClose'] =  Number( alias['previousClose'] )
			
			
			delete alias['chart30dPath']
			delete alias['chart365dPath']
			delete alias['chartTodayPath']
			delete alias['date30dAgo']
			delete alias['date365dAgo']
			delete alias['identifier']
			delete alias['lastUpdateTime']
			delete alias['meta']
			delete alias['nearWKH']
			delete alias['nearWKL']
			delete alias['perChange30d']
			delete alias['perChange365d']
			delete alias['priority']
			delete alias['series']
			delete alias['symbol']
			delete alias['yearHigh']
			delete alias['yearLow']
			
			
			dataObj [ Symbol ] = alias
		
		} //for Loop ENDS HERE
		
		ApiMainObject['data'] = dataObj
		
		delete ApiMainObject['date30dAgo']
		delete ApiMainObject['date365dAgo']
		delete ApiMainObject['marketStatus']
		delete ApiMainObject['metadata']
		delete ApiMainObject['name']
		delete ApiMainObject['advance']
	
		//var id ='nifty_total_market'
		var id ='equity_market'
	
		return [ ApiMainObject, timeStamp, id ]
	

	}		// extractNiftyTotalMarket(apiObject) ENDS HERE



	function extractOptionChainData(optionChainObject, iframeSrc) {
		//this function will extract specific Data from optionChainObject. this object may be of any Index or Equity.
		
		var optionChainDataObject = {};
		var returnedDataArray;
		returnedDataArray = extractOptionChainDataByExpiry(optionChainObject) // this function stores option chain data by current expiry
		optionChainDataObject[ returnedDataArray[1] ] = returnedDataArray[0] 
		//if (Date.parse(new Date().toISOString().slice(0, 10).replace(/-/g, '/')) == Date.parse(optionChainObject['records']['expiryDates'][0]))  // if current date is equals to exipryDate then also store next expiry Data
		{
				var nextExpiryFilteredDataObject = {
				"filtered": {},
				"records": {}
			}
			var nextExpiryFilteredDataArrays = []
			var nextExpirtDate = optionChainObject['records']['expiryDates'][1]

			var CEtotOI = 0, CEtotVol = 0;
			var PEtotOI = 0, PEtotVol = 0;
			for (var d in optionChainObject['records']['data']) {
				var recordData = optionChainObject['records']['data'][d]
				if (recordData['expiryDate'] == nextExpirtDate) {
					nextExpiryFilteredDataArrays.push(recordData)
					if (recordData['CE'] != undefined) {
						CEtotOI += recordData['CE']['openInterest']
						CEtotVol += recordData['CE']['totalTradedVolume']
					}

					if (recordData['PE'] != undefined) {
						PEtotOI += recordData['PE']['openInterest']
						PEtotVol += recordData['PE']['totalTradedVolume']
					}

				}

			}
			nextExpiryFilteredDataObject["filtered"]["data"] = nextExpiryFilteredDataArrays
			nextExpiryFilteredDataObject["filtered"]["CE"] = { "totOI": CEtotOI, "totVol": CEtotVol }
			nextExpiryFilteredDataObject["filtered"]["PE"] = { "totOI": PEtotOI, "totVol": PEtotVol }
			nextExpiryFilteredDataObject["records"]["timestamp"] = optionChainObject['records']['timestamp']

			returnedDataArray = extractOptionChainDataByExpiry(nextExpiryFilteredDataObject) // here this function is called to stores option chain data for next expiry
			optionChainDataObject[ returnedDataArray[1] ] = returnedDataArray[0] 
		
		} //if (Date.parse(new Date().toISOString().slice(0, 10).replace(/-/g, '/')) == Date.parse(apiObject['records']['expiryDates'][0])) ENDS HERE
		optionChainDataObject[ "timestamp" ] = returnedDataArray[2] 
		return [ optionChainDataObject, returnedDataArray[2], returnedDataArray[3] ]

	} //extractOptionChainData(optionChainObject)  Function ENDS HERE

	function extractOptionChainDataByExpiry(optionChainObject) {
		//this function will extract specific Data from optionChainObject. this object may be of any Index or Equity.
		// 
		//console.log(optionChainObject["filtered"]["data"][0]['CE'])
		//await getData("currentDay")
		//await sleep(1500)
		var highest_PUT_OI_Change = "0,0", highest_Call_OI_Change = "0,0", highest_PUT_OI = "0,0", highest_Call_OI = "0,0";

		var ApiMainObject = {};
		//ApiMainObject = JSON.parse(localStorage.getItem("NSE_APIs_Data"));
		//ApiMainObject = JSON.parse(returnedIndexedDBData);

		var totalOICEChange = 0, totalOIPEChange = 0; //these variables are for Addition intraday change in OI of all strike prices for CE, PE
		var totalCE = optionChainObject["filtered"]["CE"]["totOI"]
		var totalCEVol = optionChainObject["filtered"]["CE"]["totVol"]

		var totalPE = optionChainObject["filtered"]["PE"]["totOI"]
		var totalPEVol = optionChainObject["filtered"]["PE"]["totVol"]

		var strikePriceObject, Symbol, expiryDate, timeStamp, strikePrice, spotPrice;

		//Symbol = optionChainObject["filtered"]["data"][0]['CE']['underlying']  //get index or stock name from 1st strike price's data
		//spotPrice = optionChainObject["filtered"]["data"][0]['CE']['underlyingValue']	//get spot price of index or stock name from 1st strike price's data

		if (optionChainObject["filtered"]["data"][0]["CE"] != undefined) { //if there is not CE object in strikePriceObject then set arrayCE to all 0s and add 0 into totalOICEChange
			Symbol = optionChainObject["filtered"]["data"][0]['CE']['underlying']  //get index or stock name from 1st strike price's data
			spotPrice = optionChainObject["filtered"]["data"][0]['CE']['underlyingValue']	//get spot price of index or stock name from 1st strike price's data
		}
		else if (optionChainObject["filtered"]["data"][0]["PE"] != undefined) { //if there is CE object in strikePriceObject then fetch data from CE object and set arrayCE as array and add CE's changeinOpenInterest into totalOICEChange
			Symbol = optionChainObject["filtered"]["data"][0]['PE']['underlying']  //get index or stock name from 1st strike price's data
			spotPrice = optionChainObject["filtered"]["data"][0]['PE']['underlyingValue']	//get spot price of index or stock name from 1st strike price's data
		}

		for (var i = 0; i < optionChainObject["filtered"]['data'].length; i++) // loop fetching all strike prices
		{

			strikePriceObject = optionChainObject["filtered"]["data"][i]    //get ith array's Strike price object
			//Symbol=strikePriceObject['CE']['underlying']
			expiryDate = strikePriceObject['expiryDate']
			//timeStamp = optionChainObject['records']['timestamp'].split(' ')[0]
			timeStamp = optionChainObject['records']['timestamp']
			strikePrice = strikePriceObject['strikePrice']
			//spotPrice=strikePriceObject['CE']['underlyingValue']
			if (strikePriceObject["CE"] == undefined) { //if there is not CE object in strikePriceObject then set arrayCE to all 0s and add 0 into totalOICEChange
				//var arrayCE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
				totalOICEChange += 0
			
			}
			else { //if there is CE object in strikePriceObject then fetch data from CE object and set arrayCE as array and add CE's changeinOpenInterest into totalOICEChange
				//var arrayCE = [ strikePriceObject["CE"]["openInterest"], strikePriceObject["CE"]["changeinOpenInterest"], strikePriceObject["CE"]["totalTradedVolume"], strikePriceObject["CE"]["impliedVolatility"], strikePriceObject["CE"]["lastPrice"], strikePriceObject["CE"]["change"], strikePriceObject["CE"]["totalBuyQuantity"], strikePriceObject["CE"]["totalSellQuantity"], strikePriceObject["CE"]["askPrice"], strikePriceObject["CE"]["askQty"], strikePriceObject["CE"]["bidprice"], strikePriceObject["CE"]["bidQty"], strikePriceObject["CE"]["pChange"], strikePriceObject["CE"]["pchangeinOpenInterest"] ]
				totalOICEChange += strikePriceObject["CE"]["changeinOpenInterest"]
				
				delete strikePriceObject['CE']['expiryDate']
			}


			if (strikePriceObject["PE"] == undefined) { //if there is not PE object in strikePriceObject then set arrayPE to all 0s and add 0 into totalOIPEChange
				//var arrayPE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
				totalOIPEChange += 0
			}
			else { //if there is PE object in strikePriceObject then fetch data from PE object and set arrayPE as array and add PE's changeinOpenInterest into totalOIPEChange
				//var arrayPE = [ strikePriceObject["PE"]["openInterest"], strikePriceObject["PE"]["changeinOpenInterest"], strikePriceObject["PE"]["totalTradedVolume"], strikePriceObject["PE"]["impliedVolatility"], strikePriceObject["PE"]["lastPrice"], strikePriceObject["PE"]["change"], strikePriceObject["PE"]["totalBuyQuantity"], strikePriceObject["PE"]["totalSellQuantity"], strikePriceObject["PE"]["askPrice"], strikePriceObject["PE"]["askQty"], strikePriceObject["PE"]["bidprice"], strikePriceObject["PE"]["bidQty"], strikePriceObject["PE"]["pChange"], strikePriceObject["PE"]["pchangeinOpenInterest"] ]
				totalOIPEChange += strikePriceObject["PE"]["changeinOpenInterest"]
				
				delete strikePriceObject['PE']['expiryDate']
			}
			
				
				
			delete strikePriceObject['strikePrice']
			delete strikePriceObject['expiryDate']
				
			if (ApiMainObject[strikePrice] == undefined ) //if strikePrice does not exit in 	ApiMainObject["option_chain_data"][Symbol][expiryDate][timeStamp] 	 then add it with empty entry
			{
				ApiMainObject[strikePrice] = {};
				ApiMainObject[strikePrice] = strikePriceObject
				
				
				//ApiMainObject[strikePrice]["CE"] = arrayCE
				//ApiMainObject[strikePrice]["PE"] = arrayPE		
			}
						
		}	//	for(var i=0;i<optionChainObject["filtered"]['data'].length;i++) // for loop Ends here

		
		ApiMainObject["totalCEPE"] = {
			"totalOICE" : totalCE,
			"totalCEVol" : totalCEVol,
			"totalOIPE" : totalPE,
			"totalPEVol" : totalPEVol,
			"intradayOICEChange" : totalOICEChange,
			"intradayOIPEChange" : totalOIPEChange,
		}
		
		ApiMainObject["SpotPrice"] = spotPrice;
		ApiMainObject["expiryDate"] = expiryDate;
		
		var id = "option_chain_data" + "/"+ Symbol
		
		//console.log( [ ApiMainObject, expiryDate, timeStamp, id ] )
		return [ ApiMainObject, expiryDate, timeStamp, id ] 

	} //extractOptionChainData(optionChainObject)  Function ENDS HERE


	function extractIntradayGraphData(apiObject, iframeSrc) { // this function extracts intraday chart data from apiObject and then store it
	//added on 18-Feb-2023
	
		var ApiMainObject = {};
		var tempObj = {};
		
		var options = { 
		  timeZone: 'Asia/Kolkata', 
		  day: '2-digit', 
		  month: 'short',
		  year: 'numeric',
		};

		
		//var timeStamp = new Date( apiObject['grapthData'][0][0] ).toLocaleString('en-IN', options);
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		
		var date = new Date( apiObject['grapthData'][0][0] )
		var dayOfMonth = String(date.getDate());
		if (dayOfMonth.length < 2) {
		  dayOfMonth = '0' + dayOfMonth;
		}
		var timeStamp = dayOfMonth +'-'+ months[date.getMonth()] +'-'+ date.getFullYear()
	
		for (var d = 0; d < apiObject['grapthData'].length; d++) { // loop for accessing all stocks of 752 stocks
			var alias = apiObject['grapthData'][d] //for short-handing
			var DateTimeInMilliseconds = alias[0] // DateTime in milliseconds
			var Price = alias[1] // price 
			tempObj [ DateTimeInMilliseconds ] = Price
		} //for Loop ENDS HERE


		ApiMainObject["name"] = apiObject['name']
		ApiMainObject["identifier"] = apiObject['identifier']
		ApiMainObject["closePrice"] = apiObject['closePrice']
		ApiMainObject["graphData"] = tempObj
		
		
		var id="intraday_chart_data" + "/"+apiObject['name']
		
		
		return [ ApiMainObject, timeStamp, id ]

	}		// extractIntradayGraphData(apiObject, iframeSrc) ENDS HERE




	async function handleData(apiObject, iframeSrc, db, createdAtTime, currentSystemDate) { // this function first handles localStorages for current NSE_APIs_Data, PreviousDay_NSE_APIs_Data. and then redirect iframe's JSON object to specified function according to iframe src

		var ApiMainObject = {};
		var returnedDataArray ;
		var pathToStoreData;
		var pathOfDocument;
		var dataObj;
		
		var options = { 
		  timeZone: 'Asia/Kolkata', 
		  month: 'long',
		  year: 'numeric',
		};

	
		if ( iframeSrc.includes("api/allMarketStatus") == true ) {
			returnedDataArray =  extractTradingDates(apiObject)
			pathOfDocument = returnedDataArray[2] +'/marketStatus' ;
		}
		else if (iframeSrc.includes("#OnlyForSectorsStocks") == true) {	//	if current iframe's src is for fetching only stockname of sectors with #OnlyForSectorsStocks, then redirect to extractSectorStockNamesData(apiObject) function
				returnedDataArray =  extractSectorStockNamesData(apiObject, iframeSrc )
				pathOfDocument = returnedDataArray[2] ;
				
					onlyForSectorsStocksObj["data"][returnedDataArray[2]] = {
						"data": returnedDataArray[0]
					}
					onlyForSectorsStocksObj["data"][returnedDataArray[2]]["timeStamp"] = returnedDataArray[1]
					onlyForSectorsStocksObj["data"][returnedDataArray[2]]["id"] = returnedDataArray[2]
					onlyForSectorsStocksObj['dates'].push( returnedDataArray[1] )
					
		}
		else if (iframeSrc.includes("api/option-chain-indices") == true || iframeSrc.includes("api/option-chain-equities") == true) {	//	if current iframe's src is for index or equity, then redirect to extractOptionChainData(apiObject) function
				returnedDataArray =  extractOptionChainData(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime + '/' +createdAtTime;

			}
			else if (iframeSrc.includes("api/live-analysis-variations") == true) {	//	if current iframe's src is for gainers or loosers, then redirect to extractGainersLoosersData(apiObject, iframeSrc) function
				//returnedDataArray =  extractGainersLoosersData(apiObject, iframeSrc)
				
			}
			else if (iframeSrc.includes("api/allIndices") == true) {	//	if current iframe's src is for index performance, then redirect to extractAllIndicesPerformace(apiObject) function
				returnedDataArray =  extractAllIndicesPerformace(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			else if (iframeSrc.includes("api/liveEquity-derivatives?index=stock_fut") == true) {	//	if current iframe's src is for stock_fut , then redirect to extractStockFuture(apiObject) function
				returnedDataArray =  extractStockFuture(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/live-analysis-most-active-underlying") == true) {	//	if current iframe's src is for stock_fut , then redirect to extractStockFuture(apiObject) function
				returnedDataArray =  extractMostActiveUnderlying(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/snapshot-derivatives-equity?index=futures") == true) {	//	if current iframe's src is for stock_fut , then redirect to extractStockFuture(apiObject) function
				returnedDataArray =  extractMostActiveFutureContracts(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/liveEquity-derivatives?index=stock_opt") == true) {	//	if current iframe's src is for stock_fut , then redirect to extractStockFuture(apiObject) function
				returnedDataArray =  extractStockOptions(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			//else if (iframeSrc.includes("https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20TOTAL%20MARKET") == true) {	//	if current iframe's src is for stock_fut , then redirect to extractStockFuture(apiObject) function
			else if (iframeSrc.includes("https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20TOTAL%20MARKET") == true) {	//	if current iframe's src is for stock_fut , then redirect to extractStockFuture(apiObject) function
				returnedDataArray =  extractNiftyTotalMarket(apiObject, iframeSrc)
				//returnedDataArray =  extractSecuritiesInFnO( apiObject, iframeSrc )
				
					
				if( Object.keys(equityData).length==0 )
				{
					equityData["data"] = returnedDataArray[0]
					equityData["timeStamp"] = returnedDataArray[1]
					equityData["id"] = returnedDataArray[2]
					equityData["alreadySavedData"] = "NIFTY%20TOTAL%20MARKET"
				}
				else
				{
					var alias = returnedDataArray[0]["data"]
					for( var Symbol in alias )
					{
						if( equityData["data"]["data"][Symbol]==undefined )
						{
							equityData["data"]["data"][Symbol] = alias[Symbol]
						}
						
					}
					
					
					if( equityData["alreadySavedData"] == "SECURITIES%20IN%20F%26O" )
					{
						equityData["data"]["advances"] = returnedDataArray[0]["advances"]
						equityData["data"]["declines"] = returnedDataArray[0]["declines"]
						equityData["data"]["unchanged"] = returnedDataArray[0]["unchanged"]
					}
				}
				
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
				//console.log("equityData", equityData)
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/equity-stockIndices?index=SECURITIES%20IN%20F%26O") == true) {	//	if current iframe's src is for stock_fut , then redirect to extractStockFuture(apiObject) function
				returnedDataArray =  extractSecuritiesInFnO(apiObject, iframeSrc)
				//returnedDataArray =  extractNiftyTotalMarket(apiObject, iframeSrc)
				
				if( Object.keys(equityData).length==0 )
				{
					equityData["data"] = returnedDataArray[0]
					equityData["timeStamp"] = returnedDataArray[1]
					equityData["id"] = returnedDataArray[2]
					equityData["alreadySavedData"] = "SECURITIES%20IN%20F%26O"
				}
				else
				{
					var alias = returnedDataArray[0]["data"]
					for( var Symbol in alias )
					{
						if( equityData["data"]["data"][Symbol]==undefined )
						{
							equityData["data"]["data"][Symbol] = alias[Symbol]
						}
						
					}
					
				}
				
				//pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
				pathOfDocument = returnedDataArray[2] + '/FnO/' +createdAtTime+ '/' +createdAtTime;
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/market-data-pre-open") == true) {	//	if current iframe's src is for pre open market then redirect to extractPreOpenMarket(apiObject, iframeSrc) function
				returnedDataArray =  extractPreOpenMarket(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime + '/' +createdAtTime;
				//pathOfDocument = returnedDataArray[2] + '/' +( returnedDataArray[1].split(' ')[1] ) + '/' +( returnedDataArray[1].split(' ')[1] );
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/live-analysis-oi-spurts-underlyings") == true) {	//	if current iframe's src is for stock_fut , then redirect to extractStockFuture(apiObject) function
				returnedDataArray =  extractSpurtsInOIByUnderlyings(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/live-analysis-oi-spurts-contracts") == true) {	//	if current iframe's src is for stock_fut , then redirect to extractStockFuture(apiObject) function
				returnedDataArray =  extractSpurtsInOIByContracts(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/snapshot-derivatives-equity?index=options") == true) {	//	if current iframe's src is for most active options , then redirect to extractMostActiveOptionContracts(apiObject) function
				returnedDataArray =  extractMostActiveOptionContracts(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/snapshot-derivatives-equity?index=contracts") == true) {	//	if current iframe's src is for most active contracts , then redirect to extractMostActiveContracts(apiObject) function
				returnedDataArray =  extractMostActiveContracts(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/snapshot-derivatives-equity?index=calls") == true) {	//	if current iframe's src is for most active calls , then redirect to extractMostActiveCalls(apiObject) function
				returnedDataArray =  extractMostActiveCalls(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/snapshot-derivatives-equity?index=puts") == true) {	//	if current iframe's src is for most active puts, then redirect to extractMostActivePuts(apiObject) function
				returnedDataArray =  extractMostActivePuts(apiObject, iframeSrc)
				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
			}
			
			else if (iframeSrc.includes("https://www.nseindia.com/api/chart-databyindex?index=") == true) {	//	if current iframe's src is for graph chart data, then redirect to extractIntradayGraphData(apiObject, iframeSrc) function
				returnedDataArray =  extractIntradayGraphData(apiObject, iframeSrc) // added on 18-Feb-2023
				pathOfDocument = returnedDataArray[2] ;
			}
			
			//April 2023/26-Apr-2023/sector_stockNames/NIFTY_BANK/22:21:16 has
			var monthYear = new Date( returnedDataArray[1] ).toLocaleString('en-IN', options);
			//pathToStoreData = monthYear +'/'+ returnedDataArray[1] + '/' + returnedDataArray[2] + '/' +createdAtTime;
			
			if ( iframeSrc.includes("https://www.nseindia.com/api/market-data-pre-open") == true || iframeSrc.includes("api/option-chain-indices") == true || iframeSrc.includes("api/option-chain-equities") == true ) 
			{
				pathToStoreData = monthYear +'/'+ returnedDataArray[1].split(' ')[0] + '/' + pathOfDocument ;
				
				dataObj={
				"data": JSON.stringify(returnedDataArray[0])
				}
				
			}
			else if ( iframeSrc.includes("api/allMarketStatus") == true ) {
				pathToStoreData = monthYear +'/'+ returnedDataArray[1]
				
				dataObj={
				//[ returnedDataArray[2] ]: JSON.stringify(returnedDataArray[0])
				[ returnedDataArray[2] ]: (returnedDataArray[0])
				}
			}
			else
			{
				pathToStoreData = monthYear +'/'+ returnedDataArray[1] + '/' + pathOfDocument ;
				
				dataObj={
				"data": JSON.stringify(returnedDataArray[0])
				}
			}
			
			/*
			dataObj={
				"data": JSON.stringify(returnedDataArray[0])
			}
			*/
			
			console.log( JSON.stringify(returnedDataArray[0]).length )
			
			var nseDate = pathToStoreData.split(/\//)[1]
			
			if( Date.parse(nseDate) == Date.parse(currentSystemDate) || iframeSrc.includes("#OnlyForSectorsStocks") == true )
			{
			if  (iframeSrc.includes("api/option-chain-indices") == true || iframeSrc.includes("api/option-chain-equities") == true) 
			{
				//pathToStoreData = monthYear +'/'+ returnedDataArray[1].split(' ')[0] + '/' + pathOfDocument ;
				
				//docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				docPathForIndexObj [ pathToStoreData ] = {
					pathOfDocument:pathOfDocument,
					//expiryDates: Object.keys( returnedDataArray[0] )
					expiryDates: Object.keys( returnedDataArray[0] ).filter(item => item !== 'timestamp')
				}				
				await db.doc( pathToStoreData ).set( dataObj ); 
				
	
				var symbol =  returnedDataArray[2] .split("/")[1]
				if( symbol=="NIFTY" )
					symbol="NIFTY 50" 
				else if( symbol=="FINNIFTY" )
					symbol="NIFTY FIN SERVICE" 
				else if( symbol=="BANKNIFTY" )
					symbol="NIFTY BANK" 
				else if( symbol=="MIDCPNIFTY" )
					symbol="NIFTY MID SELECT" 
	
				pathOfDocument = "intraday_chart_data" + "/"+symbol
				pathToStoreData = monthYear +'/'+ returnedDataArray[1].split(' ')[0] + '/' + pathOfDocument ;
				
				//var fieldPath = 'totalCEPEOIData.'+createdAtTime+'_'+( returnedDataArray[1].split(' ')[1] )
				var firstNestedFieldName = 'totalCEPE_OIData'
				var secondNestedFieldName = createdAtTime+'_'+( returnedDataArray[1].split(' ')[1] )
				//var fieldPath = 'totalCEPEOIData.'+createdAtTime+'_'+( returnedDataArray[1].split(' ')[1] )
				var fieldPath = firstNestedFieldName+'.'+ secondNestedFieldName
				//var fieldPath = 'totalCEPEOIData.time.test'
				var totalCEPEData = {};
								
								
				var totalCEPEData = {};
				var returnedData = returnedDataArray[0] // option chain all data 
				for(var expiry in returnedData )
				{
					if( expiry!="timestamp" )
					{
						totalCEPEData[expiry] =  returnedData[expiry]['totalCEPE']
					}
				}
				//console.log("pathToStoreData", pathToStoreData)
				//console.log("fieldPath", fieldPath)
				//console.log("totalCEPEData", totalCEPEData)
				
				var intraday_chart_data_Ref = db.doc( pathToStoreData );


				// Try to update the existing document using the update() method
				await intraday_chart_data_Ref.update({
					[fieldPath]: totalCEPEData
				}).then(() => {
					console.log("Document updated successfully.");
				}).catch((error) => {
					// If the update() method fails with a "document does not exist" error,
					// create a new document using the set() method instead
					if (error.code === "not-found") {
						
						var updateObject = {
							[firstNestedFieldName]: {
							[secondNestedFieldName]: totalCEPEData
							}
						}
						intraday_chart_data_Ref.set( updateObject , { merge: true });
	   
					} else {
						throw error;
					}
				}).then(() => {
					console.log("Document created successfully.");
				}).catch((error) => {
					console.log("Error creating or updating document: ", error);
				});


			//console.log("done")
				
			}
			else if ( iframeSrc.includes("api/allMarketStatus") == true )  
			{
				//await db.doc( pathToStoreData ).set( dataObj ); 
				//docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				await db.doc( pathToStoreData ).set( dataObj, { merge: true } );
			}
			else if (iframeSrc.includes("https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20TOTAL%20MARKET") == false && iframeSrc.includes("#OnlyForSectorsStocks") == false )  
			{
				//await db.doc( pathToStoreData ).set( dataObj ); 
				docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				await db.doc( pathToStoreData ).set( dataObj, { merge: true } );
			}
			
			}
		//docPathForIndexObj [ pathToStoreData ] = pathOfDocument
	}	//localStorageChecking_and_redirecting(apiObject,iframeSrc) function ENDS HERE

async function addMargedExtractedNiftyTotalMarket( db, createdAtTime, currentSystemDate )
{
	
		try {
  // code that might throw an exception
  
		var ApiMainObject = {};
		var returnedDataArray ;
		var pathToStoreData;
		var pathOfDocument;
		var dataObj;
		
		var options = { 
		  timeZone: 'Asia/Kolkata', 
		  month: 'long',
		  year: 'numeric',
		};

			//var pathOfDocument = returnedDataArray[2] + '/FnO/' +createdAtTime+ '/' +createdAtTime;
			var pathOfDocument = equityData["id"]+ '/ALL/' +createdAtTime+ '/' +createdAtTime;
			
			//April 2023/26-Apr-2023/sector_stockNames/NIFTY_BANK/22:21:16 has
			var monthYear = new Date( equityData["timeStamp"] ).toLocaleString('en-IN', options);
			//pathToStoreData = monthYear +'/'+ returnedDataArray[1] + '/' + returnedDataArray[2] + '/' +createdAtTime;
			pathToStoreData = monthYear +'/'+ equityData["timeStamp"] + '/' + pathOfDocument ;
			
			dataObj={
				"data": JSON.stringify( equityData["data"] )
			}
			console.log( JSON.stringify( equityData["data"]  ).length )
			
			var nseDate = pathToStoreData.split(/\//)[1]
			if( Date.parse(nseDate) == Date.parse(currentSystemDate) )
			{
				docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				await db.doc( pathToStoreData ).set( dataObj ); 
			}
			
			} catch(error) {
			  // handle the error
			  console.log(error);
			}

}


async function addExtractedSectorStockNamesData( db, createdAtTime, currentSystemDate )
{
	try { // code that might throw an exception
				
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
		var ApiMainObject = {};
		var returnedDataArray ;
		var pathToStoreData;
		var pathOfDocument;
		var dataObj;
		
		var options = { 
		  timeZone: 'Asia/Kolkata', 
		  month: 'long',
		  year: 'numeric',
		};
		
		var latestDate;
		
		//var dates = ['2022-01-01', '2023-01-01', '2023-04-30'];
		var dates = onlyForSectorsStocksObj['dates'];
		var newestDate = new Date(dates[0]);

		if (dates.length > 1) {
		  for (var i = 1; i < dates.length; i++) {
			var currentDate = new Date(dates[i]);
			if (currentDate > newestDate) {
			  newestDate = currentDate;
			}
		  }
		}
		
		//var options2 = { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric' };
		//var formattedDate = newestDate.toLocaleDateString('en-IN', options2).replace(/ /g, '-');
		//latestDate = formattedDate;
		var dayOfMonth = String(newestDate.getDate());
		if (dayOfMonth.length < 2) {
		  dayOfMonth = '0' + dayOfMonth;
		}
		
		latestDate =  dayOfMonth +'-'+ months[newestDate.getMonth()] +'-'+ newestDate.getFullYear();
		//console.log('Newest date:', latestDate);
		//console.log("onlyForSectorsStocksObj",onlyForSectorsStocksObj)
						
			//April 2023/26-Apr-2023/sector_stockNames/NIFTY_BANK/22:21:16 has
			var monthYear = new Date( latestDate ).toLocaleString('en-IN', options);
			for( var SectorsStocks in onlyForSectorsStocksObj['data'] )
			{
				try { // code that might throw an exception
				
				//var pathOfDocument = returnedDataArray[2] + '/FnO/' +createdAtTime+ '/' +createdAtTime;
	
				pathOfDocument = onlyForSectorsStocksObj['data'][SectorsStocks]['id']
				//console.log("pathOfDocument",pathOfDocument)
				pathToStoreData = monthYear +'/'+ latestDate+ '/' + pathOfDocument ;
			
				dataObj={
					"data": JSON.stringify( onlyForSectorsStocksObj['data'][SectorsStocks]['data'] )
				}
				console.log( JSON.stringify( onlyForSectorsStocksObj['data'][SectorsStocks]['data'] ).length )
					
				docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				await db.doc( pathToStoreData ).set( dataObj ); 
			
				} catch(error) {
				  // handle the error
				  console.log(error);
				}
			}
			
			
	} catch(error) {
				  // handle the error
				  console.log(error);
	}
}


async function updateIndex( db, createdAtTime, currentSystemDate )
{
	
	console.log('docPathForIndexObj', docPathForIndexObj);
	try { // code that might throw an exception
	
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	 
		var ApiMainObject = {};
		var returnedDataArray ;
		var pathToStoreData;
		var pathOfDocument;
		var dataObj;
		
		var options = { 
		  timeZone: 'Asia/Kolkata', 
		  month: 'long',
		  year: 'numeric',
		};


		var allDates = []
		for( var paths in docPathForIndexObj )
		{
			var pathDate = paths.split('/')[1]
			allDates.push( pathDate ) 
		}
		
		var newestDate = new Date(allDates[0]);
		var latestDate = allDates[0]
		if (allDates.length > 1) {
		  for (var i = 1; i < allDates.length; i++) {
			var currentDate = new Date(allDates[i]);
			if (currentDate > newestDate) {
			  newestDate = currentDate;
			  latestDate = allDates[i]
			}
		  }
		}
		
		var Index = {};
		
		//var monthYear = months[newestDate.getMonth()] +' '+ newestDate.getFullYear();
		var monthYear = new Date( latestDate ).toLocaleString('en-IN', options);
		
		//var indexRef = db.doc('/April 2023/26-Apr-2023/');
		var indexRef = db.doc('/'+monthYear+'/'+latestDate+'/');
		await indexRef.get().then(function(querySnapshot) {
           //console.log(doc.id, " => ", doc.data());
		   console.log( querySnapshot.data() )
		   if( querySnapshot.data() != undefined )
		   {
			    if( querySnapshot.data()['Index'] !=undefined )
					Index = querySnapshot.data()['Index']
		   }
		  
        
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
	  
	// (added on 21-May-2023) adding externally common_timeValues in docPathForIndexObj for index creation (STARTS HERE)
		var nseDate = latestDate
			if( Date.parse(nseDate) == Date.parse(currentSystemDate) )
			{
	  var commonTimeValuesPathToStoreData  = monthYear+'/'+latestDate+'/common_time_values/'+createdAtTime ;
	  docPathForIndexObj[ commonTimeValuesPathToStoreData ] = 'common_time_values/'+createdAtTime ;
			}
	  // (added on 21-May-2023) adding externally common_timeValues in docPathForIndexObj for index creation (ENDS HERE)
	  
	  if ( Index['delivery_data'] ==undefined )
	  {
		  var startDate = new Date( latestDate );
		var startDateForDelivery = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - 1);
		  var calculatedDeliveryDataObj = await getCalculatedDeliveryData( startDateForDelivery )
		  
		  if (calculatedDeliveryDataObj !== null) {
			  //console.log(fetchedData); // Process the retrieved data here
			 await addCalculatedDeliveryData( db, latestDate, calculatedDeliveryDataObj )
			 
			} else {
			  // Handle the error or fallback behavior here
			  //console.error('An error occurred while fetching the data');
			}

	  }
	  	
		console.log('docPathForIndexObj after deliveryData', docPathForIndexObj);
	  console.log("Index",Index)
		
		for( var pathToStoreData in docPathForIndexObj )
		{
				try { // code that might throw an exception
				
			var firstNestedFieldName, secondNestedFieldName, thirdNestedFieldName;
			var timeValue;
			var pathOfDocument;
			
			//var nameOfSegment = pathOfDocument.split('/')[1]
			var pathDate = paths.split('/')[1]
			if( pathDate == latestDate )
			{
				console.log("pathToStoreData",pathToStoreData)
				
				if( pathToStoreData.includes('option_chain_data')==true )
				{
					pathOfDocument = docPathForIndexObj[ pathToStoreData ]['pathOfDocument']
					var expiriesArray = docPathForIndexObj[ pathToStoreData ]['expiryDates']
					
					firstNestedFieldName = pathOfDocument.split('/')[0]
					secondNestedFieldName = pathOfDocument.split('/')[1]
					timeValue = pathOfDocument.split('/')[2]
					
					
					
					console.log("pathOfDocument",pathOfDocument)
					console.log("firstNestedFieldName",firstNestedFieldName)
					console.log("secondNestedFieldName",secondNestedFieldName)
					console.log("timeValue",timeValue)
					
					console.log("Index[firstNestedFieldName]",Index[firstNestedFieldName])
					
					if( Index[firstNestedFieldName] ==undefined )
					{
						Index[firstNestedFieldName] = { //e.g. option_chain_data
							[secondNestedFieldName]:{ //eg. NIFTY50
								"timeValues": [timeValue],
								"expiryDates": expiriesArray
							}
						}
					}
					else
					{
						if( Index[firstNestedFieldName][secondNestedFieldName] ==undefined )
						{
							Index[firstNestedFieldName][secondNestedFieldName]={ //eg. NIFTY50
									"timeValues": [timeValue],
									"expiryDates": expiriesArray
								}
						}
						else
						{
							Index[firstNestedFieldName][secondNestedFieldName]["timeValues"].push(timeValue)
							Index[firstNestedFieldName][secondNestedFieldName]["expiryDates"] = expiriesArray
							Index[firstNestedFieldName][secondNestedFieldName]["timeValues"] = sortTimesAsc( [...new Set( Index[firstNestedFieldName][secondNestedFieldName]["timeValues"] )] );
						}
					}
				
					//Index[ firstNestedFieldName ] = [ timeValue ]
				}
				
				else if( ( pathToStoreData.includes('equity_market')==true && docPathForIndexObj[ pathToStoreData ].split('/').length>2 )  ||  pathToStoreData.includes('pre_open_market')==true )
				{
					pathOfDocument = docPathForIndexObj[ pathToStoreData ]
								
					firstNestedFieldName = pathOfDocument.split('/')[0]
					secondNestedFieldName = pathOfDocument.split('/')[1]
					timeValue = pathOfDocument.split('/')[2]
				
					if( Index[firstNestedFieldName] ==undefined )
					{
						Index[firstNestedFieldName] = { //e.g. option_chain_data
							[secondNestedFieldName] : [timeValue]
						}
					}
					else
					{
						if( Index[firstNestedFieldName][secondNestedFieldName] ==undefined )
						{
							Index[firstNestedFieldName][secondNestedFieldName] = [timeValue]
						}
						else
						{
							Index[firstNestedFieldName][secondNestedFieldName].push(timeValue)
							Index[firstNestedFieldName][secondNestedFieldName] = sortTimesAsc( [...new Set( Index[firstNestedFieldName][secondNestedFieldName] )] )
						}
					}
				
					//Index[ firstNestedFieldName ] = [ timeValue ]
				}
				
				//else if( pathToStoreData.includes('intraday_chart_data')==true )
			
			
				//else if( pathToStoreData.includes('sector_stockNames')==true )
			
				else if( pathToStoreData.includes('trading_dates')==false || (docPathForIndexObj[ pathToStoreData ].includes('trading_dates')==false ) )
				{
					pathOfDocument = docPathForIndexObj[ pathToStoreData ]
					firstNestedFieldName = pathOfDocument.split('/')[0]
					timeValue = pathOfDocument.split('/')[1]
					//Index[ firstNestedFieldName ] = [ timeValue ]
					
					if( Index[firstNestedFieldName] ==undefined )
					{
						Index[firstNestedFieldName] = [timeValue]						
					}
					else
					{
							Index[firstNestedFieldName].push(timeValue)
							Index[firstNestedFieldName] = sortTimesAsc( [...new Set( Index[firstNestedFieldName] )] )
					}
				
					
				}
				
				
			}
		
					} catch(error) {
					  // handle the error
					  console.error(error);
					}
			
		}

			console.log("Index",Index)
			
			pathToStoreData = monthYear +'/'+ latestDate ;
		
			dataObj={
				"Index": Index
			}

	
				//docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				await db.doc( pathToStoreData ).set( dataObj, { merge: true } ); 
				
				} catch(error) {
  // handle the error
  console.log(error);
}

}


async function getCalculatedDeliveryData( startDateForDelivery )
{

  //const startingDate = '22May2023';
  const startingDate = startDateForDelivery;
  const numPreviousDays = 40;

  try {
    const response = await fetch(`https://script.google.com/macros/s/AKfycbwsjI4MFf03Hva57Gd-hFVh6GgxG6S3SevVjUjrXwQEU9JADo0p8X-nD_Qo3wa7Xeg1/exec?startingDate=${startingDate}&numPreviousDays=${numPreviousDays}`);

    if (!response.ok) {
      throw new Error('Network response was not OK');
    }

    const data = await response.json();
    return data; // Return the fetched data
  } catch (error) {
    console.error('Error:', error);
    return null; // Return null or a default value in case of an error
  }
  
}

async function addCalculatedDeliveryData( db, latestDate, calculatedDeliveryDataObj )
{
	
		try {
  // code that might throw an exception
  
		var ApiMainObject = {};
		var returnedDataArray ;
		var pathToStoreData;
		var pathOfDocument;
		var dataObj;
		
		var options = { 
		  timeZone: 'Asia/Kolkata', 
		  month: 'long',
		  year: 'numeric',
		};

			//var pathOfDocument = returnedDataArray[2] + '/FnO/' +createdAtTime+ '/' +createdAtTime;
			var pathOfDocument = "delivery_data" + '/delivery_data/' ;
			
			//April 2023/26-Apr-2023/sector_stockNames/NIFTY_BANK/22:21:16 has
			var monthYear = new Date( latestDate ).toLocaleString('en-IN', options);
			//pathToStoreData = monthYear +'/'+ returnedDataArray[1] + '/' + returnedDataArray[2] + '/' +createdAtTime;
			pathToStoreData = monthYear +'/'+ latestDate + '/' + pathOfDocument ;
			
			dataObj={
				"data": JSON.stringify( calculatedDeliveryDataObj )
			}
			console.log( JSON.stringify( calculatedDeliveryDataObj  ).length )
			
				docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				await db.doc( pathToStoreData ).set( dataObj ); 
				
			
			} catch(error) {
			  // handle the error
			  console.log(error);
			}

}



function sortTimesAsc(times) {
  times.sort((a, b) => {
    // Convert time values to milliseconds since midnight
    const [aHrs, aMins, aSecs] = a.split(":").map(Number);
    const aMs = aHrs * 3600000 + aMins * 60000 + aSecs * 1000;

    const [bHrs, bMins, bSecs] = b.split(":").map(Number);
    const bMs = bHrs * 3600000 + bMins * 60000 + bSecs * 1000;

    // Compare the milliseconds values
    return aMs - bMs;
  });

  return times;
}

var equityData = {};
var docPathForIndexObj= {};
var onlyForSectorsStocksObj= {
	dates:[],
	data:{}
};


Apify.main(async () => {
	
	 	  try {
    const input = await Apify.getInput();

    const { data } = input;
    let islegacyPhantomJSTask = false;
    if (data && typeof data === 'string') {
        // It runs from legacy phantomjs crawler task finished webhook
        const legacyInput = JSON.parse(data);
        Object.assign(input, legacyInput);
        islegacyPhantomJSTask = true;
    }

    const { datasetId, apiKey, authDomain, projectId, collectionName } = input;

    if (!datasetId) {
        throw new Error('DatasetId is required on input.');
    }

    firebase.initializeApp({
        apiKey,
        authDomain,
        projectId,
    });

    // Initialize Cloud Firestore through Firebase
    const db = firebase.firestore();
    console.log(`Start importing dataset ${datasetId} to firestore.`);
    const dataset = await Apify.openDataset(datasetId, { forceCloud: true });
    const datasetInfo = await dataset.getInfo();

    //console.log('datasetInfo:', datasetInfo);
    const createdAt = new Date( datasetInfo["createdAt"] )

    var options = { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' ,
    hour12: false 
    };

	var dateOptions = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'long', // Specify 'long' for full month name
  day: '2-digit',
};


    //var createdAtTime = new Date( datasetInfo["createdAt"] ).toTimeString('en-IN', options).split(' ')[0]
    var currentSystemDate = new Date( datasetInfo["createdAt"] ).toLocaleString('en-IN', dateOptions)
    var createdAtTime = new Date( datasetInfo["createdAt"] ).toLocaleString('en-IN', options).split(' ')[1]
	
	createdAtTime = createdAtTime.split(':')[0] + ':' + createdAtTime.split(':')[1]+ ':00'
	
	console.log("currentSystemDate", currentSystemDate, "createdAtTime",createdAtTime)

    // Import dataset from actor/task
    const limit = 1000;
    let counter = 0;
    for (let offset = 0; offset < datasetInfo.itemCount; offset += limit) {
        const pagination = await dataset.getData({
            simplified: islegacyPhantomJSTask,
            clean: !islegacyPhantomJSTask,
            limit,
            offset,
        });
        console.log(`Get dataset items offset: ${pagination.offset}`);
        for (const item of pagination.items[0]['pageText']) {
            var fetchedURL = item["url"];
			 var myurl = (item["url"].replace(/[^\w\s]/gi, ""));
            console.log('item:', myurl );
            console.log('createdAt:', createdAt );

            try {
                if( item["pageText"]!="" )
                {
                    //var myPath= "March2022/10Mar2023/"+myurl+"/"+createdAtTime;
                   /*var myPath = TestFunction(myurl,createdAtTime);
                    //await db.collection(collectionName).doc( myurl ).set( JSON.parse(item["pageText"]) ); // Use doc() and set() instead of add()
                    //await db.doc( myPath ).set( JSON.parse(item["pageText"]) ); // Use doc() and set() instead of add()
                    var dataObj={
                        "objectValue":(item["pageText"])
                    }
                    await db.doc( myPath ).set( dataObj ); // Use doc() and set() instead of add()
                    
                    //console.log('Added item:', item.replace(/[^\w\s]/gi, ''));
                    */

                    //await handleData( JSON.parse(item["pageText"]), fetchedURL, db, createdAtTime, currentSystemDate);
                    await handleData( item["pageText"], fetchedURL, db, createdAtTime, currentSystemDate);
					
					counter++;
                }
                
            } catch (err) {
                //console.log(`Cannot import item ${JSON.stringify(item)}: ${err.message}`);
                console.log(`Cannot import item ${myurl}: ${err.message} : ${err}`);
            }
        }
    } 
	
	await addMargedExtractedNiftyTotalMarket( db, createdAtTime, currentSystemDate )
	await addExtractedSectorStockNamesData( db, createdAtTime, currentSystemDate )
	await updateIndex( db, createdAtTime, currentSystemDate )
	
    console.log(`Imported ${counter} from dataset ${datasetId}.`);

    console.log('Done!');
    console.log('docPathForIndexObj', docPathForIndexObj);
    //console.log('onlyForSectorsStocksObj', onlyForSectorsStocksObj);
	
	
	
	 const datasetDrop = await dataset.drop();
	 console.log('datasetDrop', datasetDrop);
	 
	
	} catch (err) {
                //console.log(`Cannot import item ${JSON.stringify(item)}: ${err.message}`);
                console.log(`Error while running main ${err.message} : ${err}`);
            }
});