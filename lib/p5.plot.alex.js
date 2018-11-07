p5.Plot.prototype.drawAlex = function()
{

}

p5.Plot.prototype.drawAlexHistogram = function(){
  // histogram is taking one contineous variable
  // mapping frequencies within each bin
  // here let's assume we only take xkey to plot our histogram
  let xkey = this.xkey;
  //let ykey = this.ykey;

  let xmin = this._xmin;
  let xmax = this._xmax;
  //let ymin = this._ymin;
  //let ymax = this._ymax;

  let numBins = this.bins;
  let binRange = (xmax-xmin)/numBins;
  let binArr = new Array(numBins);

  this.sortData(xkey); // may not be necessary as we only looking for frequency

  let currentMinBound = xmin;
  let currentMaxBound = xmin+binRange;
  for (let j=0; j<binArr.length;j++){
    binArr[j] = 0;
    for(let k in this.data){
      let currentValue = this.data[k][xkey];
      if ((currentValue >= currentMinBound) && (currentValue<currentMaxBound)){
        binArr[j]++;
      }
    }
    currentMinBound = currentMaxBound
    currentMaxBound += binRange
  }
  console.log(binArr);


  // find the min and max frequencies to map
  let minFreq = binArr[0];
  let maxFreq = binArr[0];
  // compare the length of each value array within a bin
  for (let p=0; p<binArr.length;p++){
    let currentFreq = binArr[p];
    if (currentFreq < minFreq){
      minFreq = currentFreq;
    }
    if (currentFreq > maxFreq){
      maxFreq = currentFreq;
    }
  }

  console.log(minFreq);
  console.log(maxFreq);

  push();

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  // start to draw rectangles!!!
  rectMode(CORNER); // x, y, w, h
  drawWidth = (this.right-this.left)/numBins; // width of each rect
  let currentX = this.left;
  for (let q=0; q<binArr.length;q++){
    let currentFreq = binArr[q];
    let currentY = map(currentFreq, maxFreq, minFreq, this.top, this.bottom); // y & h of this box
    let currentHeight = this.bottom-currentY;
    rect(currentX, currentY, drawWidth, currentHeight);
    currentX += drawWidth;
  }

  pop();

}

p5.Plot.prototype.drawAreaGraph = function(){
  let xkey = this.xkey;
  let ykey = this.ykey;

  let xmin = this._xmin;
  let xmax = this._xmax;
  let ymin = this._ymin;
  let ymax = this._ymax;

  push();

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  this.sortData(xkey);

  beginShape();
  vertex(this.left, this.bottom);

  for(let i in this.data)
  {
    let x = map(this.data[i][xkey], xmin, xmax, this.left, this.right);
    let y = map(this.data[i][ykey], ymin, ymax, this.bottom, this.top);
    if(i>0) vertex(x, y);
  }
  vertex(this.right, this.bottom);

  endShape(CLOSE);

  pop();


}

