# sg-council-house-sales
Number of council house sales in Edinburgh to sitting tenants by housing type.

The Scottish Government Housing Statistics SALES3 case based return collects information on sales to sitting tenants only. This includes right to buy sales, rent to mortgage sales and voluntary sales. To create a consistent time series of right to buy sales and compare trends across Scotland, sales figures in local authorities that have transferred their housing stock to housing associations are included in the figures. Results are available at http://www.gov.scot/Topics/Statistics/Browse/Housing-Regeneration/HSfS/Sales

Statistics provided by Scottish Government:  http://statistics.gov.scot/data/council-house-sales

## License

Data is licensed under the Open Government License: http://www.nationalarchives.gov.uk/doc/open-government-licence/version/2/

## Requirements

- NodeJS
- npm

## Installation

Clone the repository

```
git clone https://github.com/EdinburghCityScope/sg-council-house-sales.git
```

Install npm dependencies

```
cd sg-council-house-sales
npm install
```

Run the API (from the sg-council-house-sales directory)

```
node .
```

Converting the extracted data into loopback data.

```
node scripts/featureCollectionToLoopbackJson.js
```

Re-build data files from the statistics.gov.scot API

```
node scripts/build-data.js
```
