var fs = require('fs');
var textFile = process.argv[2];
var LineByLineReader = require('line-by-line');
var outputFilename = 'my.json';
var outputFilenameDone = 'done.json'
var geoJSON = 'my.geojson';
var geoJSONDone = 'done.geojson';
var status = require('node-status');
var console = status.console();
var stream = fs.createWriteStream(outputFilename);
var geoStream = fs.createWriteStream(geoJSON);

if(!textFile) return console.log('Done');

var arrayOfCities = [];
var arrayOfGeoCities = [];

var lr = new LineByLineReader(textFile);
var count = 0;

var counter = function () {
  setTimeout(function () {
    ++count;
    process.stdout.clearLine();  // clear current text
    process.stdout.cursorTo(0);  // move cursor to beginning of line}
    process.stdout.write("Lines " + count)
  },1);
}


console.log("Start");

var totalLineCount = status.addItem('Total Line Count',{
  color: 'white',
  label: 'Total Lines'
});

var skippedLines = status.addItem('Skipped Lines',{
  color: 'red',
  label: 'Skipped Lines'
})

var parsedLines = status.addItem('Parsed Lines',{
  color:'green',
  label: 'Parsed Lines'
})

status.start({
  invert: false, 
  interval: 200
});

lr.on('error', function (err) {
  // 'err' contains error object
  console.log(err);
});

lr.on('line', function (line) {
  // pause emitting of lines...
  lr.pause();
  totalLineCount.inc();
  counter();
  // ...do your asynchronous line processing..
  setTimeout(function () {
    var _line = line.split(',');
    var city = {
      Country: _line[0],
      City: _line[1],
      AccentCity: _line[2],
      Region: _line[3],
      Population: _line[4],
      Latitude: _line[5],
      Longitude: _line[6]
    }
    totalLineCount.inc();
    // if(city.Population < 1) {
    //   skippedLines.inc();
    //   return lr.resume();
    // }
    var geoCity = {
      type: "Feature",
      geometry:{
        type: "Point",
        coordinates: [city.Longitude,city.Latitude],
        properties:{
          Country: _line[0],
          City: _line[1],
          AccentCity: _line[2],
          Region: _line[3],
          Population: _line[4],
        }
      }
    }

    parsedLines.inc();
    // console.log(city);
    var cityString = JSON.stringify(city);
    var geoCityString = JSON.stringify(geoCity);    
    arrayOfCities.push(city);  
    arrayOfGeoCities.push(geoCityString);
    stream.write(cityString + '\n');
    geoStream.write(geoCityString + '\n');
    // ...and continue emitting lines.
    lr.resume();
  }, 0);
});

lr.on('end', function () {
  // All lines are read, file is closed now.
  fs.writeFile(outputFilenameDone, JSON.stringify(arrayOfCities, null, 4), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilenameDone);
    }
  });
  fs.writeFile(geoJSONDone, JSON.stringify(arrayOfGeoCities, null, 4), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilenameDone);
    }
  });
  geoStream.close();
  stream.close();
  status.stop();
  console.log('Done');
});