p5.Plot.prototype.drawBoxPlot = function(){
  // draw box plot
  // graph minimum, first quartile, median, third quartile, and maximum

  // only makes sense when there's discrete y and continuous x or;
  // discrete x and continuous y
  // for example:
  /* boxData = [{"x":13, "y":"a"}, {"x":16, "y":"a"}, {"x":57, "y":"a"}, {"x":34, "y":"a"}, {"x":26, "y":"a"}, {"x":67, "y":"a"}, {"x":12, "y":"a"},
   {"x":45, "y":"b"}, {"x":32, "y":"b"}, {"x":24, "y":"b"}, {"x":86, "y":"b"}, {"x":65, "y":"b"}, {"x":37, "y":"b"}, {"x":98, "y":"b"}];
  */

  // here lets assume xkey is contineous and
  // ykey is discrete
  // draw horizontal graphs
  // the number of ykey represent number of boxes
  let xkey = this.xkey;
  let ykey = this.ykey;

  // if x is contineous, find min & max
  let xmin = this._xmin;
  let xmax = this._xmax;

  push();

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  // if there's more than one set of continuous data
  // put every unique y value into the array
  let boxArr = [];
  let valueMin = xmin; //if given y value, this is useful
  let valueMax = xmax;

  // check in our data, how many unique y & push them into new array
  // if no ykey is given, y would just be default 1, apparently
  for(let i in this.data){
    if (boxArr.includes(this.data[i][ykey])){
    }
    else{
      boxArr.push(this.data[i][ykey]);
    }
  }

  let numBox = boxArr.length;
  let boxMargin = ((this.bottom-this.top)/numBox)/10;
  let boxY = this.top+boxMargin;
  let boxHeight = (this.bottom-this.top)/numBox - boxMargin*2;

  // for every box array value, draw a box
  for (let j=0; j<numBox; j++){
    let valueArr = [];
    for (let k in this.data){
      if (this.data[k][ykey] === boxArr[j])
       valueArr.push(this.data[k][xkey]);
       // check the value, if it's higher or lower than the min & max value
       if (this.data[k][xkey]<valueMin){
         valueMin = this.data[k][xkey]
       }
       else if (this.data[k][xkey]>valueMax){
         valueMax = this.data[k][xkey]
       }
    }

    let xQuartileBoundsArr = quartileBounds(valueArr);
    // map minimum, first quartile, median, third quartile, and maximum into the graph
    // two graphs should have a common scale instead of their own scale
    let boxMin = map(xQuartileBoundsArr[0], valueMin, valueMax, this.left, this.right);
    let boxQ1 = map(xQuartileBoundsArr[1], valueMin, valueMax, this.left, this.right);
    let boxMedian = map(xQuartileBoundsArr[2], valueMin, valueMax, this.left, this.right);
    let boxQ3 = map(xQuartileBoundsArr[3], valueMin, valueMax, this.left, this.right);
    let boxMax = map(xQuartileBoundsArr[4], valueMin, valueMax, this.left, this.right);

    console.log(boxMin+' '+boxQ1+' '+boxMedian+' '+boxQ3+' '+ boxMax);

    // graph multiple horizontal box plots after dealing with data

    // the height of box, keep it constant
    //let boxHeight = this.bottom-this.top;

    drawOneBox(boxMin, boxQ1, boxMedian, boxQ3, boxMax, boxY, boxHeight);

    //draw next box, the Y pos will increase!
    boxY += boxMargin + boxHeight;
    }
  pop();
}

// find the median
// if array is odd number, median is middle number
// if array is even number, median is middle two numbers added then divide by two
function getMedian(sampleArr){
  sampleArr.sort(function(a, b){return a - b});
  // even
  if (sampleArr.length%2 === 0){
    let numA = sampleArr[sampleArr.length/2 - 1];
    let numB = sampleArr[sampleArr.length/2];
    return (numA + numB)/2;
  }
  // odd
  else{
    return sampleArr[(sampleArr.length - 1)/2];
  }
}

// find medians and quartiles
function quartileBounds(sampleArr){
  // must sort array first
  sampleArr.sort(function(a, b){return a - b});
  let _firstHalf;
  let _secondHalf;
  // even
  if (sampleArr.length%2 === 0){
    _firstHalf = sampleArr.slice(0, sampleArr.length/2);
    _secondHalf = sampleArr.slice(sampleArr.length/2, sampleArr.length);
  }
  // odd
  else {
    _firstHalf = sampleArr.slice(0, (sampleArr.length-1)/2);
    _secondHalf = sampleArr.slice(((sampleArr.length-1)/2)+1, sampleArr.length);
  }
  let _0percent = min(sampleArr);

  // find the medians for each split
  let _25percent = getMedian(_firstHalf);
  let _75percent = getMedian(_secondHalf);

  let _50percent = getMedian(sampleArr);
  let _100percent = max(sampleArr);

  return [ _0percent, _25percent, _50percent, _75percent, _100percent];
}

