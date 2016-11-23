// Script which converts a FeatureCollection to an array of Features
const fs = require('fs');
const path = require('path');
const datadir = path.join(__dirname, '..', 'data');
const edinburghcityscopeUtils = require('edinburghcityscope-utils');

const dataZones = 'data-zones-2001.geojson';
const model = 'CouncilHouseSales';
const filename = 'council-house-sales';
const outputFile = path.join(datadir, filename + '-loopback.json');

// Data zones
var featureCollection = fs.readFileSync(path.join(datadir, dataZones), 'utf8');
var features = edinburghcityscopeUtils.featureCollectionToFeatureArray(featureCollection);
var loopbackJson = edinburghcityscopeUtils.featureArrayToLoopbackJson(features);

// Stats
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
converter.fromFile(path.join(datadir, filename + '.csv'), function(err, result){
    if (err) throw err;
    loopbackJson = edinburghcityscopeUtils.featureArrayToLoopbackJson(result, model, loopbackJson);
    fs.writeFileSync(outputFile, JSON.stringify(loopbackJson));
    console.log(filename + '-loopback.json created');
});
