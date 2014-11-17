var fs = require('fs');
var textFile = process.argv[2];
var LineByLineReader = require('line-by-line');
var outputFilename = 'my.json';
var status = require('node-status');
var console = status.console();
var stream = fs.createWriteStream(outputFilename);

if(!textFile) return console.log('Done');

var arrayOfCities = [];
var lr = new LineByLineReader(textFile);

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
    if(city.Population < 1) {
      skippedLines.inc();
      return lr.resume();
    }
    parsedLines.inc();
    console.log(city);
    arrayOfCities.push(city);  
    var cityString = JSON.stringify(city);
    stream.write(cityString + '\n')
    // ...and continue emitting lines.
    lr.resume();
  }, 0);
});

lr.on('end', function () {
  // All lines are read, file is closed now.
  // fs.writeFile(outputFilename, JSON.stringify(arrayOfCities, null, 4), function(err) {
  //   if(err) {
  //     console.log(err);
  //   } else {
  //     console.log("JSON saved to " + outputFilename);
  //   }
  // });
  stream.close();
  status.stop();
  console.log('Done');
});


