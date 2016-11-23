// MapIt importer script and GeoJson builder.
const edinburghcityscopeUtils = require('edinburghcityscope-utils');
const fs = require('fs');
const path = require('path');
const queue = require('queue');
const _ = require('lodash');
const ProgressBar = require('progress');

const datadir = path.join(__dirname, '..', 'data');
const dataZones2001GeoJsonFile = 'data-zones-2001.geojson';
const csvFilename = 'council-house-sales.csv';

var zones2001 = [];
var dataZones = {
    type: "FeatureCollection",
    features: [],
};

// Fetch 2001 datazones
edinburghcityscopeUtils.fetchGovBoundaries('dz-2001', (err, boundaries, zones) => {
    if (err) throw err;

    zones2001 = zones
    dataZones.features = boundaries;
    fs.writeFileSync(path.join(datadir, dataZones2001GeoJsonFile), JSON.stringify(dataZones), 'utf8');
    console.log('DZ-2001 area collection GeoJSON file saved to ' + dataZones2001GeoJsonFile);

    interrogateSPARQL(zones2001)
});

function interrogateSPARQL(zones) {
    var queries = [];
    var batch = queue({concurrency: 1});
    var chunk_size = 1;
    var records = [];
    var fields = [];

    console.log();
    var bar = new ProgressBar('  API calls :bar :percent :etas', {
        complete: '█',
        incomplete: '─',
        width: 55,
        total: Math.ceil(zones.length / chunk_size)
    });

    var fetchChunk = function(done) {
        var query = queries.shift();

        edinburghcityscopeUtils.getScotGovSPARQL(query, (err, rows, columns) => {
            if (err) throw err;

            fields = columns;
            records.push(...rows);

            bar.tick();
            done();
        });
    }

    var outputRecords = function() {
        var json2csv = require('json2csv')
        var csv = json2csv({data: records, fields: fields, newLine: "\n"})
        fs.writeFileSync(path.join(datadir, csvFilename), csv)
    }

    console.log(`Fetching data for ${zones.length} zones, ${chunk_size} at a time...`)
    bar.tick(0);
    _.forEach(_.chunk(zones, chunk_size), (zone_chunk) => {
        queries.push(`
            PREFIX qb: <http://purl.org/linked-data/cube#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX ldim: <http://purl.org/linked-data/sdmx/2009/dimension#>
            PREFIX dim: <http://statistics.gov.scot/def/dimension/>
            PREFIX prop: <http://statistics.gov.scot/def/measure-properties/>
            PREFIX data: <http://statistics.gov.scot/data/>
            
            SELECT ?year ?zone ?dwelling ?count
            WHERE {
                ?s qb:dataSet data:council-house-sales ;
                   qb:measureType prop:count ;
                   prop:count ?count ;
                   dim:dwellingType ?d ;
                   ldim:refArea ?z ;
                   ldim:refPeriod ?y .
                ?d rdfs:label ?dwelling .
                ?z rdfs:label ?zone .
                ?y rdfs:label ?year .

                FILTER ( ?z IN (
                    ${zone_chunk.map(zone => `<${zone}>`).join(', ')}
                ))
            }`);

        batch.push(fetchChunk);
    });

    batch.push(outputRecords);

    batch.on('timeout', function(next, job) {
        console.log('Batched fetch from SPARQL timed out!');
        next();
    });

    batch.start();
}

edinburghcityscopeUtils.updateDataModificationDate(path.join(__dirname, '..'));
