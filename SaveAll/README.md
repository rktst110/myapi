# Firestore import

It imports data from Apify dataset to Firestore DB.

## Usage
It can be used from any Apify actor or task webhook, even from Legacy PhantomJS Crawler task Finish webhook URL.

Webhook URL: `https://api.apify.com/v2/acts/drobnikj~firestore-import/runs?token=<yourApifyApiToken>`

### Actor/Task webhook
Set up a webhook with following payload template:
```
{
    "datasetId": {{resource.defaultDatasetId}},
    "apiKey": "<firestoreApiKey>",
    "authDomain": "<firestoreAuthDomain>",
    "projectId": "<firestoreProjectId>",
    "collectionName": "<firestoreCollectionName>"
}
```

### Actor
You can call Apify.call() with following options.
```
await Apify.call('drobnikj/firestore-import', {
    "datasetId": "<datasetId>",
    "apiKey": "<firestoreApiKey>",
    "authDomain": "<firestoreAuthDomain>",
    "projectId": "<firestoreProjectId>",
    "collectionName": "<firestoreCollectionName>" 
})
```

### Legacy PhantomJS Crawler task with Finish webhook URL
Set up Finish webhook data with the following JSON object:
```
{
    "apiKey": "<firestoreApiKey>",
    "authDomain": "<firestoreAuthDomain>",
    "projectId": "<firestoreProjectId>",
    "collectionName": "<firestoreCollectionName>"
}
```
