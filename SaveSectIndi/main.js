const Apify = require('apify');
const firebase = require('firebase');
const fetch = require('node-fetch'); // Import the fetch function

function fetchMultipleUrls2(urls) {
	  try {
  const promises = urls.map(url => fetch(url).then(response => response.json()));
  return Promise.all(promises);
	   } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function fetchMultipleUrls(urls) {
  const promises = urls.map(url =>
    fetch(url)
      .then(response => {
        if (response.status === 404 || response.status === 400) {
          //console.warn(`URL ${url} returned a ${response.status} status.`);
          return {}; // Return an empty object for 404 and 400 errors
        }
        if (!response.ok) {
          // Handle non-OK responses here (e.g., other error status codes)
          //console.error(`Failed to fetch ${url}. Status: ${response.status}`);
          //throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
		  return {}; 
        }
        return response.json();
      })
      .catch(error => {
        console.error(`Error while fetching ${url}: ${error}`);
        return {}; // Return an empty object in case of an error
      })
  );

  return Promise.all(promises);
}

async function startFetchingNseIndicesData() {
  try {
   // console.log("calling fetchMultipleUrls function");

    
    var urls =[
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20NEXT%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20100.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20200.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20500.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDCAP%20150.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDCAP%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDCAP%20SELECT.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDCAP%20100.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SMALLCAP%20250.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SMALLCAP%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SMALLCAP%20100.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20LARGEMIDCAP%20250.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDSMALLCAP%20400.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20AUTO.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20BANK.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20FINANCIAL%20SERVICES.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20FMCG.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20IT.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MEDIA.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20METAL.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20PHARMA.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20PRIVATE%20BANK.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20PSU%20BANK.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20REALTY.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20ADITYA%20BIRLA%20GROUP.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20COMMODITIES.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20SHARIAH.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20CPSE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20ENERGY.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20INDIA%20CONSUMPTION.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20INFRASTRUCTURE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20INDIA%20MANUFACTURING.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MAHINDRA%20GROUP.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDCAP%20LIQUID%2015.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MNC.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20PSE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SERVICES%20SECTOR.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SHARIAH%2025.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20TATA%20GROUP.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20TATA%20GROUP%2025%%20CAP.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY100%20LIQUID%2015.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20SHARIAH.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY500%20SHARIAH.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SME%20EMERGE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY100%20EQUAL%20WEIGHT.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY100%20LOW%20VOLATILITY%2030.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20ALPHA%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20EQUITY%20SAVINGS.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%2050%20ARBITRAGE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%2050%20FUTURES%20PR.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%2050%20FUTURES%20TR.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20DIVIDEND%20OPPORTUNITIES%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20HIGH%20BETA%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20LOW%20VOLATILITY%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY100%20QUALITY%2030.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20GROWTH%20SECTORS%2015.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20DIVIDEND%20POINTS.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20EQUAL%20WEIGHT.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20PR%201X%20INVERSE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20PR%202X%20LEVERAGE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20TR%201X%20INVERSE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20TR%202X%20LEVERAGE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20USD.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY50%20VALUE%2020.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20AAA%20CORPORATE%20BOND.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%201D%20RATE%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%2010%20YEAR%20SDL%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY100%20ALPHA%2030.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY500%20VALUE%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY200%20QUALITY%2030.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDCAP150%20QUALITY%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20CONSUMER%20DURABLES.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20OIL%20&%20GAS.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY200%20MOMENTUM%2030.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20CPSE%20BOND%20PLUS%20SDL%20SEP%202024%2050:50%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20HEALTHCARE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY500%20MULTICAP%2050:25:25.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20AAA%20BOND%20PLUS%20SDL%20APR%202026%2050:50%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20PSU%20BOND%20PLUS%20SDL%20APR%202026%2050:50%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20PSU%20BOND%20PLUS%20SDL%20APR%202027%2050:50%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20APR%202026%20TOP%2020%20EQUAL%20WEIGHT%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MICROCAP%20250.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY100%20ENHANCED%20ESG.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20PLUS%20PSU%20BOND%20SEP%202026%2060:40%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20PSU%20BOND%20PLUS%20SDL%20SEP%202027%2040:60%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20TOTAL%20MARKET.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20AAA%20BOND%20PLUS%20SDL%20APR%202026%2070:30%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20AAA%20BOND%20PLUS%20SDL%20APR%202031%2070:30%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MOBILITY.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20INDIA%20DIGITAL.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20CPSE%20BOND%20PLUS%20SDL%20SEP%202026%2050:50%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20APR%202027%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20INDIA%20DEFENCE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20APR%202027%20TOP%2012%20EQUAL%20WEIGHT%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20APR%202032%20TOP%2012%20EQUAL%20WEIGHT%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20HOUSING.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20TRANSPORTATION%20&%20LOGISTICS.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20PLUS%20AAA%20PSU%20BOND%20DEC%202027%2060:40%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20JUN%202027%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20SEP%202027%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20AAA%20CPSE%20BOND%20PLUS%20SDL%20APR%202027%2060:40%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapCOMMERCIAL%20PAPERS%20INDICES.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20FIXED%20INCOME%20PRC%20INDICES.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY200%20ALPHA%2030.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDSMALL%20FINANCIAL%20SERVICES.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDSMALL%20HEALTHCARE.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDSMALL%20IT%20&%20TELECOM.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDCAP150%20MOMENTUM%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20SEP%202025%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20PLUS%20AAA%20PSU%20BOND%20JUL%202028%2060:40%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20DEC%202028%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20AAA%20PSU%20BOND%20PLUS%20SDL%20APR%202026%2050:50%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20PLUS%20AAA%20PSU%20BOND%20JUL%202033%2060:40%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20AAA%20PSU%20BOND%20PLUS%20SDL%20SEP%202026%2050:50%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20MIDSMALL%20INDIA%20CONSUMPTION.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20SEP%202026%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20SEP%202026%20V1%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20JUL%202026%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20DEC%202026%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20PLUS%20AAA%20PSU%20BOND%20APR%202026%2075:25%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20JUL%202033%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20OCT%202026%20INDEX.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20INDIA%20MUNICIPAL%20BOND.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20PLUS%20AAA%20PSU%20BOND%20APR%202028%2075:25.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20INDIA%20SOVEREIGN%20GREEN%20BOND%20JAN%202033.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20INDIA%20SOVEREIGN%20GREEN%20BOND%20JAN%202028.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20JUL%202028.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SMALLCAP250%20QUALITY%2050.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20SDL%20JUNE%202028.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20REITS%20&%20INVITS.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20CORE%20HOUSING.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%205%20YEAR%20SDL.json",
    "https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%203%20YEAR%20SDL.json"
]
	fetchedDataArray = await fetchMultipleUrls(urls);

    // Loop through and print the fetched data
    fetchedDataArray.forEach((data, index) => {
		if( Object.keys(data).length>0 )
		{
			urlCount = urlCount + 1
			var fetchedUrl = urls[index]
			var fetchedData = data
			var returnedDataObj = handleFetchedData( fetchedUrl, fetchedData )
			
				var pathOfDocument = returnedDataObj['id'] ;
				
					onlyForSectorsStocksObj["data"][ returnedDataObj['id'] ] = {
						"data": returnedDataObj['data']
					}
					onlyForSectorsStocksObj["data"][ returnedDataObj['id'] ]["timeStamp"] = returnedDataObj['nseDate']
					onlyForSectorsStocksObj["data"][ returnedDataObj['id'] ]["id"] = returnedDataObj['id']
					onlyForSectorsStocksObj['dates'].push( returnedDataObj['nseDate'] )
					
			/*
      console.log(`Result for URL ${urls[index]}:`);
      console.log(data[0]['sector']);
	  for(var i=0;i<data.length;i++ )
	  {
		 allSybmolsObj [ data[i]['symbol'] ] =1
	  }
	  */
	 
	}
    });
	//console.log( urls.length )
	//console.log( "urlCount",urlCount)
	//console.log( Object.keys(allSybmolsObj).length )
	//console.log( allSybmolsObj )
    //console.log("done");
	
    console.log("onlyForSectorsStocksObj", onlyForSectorsStocksObj);
  } catch (error) {
    console.error('Error accessing fetched data:', error);
  }
}

function formatDate(inputDateStr) {
  // Parse the input date string into a Date object
  var inputDate = new Date(inputDateStr);

  // Define months in abbreviated form
  var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Get the day, month, and year components from the Date object
  var day = String(inputDate.getDate()).padStart(2, '0');
  var month = months[inputDate.getMonth()];
  var year = inputDate.getFullYear();

  // Construct the desired output date string
  var outputDateStr = `${day}-${month}-${year}`;

  // Return the formatted date string
  return outputDateStr;
}

function handleFetchedData( fetchedUrl, fetchedData )
{
	

	var dateOptions = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'short', // Specify 'long' for full month name
  day: '2-digit',
};


	//"https://iislliveblob.niftyindices.com/jsonfiles/HeatmapDetail/FinalHeatmapNIFTY%20NEXT%2050.json".split('FinalHeatmap')[1].replace('.json','').replace(/%20/g,' ')
	var sectorName = fetchedUrl.split('FinalHeatmap')[1].replace('.json','').replace(/%20/g,' ').replace(/&amp;/g,'&').replace(/&/g,'AND')
	//var sectorName = fetchedUrl.split('FinalHeatmap')[1].replace('.json','').replace(/%20/g,' ')
	var sectors_identifiers = {"NIFTY 50": {"index": "NIFTY 50", "indexSymbol": "NIFTY 50", "key": "BROAD MARKET INDICES" }, "NIFTY NEXT 50": {"index": "NIFTY NEXT 50", "indexSymbol": "NIFTY NEXT 50", "key": "BROAD MARKET INDICES" }, "NIFTY 100": {"index": "NIFTY 100", "indexSymbol": "NIFTY 100", "key": "BROAD MARKET INDICES" }, "NIFTY 200": {"index": "NIFTY 200", "indexSymbol": "NIFTY 200", "key": "BROAD MARKET INDICES" }, "NIFTY 500": {"index": "NIFTY 500", "indexSymbol": "NIFTY 500", "key": "BROAD MARKET INDICES" }, "NIFTY MIDCAP 50": {"index": "NIFTY MIDCAP 50", "indexSymbol": "NIFTY MIDCAP 50", "key": "BROAD MARKET INDICES" }, "NIFTY MIDCAP 100": {"index": "NIFTY MIDCAP 100", "indexSymbol": "NIFTY MIDCAP 100", "key": "BROAD MARKET INDICES" }, "NIFTY SMALLCAP 100": {"index": "NIFTY SMALLCAP 100", "indexSymbol": "NIFTY SMLCAP 100", "key": "BROAD MARKET INDICES" }, "INDIA VIX": {"index": "INDIA VIX", "indexSymbol": "INDIA VIX", "key": "BROAD MARKET INDICES" }, "NIFTY MIDCAP 150": {"index": "NIFTY MIDCAP 150", "indexSymbol": "NIFTY MIDCAP 150", "key": "BROAD MARKET INDICES" }, "NIFTY SMALLCAP 50": {"index": "NIFTY SMALLCAP 50", "indexSymbol": "NIFTY SMLCAP 50", "key": "BROAD MARKET INDICES" }, "NIFTY SMALLCAP 250": {"index": "NIFTY SMALLCAP 250", "indexSymbol": "NIFTY SMLCAP 250", "key": "BROAD MARKET INDICES" }, "NIFTY MIDSMALLCAP 400": {"index": "NIFTY MIDSMALLCAP 400", "indexSymbol": "NIFTY MIDSML 400", "key": "BROAD MARKET INDICES" }, "NIFTY500 MULTICAP 50:25:25": {"index": "NIFTY500 MULTICAP 50:25:25", "indexSymbol": "NIFTY500 MULTICAP", "key": "BROAD MARKET INDICES" }, "NIFTY LARGEMIDCAP 250": {"index": "NIFTY LARGEMIDCAP 250", "indexSymbol": "NIFTY LARGEMID250", "key": "BROAD MARKET INDICES" }, "NIFTY MIDCAP SELECT": {"index": "NIFTY MIDCAP SELECT", "indexSymbol": "NIFTY MID SELECT", "key": "BROAD MARKET INDICES" }, "NIFTY TOTAL MARKET": {"index": "NIFTY TOTAL MARKET", "indexSymbol": "NIFTY TOTAL MKT", "key": "BROAD MARKET INDICES" }, "NIFTY MICROCAP 250": {"index": "NIFTY MICROCAP 250", "indexSymbol": "NIFTY MICROCAP250", "key": "BROAD MARKET INDICES" }, "NIFTY BANK": {"index": "NIFTY BANK", "indexSymbol": "NIFTY BANK", "key": "SECTORAL INDICES" }, "NIFTY AUTO": {"index": "NIFTY AUTO", "indexSymbol": "NIFTY AUTO", "key": "SECTORAL INDICES" }, "NIFTY FINANCIAL SERVICES": {"index": "NIFTY FINANCIAL SERVICES", "indexSymbol": "NIFTY FIN SERVICE", "key": "SECTORAL INDICES" }, "NIFTY FINANCIAL SERVICES 25/50": {"index": "NIFTY FINANCIAL SERVICES 25/50", "indexSymbol": "NIFTY FINSRV25 50", "key": "SECTORAL INDICES" }, "NIFTY FMCG": {"index": "NIFTY FMCG", "indexSymbol": "NIFTY FMCG", "key": "SECTORAL INDICES" }, "NIFTY IT": {"index": "NIFTY IT", "indexSymbol": "NIFTY IT", "key": "SECTORAL INDICES" }, "NIFTY MEDIA": {"index": "NIFTY MEDIA", "indexSymbol": "NIFTY MEDIA", "key": "SECTORAL INDICES" }, "NIFTY METAL": {"index": "NIFTY METAL", "indexSymbol": "NIFTY METAL", "key": "SECTORAL INDICES" }, "NIFTY PHARMA": {"index": "NIFTY PHARMA", "indexSymbol": "NIFTY PHARMA", "key": "SECTORAL INDICES" }, "NIFTY PSU BANK": {"index": "NIFTY PSU BANK", "indexSymbol": "NIFTY PSU BANK", "key": "SECTORAL INDICES" }, "NIFTY PRIVATE BANK": {"index": "NIFTY PRIVATE BANK", "indexSymbol": "NIFTY PVT BANK", "key": "SECTORAL INDICES" }, "NIFTY REALTY": {"index": "NIFTY REALTY", "indexSymbol": "NIFTY REALTY", "key": "SECTORAL INDICES" }, "NIFTY HEALTHCARE INDEX": {"index": "NIFTY HEALTHCARE INDEX", "indexSymbol": "NIFTY HEALTHCARE", "key": "SECTORAL INDICES" }, "NIFTY CONSUMER DURABLES": {"index": "NIFTY CONSUMER DURABLES", "indexSymbol": "NIFTY CONSR DURBL", "key": "SECTORAL INDICES" }, "NIFTY OIL &amp;GAS": {"index": "NIFTY OIL &amp;GAS", "indexSymbol": "NIFTY OIL AND GAS", "key": "SECTORAL INDICES" },"NIFTY OIL &amp; GAS": {"index": "NIFTY OIL &amp;GAS", "indexSymbol": "NIFTY OIL AND GAS", "key": "SECTORAL INDICES" }, "NIFTY DIVIDEND OPPORTUNITIES 50": {"index": "NIFTY DIVIDEND OPPORTUNITIES 50", "indexSymbol": "NIFTY DIV OPPS 50", "key": "STRATEGY INDICES" }, "NIFTY GROWTH SECTORS 15": {"index": "NIFTY GROWTH SECTORS 15", "indexSymbol": "NIFTY GROWSECT 15", "key": "STRATEGY INDICES" }, "NIFTY100 QUALITY 30": {"index": "NIFTY100 QUALITY 30", "indexSymbol": "NIFTY100 QUALTY30", "key": "STRATEGY INDICES" }, "NIFTY50 VALUE 20": {"index": "NIFTY50 VALUE 20", "indexSymbol": "NIFTY50 VALUE 20", "key": "STRATEGY INDICES" }, "NIFTY50 TR 2X LEVERAGE": {"index": "NIFTY50 TR 2X LEVERAGE", "indexSymbol": "NIFTY50 TR 2X LEV", "key": "STRATEGY INDICES" }, "NIFTY50 PR 2X LEVERAGE": {"index": "NIFTY50 PR 2X LEVERAGE", "indexSymbol": "NIFTY50 PR 2X LEV", "key": "STRATEGY INDICES" }, "NIFTY50 TR 1X INVERSE": {"index": "NIFTY50 TR 1X INVERSE", "indexSymbol": "NIFTY50 TR 1X INV", "key": "STRATEGY INDICES" }, "NIFTY50 PR 1X INVERSE": {"index": "NIFTY50 PR 1X INVERSE", "indexSymbol": "NIFTY50 PR 1X INV", "key": "STRATEGY INDICES" }, "NIFTY50 DIVIDEND POINTS": {"index": "NIFTY50 DIVIDEND POINTS", "indexSymbol": "NIFTY50 DIV POINT", "key": "STRATEGY INDICES" }, "NIFTY ALPHA 50": {"index": "NIFTY ALPHA 50", "indexSymbol": "NIFTY ALPHA 50", "key": "STRATEGY INDICES" }, "NIFTY50 EQUAL WEIGHT": {"index": "NIFTY50 EQUAL WEIGHT", "indexSymbol": "NIFTY50 EQL WGT", "key": "STRATEGY INDICES" }, "NIFTY100 EQUAL WEIGHT": {"index": "NIFTY100 EQUAL WEIGHT", "indexSymbol": "NIFTY100 EQL WGT", "key": "STRATEGY INDICES" }, "NIFTY100 LOW VOLATILITY 30": {"index": "NIFTY100 LOW VOLATILITY 30", "indexSymbol": "NIFTY100 LOWVOL30", "key": "STRATEGY INDICES" }, "NIFTY200 QUALITY 30": {"index": "NIFTY200 QUALITY 30", "indexSymbol": "NIFTY200 QUALTY30", "key": "STRATEGY INDICES" }, "NIFTY ALPHA LOW-VOLATILITY 30": {"index": "NIFTY ALPHA LOW-VOLATILITY 30", "indexSymbol": "NIFTY ALPHALOWVOL", "key": "STRATEGY INDICES" }, "NIFTY200 MOMENTUM 30": {"index": "NIFTY200 MOMENTUM 30", "indexSymbol": "NIFTY200MOMENTM30", "key": "STRATEGY INDICES" }, "NIFTY MIDCAP150 QUALITY 50": {"index": "NIFTY MIDCAP150 QUALITY 50", "indexSymbol": "NIFTY M150 QLTY50", "key": "STRATEGY INDICES" }, "NIFTY COMMODITIES": {"index": "NIFTY COMMODITIES", "indexSymbol": "NIFTY COMMODITIES", "key": "THEMATIC INDICES" }, "NIFTY INDIA CONSUMPTION": {"index": "NIFTY INDIA CONSUMPTION", "indexSymbol": "NIFTY CONSUMPTION", "key": "THEMATIC INDICES" }, "NIFTY CPSE": {"index": "NIFTY CPSE", "indexSymbol": "NIFTY CPSE", "key": "THEMATIC INDICES" }, "NIFTY ENERGY": {"index": "NIFTY ENERGY", "indexSymbol": "NIFTY ENERGY", "key": "THEMATIC INDICES" }, "NIFTY INFRASTRUCTURE": {"index": "NIFTY INFRASTRUCTURE", "indexSymbol": "NIFTY INFRA", "key": "THEMATIC INDICES" }, "NIFTY100 LIQUID 15": {"index": "NIFTY100 LIQUID 15", "indexSymbol": "NIFTY100 LIQ 15", "key": "THEMATIC INDICES" }, "NIFTY MIDCAP LIQUID 15": {"index": "NIFTY MIDCAP LIQUID 15", "indexSymbol": "NIFTY MID LIQ 15", "key": "THEMATIC INDICES" }, "NIFTY MNC": {"index": "NIFTY MNC", "indexSymbol": "NIFTY MNC", "key": "THEMATIC INDICES" }, "NIFTY PSE": {"index": "NIFTY PSE", "indexSymbol": "NIFTY PSE", "key": "THEMATIC INDICES" }, "NIFTY SERVICES SECTOR": {"index": "NIFTY SERVICES SECTOR", "indexSymbol": "NIFTY SERV SECTOR", "key": "THEMATIC INDICES" }, "NIFTY100 ESG SECTOR LEADERS": {"index": "NIFTY100 ESG SECTOR LEADERS", "indexSymbol": "NIFTY100ESGSECLDR", "key": "THEMATIC INDICES" }, "NIFTY INDIA DIGITAL": {"index": "NIFTY INDIA DIGITAL", "indexSymbol": "NIFTY IND DIGITAL", "key": "THEMATIC INDICES" }, "NIFTY100 ESG": {"index": "NIFTY100 ESG", "indexSymbol": "NIFTY100 ESG", "key": "THEMATIC INDICES" }, "NIFTY INDIA MANUFACTURING": {"index": "NIFTY INDIA MANUFACTURING", "indexSymbol": "NIFTY INDIA MFG", "key": "THEMATIC INDICES" }, "NIFTY 8-13 YR G-SEC": {"index": "NIFTY 8-13 YR G-SEC", "indexSymbol": "NIFTY GS 8 13YR", "key": "FIXED INCOME INDICES" }, "NIFTY 10 YR BENCHMARK G-SEC": {"index": "NIFTY 10 YR BENCHMARK G-SEC", "indexSymbol": "NIFTY GS 10YR", "key": "FIXED INCOME INDICES" }, "NIFTY 10 YR BENCHMARK G-SEC (CLEAN PRICE)": {"index": "NIFTY 10 YR BENCHMARK G-SEC (CLEAN PRICE)", "indexSymbol": "NIFTY GS 10YR CLN", "key": "FIXED INCOME INDICES" }, "NIFTY 4-8 YR G-SEC INDEX": {"index": "NIFTY 4-8 YR G-SEC INDEX", "indexSymbol": "NIFTY GS 4 8YR", "key": "FIXED INCOME INDICES" }, "NIFTY 11-15 YR G-SEC INDEX": {"index": "NIFTY 11-15 YR G-SEC INDEX", "indexSymbol": "NIFTY GS 11 15YR", "key": "FIXED INCOME INDICES" }, "NIFTY 15 YR AND ABOVE G-SEC INDEX": {"index": "NIFTY 15 YR AND ABOVE G-SEC INDEX", "indexSymbol": "NIFTY GS 15YRPLUS", "key": "FIXED INCOME INDICES" }, "NIFTY COMPOSITE G-SEC INDEX": {"index": "NIFTY COMPOSITE G-SEC INDEX", "indexSymbol": "NIFTY GS COMPSITE", "key": "FIXED INCOME INDICES" }}
	
	var sectorIdentifier = sectorName
	if( sectors_identifiers[sectorName] !=undefined )
	{
		sectorIdentifier = sectors_identifiers[sectorName]["indexSymbol"]
	}
	sectorIdentifier = sectorIdentifier.replace(/ /g,'_')
	var indexDivisor = fetchedData[0]['indexDivisor']
	
	//"06-Sep-2023 09:07:31"
	//var formattedDate = new Date( fetchedData[0]['time'] ).toLocaleString('en-IN', dateOptions)
	var formattedDate = formatDate( fetchedData[0]['time'] )
	//var formattedTime = new Date( fetchedData[0]['time'] ).toLocaleString('en-IN', options).split(' ')[1]
	var nseDate = formattedDate
	
	
    
	
	var sector_stocks_obj = {
		"sectorName":sectorName,
		"indexDivisor":indexDivisor,
		"data":{},
	}
	
	for(var i=0;i<fetchedData.length;i++ )
	{
		var dataObj = fetchedData[i]
		var symbol = dataObj['symbol']
		
		sector_stocks_obj["data"][symbol] ={
			Indexmcap_yst : dataObj['Indexmcap_yst'], 
			cappingFactor : dataObj['cappingFactor'],
			investableWeightFactor : dataObj['investableWeightFactor'],
			sharesOutstanding : dataObj['sharesOutstanding'],
			sector : dataObj['sector'],
		}
	}			

		
			
		
		
	//console.log( sectorName,"=",sectorIdentifier, nseDate, indexDivisor )
	
	var id = 'sector_stockNames' + '/' + sectorIdentifier;
	var returnableObj = {
		"data":sector_stocks_obj, 
		"nseDate":nseDate, 
		"id":id }
		return returnableObj
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
		
		
	function convertIntoSeconds(time) {
		var ts = time.split(':');
		return Date.UTC(1970, 0, 1, ts[0], ts[1], ts[2]) / 1000;
	}
	
	
	var timeOptions = {
		timeZone: 'Asia/Kolkata',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	};

	var currentTime = new Date().toLocaleString('en-IN', timeOptions);
	var currentTimeHMS = new Date().toLocaleString('en-IN', timeOptions).split(' ')[1];
		
	if ( convertIntoSeconds(currentTimeHMS) > convertIntoSeconds('09:00:00') && convertIntoSeconds(currentTimeHMS) <= convertIntoSeconds('09:15:00') ) 
	{	// if condition is true then assign current data as newestDate
		newestDate = new Date();
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
		//console.log("latestDate",latestDate, "currentSystemDate",currentSystemDate)
			if( Date.parse(latestDate) == Date.parse(currentSystemDate) || convertIntoSeconds(currentTimeHMS) > convertIntoSeconds('09:00:00') && convertIntoSeconds(currentTimeHMS) <= convertIntoSeconds('09:15:00') )
			{
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
				console.log( pathToStoreData )
				//docPathForIndexObj [ pathToStoreData ] = pathOfDocument
				await db.doc( pathToStoreData ).set( dataObj ); 
			
				} catch(error) {
				  // handle the error
				  console.log(error);
				}
			}
	}
			
	} catch(error) {
				  // handle the error
				  console.log(error);
	}
}



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
	
	var allSybmolsObj = {}
	var urlCount = 0
	var fetchedDataArray;
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
	//console.log("input", input)

    if (!datasetId) {
        throw new Error('DatasetId is required on input.');
    }

    firebase.initializeApp({
        apiKey,
        authDomain,
        projectId,
    });
	
	//console.log("after calling startRunningActorProcess function");
	//console.log( Object.keys(allSybmolsObj).length )
	//console.log( allSybmolsObj )
    //console.log("done");
	
	
	
	  // Initialize Cloud Firestore through Firebase
    var db = firebase.firestore();
	
	

	var dateOptions = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: 'long', // Specify 'long' for full month name
  day: '2-digit',
};

    //var createdAtTime = new Date( datasetInfo["createdAt"] ).toTimeString('en-IN', options).split(' ')[0]
    var currentSystemDate = new Date().toLocaleString('en-IN', dateOptions)
    var createdAtTime = new Date().toLocaleString('en-IN', options).split(' ')[1]
	
	createdAtTime = createdAtTime.split(':')[0] + ':' + createdAtTime.split(':')[1]+ ':00'
	
	console.log("currentSystemDate", currentSystemDate, "createdAtTime",createdAtTime)

   // console.log("calling startRunningActorProcess function");
    await startFetchingNseIndicesData();
	await addExtractedSectorStockNamesData( db, createdAtTime, currentSystemDate )

  } catch (err) {
    console.error(`Error while running main: ${err.message}`);
  }
});