function drawOneBox(boxMin, boxQ1, boxMed, boxQ3, boxMax, boxY, boxHeight){
  line(boxMin, boxY+boxHeight/4, boxMin, boxY+boxHeight/4+boxHeight/2); // minimum

  line(boxQ1, boxY, boxQ1, boxY+boxHeight); // Q1

  line(boxMed, boxY, boxMed, boxY+boxHeight); // median

  line(boxQ3, boxY, boxQ3, boxY+boxHeight); // Q3

  line(boxMax, boxY+boxHeight/4, boxMax, boxY+boxHeight/4+boxHeight/2); //maximum

  // connect
  line(boxQ1, boxY, boxQ3, boxY); // top of box
  line(boxQ1, boxY+boxHeight, boxQ3, boxY+boxHeight); // bot of box
  line(boxMin, boxY+boxHeight/2, boxQ1, boxY+boxHeight/2);
  line(boxQ3, boxY+boxHeight/2, boxMax, boxY+boxHeight/2);
}

p5.Plot.prototype.drawDensityGraph = function(){
  // density graph is taking one contineous variable
  // here we assume a bin is given, !!!!!!!!!!!!but possibly no bin and discrete data is given!!!!!!!!!
  // mapping frequencies within each bin
  // find the percentage of the frequency

  // here let's assume we only take xkey
  let xkey = this.xkey;
  //let ykey = this.ykey;

  let xmin = this._xmin;
  let xmax = this._xmax;
  //let ymin = this._ymin;
  //let ymax = this._ymax;

  let numBins = this.bins;
  let binRange = (xmax-xmin)/numBins;
  // create an empty array with numBins of items, later will store the number of values in that bin
  let binFreqArr = new Array(numBins);

  this.sortData(xkey); // may not be necessary as we only looking for frequency

  let currentMinBound = xmin;
  let currentMaxBound = xmin+binRange;
  for (let j=0; j<binFreqArr.length;j++){
    binFreqArr[j] = 0;
    for(let k in this.data){
      let currentValue = this.data[k][xkey];
      if ((currentValue >= currentMinBound) && (currentValue<currentMaxBound)){
        binFreqArr[j]++;
      }
    }
    currentMinBound = currentMaxBound
    currentMaxBound += binRange
  }
  console.log(binFreqArr);

  // find the min and max frequencies to map
  let minFreq = min(binFreqArr);
  let maxFreq = max(binFreqArr);

  push();

  //fill(this.fillcolor);
  noFill();
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  // start to draw data points!!!
  pointDist = (this.right-this.left)/numBins; // distance between each point
  let currentX = this.left;

  beginShape();
  for (let q=0; q<binFreqArr.length;q++){
    let prevFreq = 0;
    let nextFreq = 0;

    if(q>0) prevFreq = binFreqArr[q-1];

    let currentFreq = binFreqArr[q];

    if(q<binFreqArr.length-1) nextFreq = binFreqArr[q+1];

    let currentY = map(currentFreq, maxFreq, minFreq, this.top, this.bottom); // y & h of this box

    ellipse(currentX, currentY, 5, 5); // the actual data point

    let avgY = map((prevFreq+currentFreq+nextFreq)/3, maxFreq, minFreq, this.top, this.bottom); // map a smoothing value

    curveVertex(currentX, avgY);
    currentX += pointDist;
  }
  endShape();

  pop();

}
/*
p5.Plot.prototype.drawDensityGraph = function()
{
  let xkey = this.xkey;
  let ykey = this.ykey;

  let xmin = this._xmin;
  let xmax = this._xmax;
  let ymin = this._ymin;
  let ymax = this._ymax;

  push();

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  // !!!!!!!!!!!! at the moment, we take one set of discrete data

  this.sortData(xkey);
  // an array of different values of xkey
  let valueArr = [];
  // an array of numbers of different values of xkey
  let frequencyArr = [];
  // find how many of each unique value is in our data
  for(let i in this.data)
  {
    let xValue = this.data[i][xkey]; // change this line to work with different keys
    if (valueArr.includes(xValue)){
      frequencyArr[valueArr.indexOf(xValue)] += 1;
    }
    else{
      valueArr.push(xValue);
      frequencyArr.push(1);
    }
  }

  let densityArr = [];
  let frequencyTotal = 0;
  // calculate percentage of frequencies of different values in valueArr
  for (let j=0; j<frequencyArr.length; j++){
    frequencyTotal += frequencyArr[j];
  }
  for (let k=0; k<frequencyArr.length; k++){
    densityArr.push(frequencyArr[k]/frequencyTotal);
  }

  for(let p=0; p<valueArr.length; p++)
  {
    // x axis is value
    let x = map(valueArr[p], min(valueArr), max(valueArr), this.left, this.right);
    // y axis is frequency
    let y = map(densityArr[p], 0, 1, this.bottom, this.top);
    point(x, y);
  }

  pop();
}
*/

