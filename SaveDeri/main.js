const Apify = require('apify');
const firebase = require('firebase');


	function extractTradingDates( apiObject, iframeSrc){ // this function extracts previous trading date and then save it into IndexedDB

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



var allStocksFuturesOptionsDataObj ={}
var addedQuoteDerivatives = 0
async function extractQuoteDerivativesData(apiObject, iframeSrc, db, createdAtTime, currentSystemDate, totalPagesLength, pageCount )
	{
		
		var ApiMainObject = {};
		var timeStamp = apiObject['opt_timestamp'].split(' ')[0]

var templateObj = {
"symbol":{
//"identifier":[ 'openPrice', 'highPrice','lowPrice', 'lastPrice', 'change', 'pChange', 'prevClose', 'numberOfContractsTraded', 'totalTurnover',['tradeInfo -> openInterest', 'changeinOpenInterest', 'pchangeinOpenInterest', 'premiumTurnover', 'tradedVolume', 'value', 'vmap', 'impliedVolatility'], ['marketDeptOrderBook -> totalBuyQuantity', 'totalSellQuantity', [ 'ask -> price : quantity'], [ 'bid -> price : quantity'], ['carryOfCost -> price of bestBuy', 'price of bestSell','price of lastPrice', 'carry of bestBuy', 'carry of bestSell', 'carry of lastPrice'] ] ],
"identifier":[ 'openPrice', 'highPrice','lowPrice', 'lastPrice', 'change', 'pChange', 'prevClose', 'numberOfContractsTraded/tradedVolume', 'totalTurnover/value',['tradeInfo -> openInterest', 'changeinOpenInterest', 'pchangeinOpenInterest', 'premiumTurnover', 'vmap', 'impliedVolatility'], ['marketDeptOrderBook -> totalBuyQuantity', 'totalSellQuantity', [ 'ask -> price : quantity'], [ 'bid -> price : quantity'], ['carryOfCost -> price of bestBuy', 'price of bestSell','price of lastPrice', 'carry of bestBuy', 'carry of bestSell', 'carry of lastPrice'] ] ],
'underlyingValue' : 'underlyingValue',
'marketLot':'marketLot',
'fut_timestamp': 'fut_timestamp',
'opt_timestamp': 'opt_timestamp',

}

}

var allSymbolArray = apiObject['allSymbol'].sort()
var symbol = apiObject['info']['symbol']
var stockFuturesOptionsDataObj = {
	[symbol] : {}
}

for( var i=0;i<apiObject['stocks'].length;i++)
{
	var dataObj = apiObject['stocks'][i]
	
	var tradeInfo = [
	dataObj ['marketDeptOrderBook']['tradeInfo']['openInterest'],
	dataObj ['marketDeptOrderBook']['tradeInfo']['changeinOpenInterest'],
	dataObj ['marketDeptOrderBook']['tradeInfo']['pchangeinOpenInterest'],
	dataObj ['marketDeptOrderBook']['tradeInfo']['premiumTurnover'],
	//dataObj ['marketDeptOrderBook']['tradeInfo']['tradedVolume'],
	//dataObj ['marketDeptOrderBook']['tradeInfo']['value'],
	dataObj ['marketDeptOrderBook']['tradeInfo']['vmap'],
	dataObj ['marketDeptOrderBook']['otherInfo']['impliedVolatility'], 
	]
	
	var askArray = [], bidArray = []
	for(var a=0;a< dataObj ['marketDeptOrderBook']['ask'].length;a++ )
	{
		var data = dataObj ['marketDeptOrderBook']['ask'][a]
		askArray.push( data['price'] +':'+data['quantity']  )
	}
	
	for(var b=0;b< dataObj ['marketDeptOrderBook']['bid'].length;b++ )
	{
		var data = dataObj ['marketDeptOrderBook']['bid'][b]
		bidArray.push( data['price'] +':'+data['quantity']  )
	}
	
	var carryOfCostArray = [
	dataObj ['marketDeptOrderBook']['carryOfCost']['price']['bestBuy'],
	dataObj ['marketDeptOrderBook']['carryOfCost']['price']['bestSell'],
	dataObj ['marketDeptOrderBook']['carryOfCost']['price']['lastPrice'],
	dataObj ['marketDeptOrderBook']['carryOfCost']['carry']['bestBuy'],
	dataObj ['marketDeptOrderBook']['carryOfCost']['carry']['bestSell'],
	dataObj ['marketDeptOrderBook']['carryOfCost']['carry']['lastPrice'],
	]
	
	var marketDeptOrderBook = [ 
	dataObj ['marketDeptOrderBook']['totalBuyQuantity'], 
	dataObj['marketDeptOrderBook']['totalSellQuantity'], 
	askArray, 
	bidArray,
	carryOfCostArray,
	]
	/*
	var marketDeptOrderBook = {
		'ask' : dataObj ['marketDeptOrderBook']['ask'],
		'bid' : dataObj ['marketDeptOrderBook']['bid'],
		
	}
	*/
	
	var dataArray = [ 

		
		//dataObj ['metadata']['closePrice'] ,
		dataObj ['metadata']['openPrice'] ,
		dataObj ['metadata']['highPrice'] ,
		dataObj ['metadata']['lowPrice'] ,
		dataObj ['metadata']['lastPrice'] ,
		dataObj ['metadata']['change'] ,
		dataObj ['metadata']['pChange'] ,
		dataObj ['metadata']['prevClose'] ,
		dataObj ['metadata']['numberOfContractsTraded'] ,
		dataObj ['metadata']['totalTurnover'] ,
		tradeInfo,
		marketDeptOrderBook
		
	]
	
	var commonDataArray = [  ]
	if( dataObj['metadata']['numberOfContractsTraded']>0 )
	{
		var identifier = dataObj['metadata']['identifier'].replace(symbol,'')
		
	
		stockFuturesOptionsDataObj[symbol][identifier] = dataArray
	
		stockFuturesOptionsDataObj[symbol]['underlyingValue'] = dataObj ['underlyingValue']
		stockFuturesOptionsDataObj[symbol]['marketLot'] = dataObj ['marketDeptOrderBook']['tradeInfo']['marketLot']
		stockFuturesOptionsDataObj[symbol]['fut_timestamp'] = apiObject['fut_timestamp']
		stockFuturesOptionsDataObj[symbol]['opt_timestamp'] = apiObject['opt_timestamp']
		
	}

}

//console.log(apiObject['stocks'].length)
//console.log(Object.keys(stockFuturesOptionsDataObj[symbol]).length)
//console.log( stockFuturesOptionsDataObj )

var key = Object.keys(stockFuturesOptionsDataObj)[0]
//var key = 'data'
var valueOfKey = stockFuturesOptionsDataObj[key]

	var previousAllStocksFuturesOptionsDataObj = {}
	previousAllStocksFuturesOptionsDataObj = allStocksFuturesOptionsDataObj
	var id = "all_derivatives"
		
//allStocksFuturesOptionsDataObj[ key ] = valueOfKey

allStocksFuturesOptionsDataObj[ key ] = JSON.stringify( valueOfKey )
var saveDataOrNot = false
if( JSON.stringify(allStocksFuturesOptionsDataObj).length >= 1045000 )
//if( pageCount%5==0 )
{
	var anyPreviousKey = Object.keys (previousAllStocksFuturesOptionsDataObj)[0]
	//console.log("anyPreviousKey",anyPreviousKey)
	//var dataArrayToBeReturned = [ previousAllStocksFuturesOptionsDataObj, timeStamp, id, key, templateObj, allSymbolArray ]
	var dataArrayToBeReturned = [ previousAllStocksFuturesOptionsDataObj, timeStamp, id, anyPreviousKey, templateObj, allSymbolArray ]
	await saveDataIntoFirebase(apiObject, iframeSrc, db, createdAtTime, currentSystemDate, totalPagesLength, pageCount, dataArrayToBeReturned )
	
	//1,048,576
	//allStocksFuturesOptionsDataObj[ key ] = {}
	allStocksFuturesOptionsDataObj = {}
	//allStocksFuturesOptionsDataObj[ key ] = apiObject
	allStocksFuturesOptionsDataObj[ key ] = JSON.stringify( valueOfKey )
	var dataArrayToBeReturned2 = [ allStocksFuturesOptionsDataObj, timeStamp, id, key, templateObj, allSymbolArray ]
	return dataArrayToBeReturned2
}
else
{
	var dataArrayToBeReturned = [ allStocksFuturesOptionsDataObj, timeStamp, id, key, templateObj, allSymbolArray ]
	return dataArrayToBeReturned
}

	




	
		//return [ stockFuturesOptionsDataObj, timeStamp, id, key ]
		
		//return [ valueOfKey, timeStamp, id, key, templateObj, allSymbolArray ]
		
	}

	async function handleData(apiObject, iframeSrc, db, createdAtTime, currentSystemDate, totalPagesLength, pageCount ) { // this function first handles localStorages for current NSE_APIs_Data, PreviousDay_NSE_APIs_Data. and then redirect iframe's JSON object to specified function according to iframe src

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

		if ( iframeSrc.includes("api/quote-derivative?symbol") == true ) {
			console.log( totalPagesLength, pageCount )
			//returnedDataArray = await extractQuoteDerivativesData(apiObject)
			returnedDataArray = await extractQuoteDerivativesData(apiObject, iframeSrc, db, createdAtTime, currentSystemDate, totalPagesLength, pageCount )
			pathOfDocument = returnedDataArray[2] + '/' +createdAtTime+ '/' + createdAtTime+ '/' +returnedDataArray[3];
		}
		
		if( totalPagesLength == pageCount )
		{
			console.log("saving at reaching last page")
			
			await saveDataIntoFirebase(apiObject, iframeSrc, db, createdAtTime, currentSystemDate, totalPagesLength, pageCount, returnedDataArray )
		}
		
	}	//localStorageChecking_and_redirecting(apiObject,iframeSrc) function ENDS HERE


	async function saveDataIntoFirebase(apiObject, iframeSrc, db, createdAtTime, currentSystemDate, totalPagesLength, pageCount, returnedDataArray ) { // this function first handles localStorages for current NSE_APIs_Data, PreviousDay_NSE_APIs_Data. and then redirect iframe's JSON object to specified function according to iframe src
	console.log(  "returnedDataArray", returnedDataArray )
		var ApiMainObject = {};
		//var returnedDataArray ;
		var pathToStoreData;
		var pathOfDocument;
		var dataObj;
		
		var options = { 
		  timeZone: 'Asia/Kolkata', 
		  month: 'long',
		  year: 'numeric',
		};

		if ( iframeSrc.includes("api/quote-derivative?symbol") == true ) {
			//console.log( totalPagesLength, pageCount )
			//returnedDataArray =  extractQuoteDerivativesData(apiObject)
			pathOfDocument = returnedDataArray[2] + '/' +createdAtTime+ '/' + createdAtTime+ '/' +returnedDataArray[3];
		}
		
		//if( totalPagesLength-1 == pageCount )
		{
			//April 2023/26-Apr-2023/sector_stockNames/NIFTY_BANK/22:21:16 has
			var monthYear = new Date( returnedDataArray[1] ).toLocaleString('en-IN', options);
			//pathToStoreData = monthYear +'/'+ returnedDataArray[1] + '/' + returnedDataArray[2] + '/' +createdAtTime;
			
			if ( iframeSrc.includes("api/allMarketStatus") == true ) {
				pathToStoreData = monthYear +'/'+ returnedDataArray[1]
				
				dataObj={
				//[ returnedDataArray[2] ]: JSON.stringify(returnedDataArray[0])
				[ returnedDataArray[2] ]: (returnedDataArray[0])
				}
			}
			else
			{
				pathToStoreData = monthYear +'/'+ returnedDataArray[1] + '/' + pathOfDocument ;
				/*
				dataObj={
				//"data": JSON.stringify(returnedDataArray[0])
				"data": (returnedDataArray[0])
				}
				*/
				dataObj=returnedDataArray[0]
			}
			
				
			console.log( JSON.stringify(returnedDataArray[0]).length )
			
			var nseDate = pathToStoreData.split(/\//)[1]
			
			if( Date.parse(nseDate) == Date.parse(currentSystemDate) )
			{
			if ( iframeSrc.includes("api/allMarketStatus") == true )  
			{
				//await db.doc( pathToStoreData ).set( dataObj ); 
				//docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				await db.doc( pathToStoreData ).set( dataObj, { merge: true } );
			}
			else if ( iframeSrc.includes("api/quote-derivative?symbol") == true )  
			{
				//await db.doc( pathToStoreData ).set( dataObj ); 
				//docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				await db.doc( pathToStoreData ).set( dataObj, { merge: true } );
				
				if(addedQuoteDerivatives==0)
				{ //this is for adding template of derivatives in index object
					/*
					pathOfDocument = returnedDataArray[2] + '/' +createdAtTime+ '/' + createdAtTime+ '/' +'Template';
					pathToStoreData = monthYear +'/'+ returnedDataArray[1] + '/' + pathOfDocument ;
				
					dataObj={
					"data": ['open','high','low','close']
					}
					
					await db.doc( pathToStoreData ).set( dataObj, { merge: true } );
					*/
					
					
					//updating index
					
													
				var id =  returnedDataArray[2]
				var symbol =  returnedDataArray[3]
				var templateObj = returnedDataArray[4]
				var allSymbolArray = returnedDataArray[5]

				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
				//pathToStoreData = monthYear +'/'+ returnedDataArray[1] + '/' + pathOfDocument ;
				pathToStoreData = monthYear +'/'+ returnedDataArray[1]
				

				
				
				//var fieldPath = 'totalCEPEOIData.'+createdAtTime+'_'+( returnedDataArray[1].split(' ')[1] )
				var firstNestedFieldName = id+ '_index'
				var secondNestedFieldName = 'time_values'
				//var fieldPath = 'totalCEPEOIData.'+createdAtTime+'_'+( returnedDataArray[1].split(' ')[1] )
				var fieldPath = firstNestedFieldName+'.'+ secondNestedFieldName
				var templateFieldPath = firstNestedFieldName+'.'+ 'template'
				var allSymbolsFieldPath = firstNestedFieldName+'.'+ 'all_symbols'
				//var fieldPath = 'totalCEPEOIData.time.test'
			
								
				//var totalCEPEData = {};
				//totalCEPEData = returnedDataArray[0] // option chain all data 
				//totalCEPEData = JSON.stringify(returnedDataArray[0])// option chain all data 
				var totalCEPEData = createdAtTime// option chain all data 
				
			
				//totalCEPEData = symbol // option chain all data 
			
				//console.log("pathToStoreData", pathToStoreData)
				//console.log("fieldPath", fieldPath)
				//console.log("totalCEPEData", totalCEPEData)
				
				var intraday_chart_data_Ref = db.doc( pathToStoreData );


				// Try to update the existing document using the update() method
				await intraday_chart_data_Ref.update({
					[fieldPath]: firebase.firestore.FieldValue.arrayUnion(totalCEPEData),
					[templateFieldPath]: JSON.stringify(templateObj),
					[allSymbolsFieldPath]: allSymbolArray
				}).then(() => {
					console.log("Document updated successfully.");
				}).catch((error) => {
					// If the update() method fails with a "document does not exist" error,
					// create a new document using the set() method instead
					if (error.code === "not-found") {
						
						var updateObject = {
							[firstNestedFieldName]: {
							[secondNestedFieldName]: firebase.firestore.FieldValue.arrayUnion(totalCEPEData),
							'template': JSON.stringify(templateObj),
							'all_symbols': allSymbolArray
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

				

				
				}
				
				addedQuoteDerivatives = addedQuoteDerivatives+1
				
				
				/*

				
				var symbol =  returnedDataArray[3]
		

				pathOfDocument = returnedDataArray[2] + '/' +createdAtTime;
				pathToStoreData = monthYear +'/'+ returnedDataArray[1] + '/' + pathOfDocument ;
				
				//var fieldPath = 'totalCEPEOIData.'+createdAtTime+'_'+( returnedDataArray[1].split(' ')[1] )
				var firstNestedFieldName = 'data'
				var secondNestedFieldName = symbol
				//var fieldPath = 'totalCEPEOIData.'+createdAtTime+'_'+( returnedDataArray[1].split(' ')[1] )
				var fieldPath = firstNestedFieldName+'.'+ secondNestedFieldName
				//var fieldPath = 'totalCEPEOIData.time.test'
			
								
				var totalCEPEData = {};
				//totalCEPEData = returnedDataArray[0] // option chain all data 
				totalCEPEData = JSON.stringify(returnedDataArray[0])// option chain all data 
				//totalCEPEData = symbol // option chain all data 
			
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

				*/





			}
		
			
			}
		//docPathForIndexObj [ pathToStoreData ] = pathOfDocument
	}
	}	//localStorageChecking_and_redirecting(apiObject,iframeSrc) function ENDS HERE



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

	var createdAt = new Date( datasetInfo["createdAt"] )

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
		var itemCount = 0
		
		var combinedItemsArrayofObj = [
			{
				"url":"combinedArrayofObj",
				"pageText":[]
			}
		]

		for(var dtaset=0;dtaset<pagination.items.length;dtaset++)
		{
			var dataArray =[]
				dataArray = pagination.items[dtaset]["pageText"]
			for(var a=0;a<dataArray.length;a++)
			{
				
				//concatedArray.concat(dataArray);
				combinedItemsArrayofObj[0]['pageText'].push(dataArray[a])
			}

		}
		
		//var itemsLength = Object.keys( pagination.items[0]["pageText"] ).length
		var itemsLength = Object.keys( combinedItemsArrayofObj[0]["pageText"] ).length
        //for (const item of pagination.items[0]["pageText"]) {
        for (const item of combinedItemsArrayofObj[0]["pageText"]) {
			
			itemCount = itemCount+1
			
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

                    //await handleData( JSON.parse(item["pageText"]), fetchedURL, db, createdAtTime, currentSystemDate, itemsLength, itemCount );
                    await handleData( item["pageText"], fetchedURL, db, createdAtTime, currentSystemDate, itemsLength, itemCount );
					
					counter++;
                }
                
            } catch (err) {
                //console.log(`Cannot import item ${JSON.stringify(item)}: ${err.message}`);
                console.log(`Cannot import item ${myurl}: ${err.message} : ${err}`);
            }
        }
    }
	
	//await addMargedsStocksQuoteDerivativesData( db, createdAtTime, currentSystemDate )
	
	//await addMargedExtractedNiftyTotalMarket( db, createdAtTime, currentSystemDate )
	//await addExtractedSectorStockNamesData( db, createdAtTime, currentSystemDate )
	//await updateIndex( db, createdAtTime, currentSystemDate )
	
    console.log(`Imported ${counter} from dataset ${datasetId}.`);

    console.log('Done!');
    console.log('docPathForIndexObj', docPathForIndexObj);
    //console.log('onlyForSectorsStocksObj', onlyForSectorsStocksObj);
	
	
	 const datasetDrop = await dataset.drop();
	 console.log('datasetDrop', datasetDrop);
	 
	 
	  
	console.log( "allStocksFuturesOptionsDataObj Length:", JSON.stringify( allStocksFuturesOptionsDataObj ).length )
		/*
var storageSize = getStorageSize(allStocksFuturesOptionsDataObj );

console.log("Bytes:", storageSize.bytes);
console.log("Kilobytes:", storageSize.kilobytes);
console.log("Megabytes:", storageSize.megabytes);
console.log("Gigabytes:", storageSize.gigabytes);
    console.log('allStocksFuturesOptionsDataObj', allStocksFuturesOptionsDataObj);
*/

 } catch (err) {
                //console.log(`Cannot import item ${JSON.stringify(item)}: ${err.message}`);
                console.log(`Error while running main ${err.message} : ${err}`);
            }

});