p5.Plot.prototype.understandData = function(){
  // first, make sense of whether x y are discrete or continuous
  // if a key value is string, it's considered to be discrete
  // continuous data can also be grouped into discrete bins

  // therefore, say there are three kinds of data:
  // "d" - discrete, including strings, discrete numbers
  // "c" - continuous, including contineous numeric values
  // "dc" - discrete continuous, where numeric values get grouped into discrete bins
  // "u" - unknown, maybe give an error???

  this.xtype = "u";
  this.ytype = "u";
  this.bin;

  let xkey = this.xkey;
  let ykey = this.ykey;

  let xAllStr = false;
  let xAllNum = false;
  let xAllInt = false;

  let yAllStr = false;
  let yAllNum = false;
  // all integers??????????????????????????? might be used as discrete continues

  // loop through data, check type for each x and y
  for (let i=0;i<this.data.length;i++){
    // how about objects????
    if (typeof this.data[i][xkey] === "string"){
      xAllStr = true;
    }
    else{
      xAllStr = false;
    }
    if (typeof this.data[i][ykey] === "string"){
      yAllStr = true;
    }
    else{
      yAllStr = false;
    }

    if (typeof this.data[i][xkey] === "number"){
      xAllNum = true;
    }
    else{
      xAllNum = false;
    }
    if (typeof this.data[i][ykey] === "number"){
      yAllNum = true;
    }
    else{
      yAllNum = false;
    }
  }

  // if key values are all strings, key type is "d"
  if (xAllStr === true){
    this.xtype = "d";
  }
  else if (xAllNum === true){
    // if a bin number is given
    if (this.bin){
      this.xtype = "dc";
    }
    else{
      this.xtype = "c";
    }
  }
  else{
    this.xtype = "u";
  }

  // for y
  if (yAllStr === true){
    this.ytype = "d";
  }
  else if (yAllNum === true){
   // if a bin number is given
   if (this.bin){
     this.ytype = "dc";
   }
   else{
     this.ytype = "c";
   }
  }
  else{
   this.ytype = "u";
  }

  // if both xkey and ykey values are "c", find min & max
  if (this.xtype === "c" && this.ytype === "c"){
    this._xmin = this.data[0][xkey];
    this._xmax = this.data[0][xkey];
    this._ymin = this.data[0][ykey];
    this._ymax = this.data[0][ykey];
    for(let i=1;i<this.data.length;i++)
    {
        if(this.data[i][xkey]<this._xmin) this._xmin = this.data[i][xkey];
        if(this.data[i][xkey]>this._xmax) this._xmax = this.data[i][xkey];
        if(this.data[i][ykey]<this._ymin) this._ymin = this.data[i][ykey];
        if(this.data[i][ykey]>this._ymax) this._ymax = this.data[i][ykey];
    }
  }
}
