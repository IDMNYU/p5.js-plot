// p5.Plot
// "grammar of graphics" influenced data viz for p5.js
// creative coding summer vibes team, NYU IDM, 2018
//

// the usual craziness:
(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define('p5.func', ['p5'], function (p5) { (factory(p5));});
  else if (typeof exports === 'object')
    factory(require('../p5'));
  else
    factory(root['p5']);
}(this, function (p5) {

	//
	// start real stuff
	//

	// new style:
	p5.Plot = class {

		// this runs when you instantiate:
		// (also contains property defaults)
		constructor (_args) {

			//
			// defaults:
			//
			this.backgroundcolor = 'Cornsilk';
			this.gridcolor = 'DarkSlateBlue';
			this.gridweight = 1;
			this.fillcolor = 'WhiteSmoke';
			this.strokecolor = 'DarkRed';
			this.strokeweight = 1;
			this.background = true;
			this.type = 'line'; // type of plot
			this.stat = 'bin'; // statistical transformation for 1-var plots
			this.bins = 30; // number of slices in binning plots
			this.xlabel = 'x';
			this.ylabel = 'y';
			this.xlabelvisible = true;
			this.ylabelvisible = true;
			this.cols = 5;
			this.rows = 5;
			this.left = 0;
			this.top = 0;
			this.right = width;
			this.bottom = height;
			this.data = {};
			this.xkey = 0; // key value for x axis
			this.ykey = 1; // key value for y axis
			//
			// end defaults
			//

			// internals:
			this._xmin; // internal
			this._xmax; // internal
			this._ymin; // internal
			this._ymax; // internal

			// integrate arguments:
      // this is an awesome ES6 hack where the Object.assign()
      // method lets you splice shit from one Object literal into
      // another Object, just replacing whatever's there.
			for(let i in arguments)
			{
				Object.assign(this, arguments[i]);
			}
			console.log('welcome to p5.Plot()');

		}; // end of constructor

		//
		// MAIN PLOTTER FUNCTION
		//
		plot (_args) {

			// integrate arguments (see above):
			for(let i in arguments)
			{
				Object.assign(this, arguments[i]);
			}

			this.parseData(); // figure out min and max scalings, etc.

			// draw a background?
			if(this.background) this.drawBackground();

			// which graph style?
			switch(this.type) {
					case 'line':
						this.drawLineGraph();
					break;
					case 'point':
						this.drawPointGraph();
          break;
          case 'area':
  					this.drawAreaGraph();
          break;
          case 'density':
            this.drawDensityGraph();
          break;
          case 'box':
            this.drawBoxPlot();
          break;
          case 'dot':
            this.drawDotPlot();
          break;
          case 'histogram':
            //this.drawHistogram();
            this.drawAlexHistogram();
          break;
          case 'bar':
            this.drawBarGraph();
          break;
          case 'alex':
  					this.drawAlex();
          break;
          case 'sally':
    				this.drawSally();
					break;
			}

		}; // END OF MAIN PLOTTER FUNCTION

    hover(_x, _y) {
      let xkey = this.xkey;
			let ykey = this.ykey;
      let flakiness = 5;
      for(let i in this.data)
      {
        if(_x>this.data[i]._plotx-flakiness&&_x<this.data[i]._plotx+flakiness&&_y>this.data[i]._ploty-flakiness&&_y<this.data[i]._ploty+flakiness)
        {
          push();
          fill(this.backgroundcolor);
          stroke(this.strokecolor);
          textSize(12);
          rect(this.data[i]._plotx, this.data[i]._ploty, 200, 100);
          fill(this.strokecolor);
          text("DATA:", this.data[i]._plotx+10, this.data[i]._ploty+20);
          text(xkey + ": " + this.data[i][xkey], this.data[i]._plotx+10, this.data[i]._ploty+40);
          text(ykey + ": " + this.data[i][ykey], this.data[i]._plotx+10, this.data[i]._ploty+60);
          pop();
          break;
        }
      }
    }

		//
		// drawBackground() - BACKGROUND PANE WITH GRAPH LINES
		//
		drawBackground() {
			push();
			fill(this.backgroundcolor);
			stroke(this.gridcolor);
			strokeWeight(this.gridweight);
			// background rectangle
			rect(this.left, this.top, this.right-this.left, this.bottom-this.top);
			// x lines
			for(let i = 0;i<this.cols;i++)
			{
				let x = map(i, 0, this.cols, this.left, this.right);
				line(x, this.top, x, this.bottom);
			}
			// y lines
			for(let j = 0;j<this.rows;j++)
			{
				let y = map(j, 0, this.rows, this.top, this.bottom);
				line(this.left, y, this.right, y);
			}
			pop();
		}

		//
		// parseData() - MAKE SENSE OF THE DATASET
		//
		parseData() {
			let xkey = this.xkey;
			let ykey = this.ykey;
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

		//
		// sortData() - SORT AN ARRAY BASED ON A KEY
		//
		sortData(_key) {
			// sort by xkey
			this.data.sort(function(a, b) {
  			return a[_key] - b[_key];
			});


		}

		//
		// LINE GRAPH
		//
		drawLineGraph() {
			let xkey = this.xkey;
			let ykey = this.ykey;

			let xmin = this._xmin;
			let xmax = this._xmax;
			let ymin = this._ymin;
			let ymax = this._ymax;
			let px = 0;
			let py = 0;

			push();

			fill(this.fillcolor);
			stroke(this.strokecolor);
			strokeWeight(this.strokeweight);

			this.sortData(xkey);
			for(let i in this.data)
			{
        this.data[i]._plotx = map(this.data[i][xkey], xmin, xmax, this.left, this.right);
        this.data[i]._ploty = map(this.data[i][ykey], ymin, ymax, this.bottom, this.top);
        let x = this.data[i]._plotx;
				let y = this.data[i]._ploty;
				if(i>0) line(px, py, x, y);
				px = x;
				py = y;
			}
			pop();

		}

		//
		// POINT GRAPH
		//
		drawPointGraph() {
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

			for(let i in this.data)
			{
        this.data[i]._plotx = map(this.data[i][xkey], xmin, xmax, this.left, this.right);
        this.data[i]._ploty = map(this.data[i][ykey], ymin, ymax, this.bottom, this.top);
				let x = this.data[i]._plotx;
				let y = this.data[i]._ploty;

				ellipse(x,y,5,5);
			}

			pop();

		}

	}; // end of p5.Plot()


})); // end of craziness

p5.Plot.prototype.drawAlex = function()
{

}

/*
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
*/

/*
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
*/
/*
p5.Plot.prototype.drawBoxPlot = function(){
  // draw box plot
  // graph minimum, first quartile, median, third quartile, and maximum

  // only makes sense when there's discrete y and continuous x or;
  // discrete x and continuous y
  // for example:
  // boxData = [{"x":13, "y":"a"}, {"x":16, "y":"a"}, {"x":57, "y":"a"}, {"x":34, "y":"a"}, {"x":26, "y":"a"}, {"x":67, "y":"a"}, {"x":12, "y":"a"},
   {"x":45, "y":"b"}, {"x":32, "y":"b"}, {"x":24, "y":"b"}, {"x":86, "y":"b"}, {"x":65, "y":"b"}, {"x":37, "y":"b"}, {"x":98, "y":"b"}];


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
*/
/*
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
*/

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

/*
p5.Plot.prototype.drawPieChart = function{

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


///////////// STUFF SALLY WORKED ON /////////////////////////

p5.Plot.prototype.drawBarGraph = function()
{
  //let xkey = this.xkey;
  //let ykey = this.ykey;
  let key;
  let max;
  let keyArr;
  let keyObj;
  let spacing

  this._ymin = 0;
  this._xmin = 0;

  if (this.xkey != 0){
    keyArr = this.barSort(this.xkey);
    key = this.xkey;
    keyObj = this.barParse(key);
    spacing = (this.right - this.left)/keyArr.length;
  }
  else if (this.ykey != 1){
    keyArr = this.barSort(this.ykey);
    key = this.ykey;
    keyObj = this.barParse(key);
    spacing = (this.bottom - this.top)/keyArr.length
  }

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);
  max = keyObj[0].quantity;

  for(let i in keyObj){
    if(keyObj[i].quantity > max){max = keyObj[i].quantity;}
  }

  if (key == this.xkey){
    this._xmax = keyArr.length;
    this._ymax = max;
  }
  else if (key == this.ykey){
    this._xmax = max;
    this._ymax = keyArr.length;
  }


  push();
  let x;
  let y;
  let w;
  let h;

  if (key == this.xkey){
    x = this.left;
    y= 0;
    w= this.left;
    h= 0;
  }
  else if (key == this.ykey){
    x = this.left;
    y = this.top;
    w = 0;
    h = this.top;
  }

  rectMode(CORNERS);

  for(let k=0; k < keyObj.length; k++)
  {
    if (key == this.xkey){
      y = map(keyObj[k].quantity, 0, this._ymax, this.bottom, this.top);
      w += spacing;
      h = this.bottom;
      rect(x, y, w, h)
      x += spacing;
    }
    else if (key == this.ykey){
      h += spacing;
      w = map(keyObj[k].quantity, 0, max, this.left, this.right)
      rect(x, y, w, h)
      y+= spacing;
    }
  }

  pop();
}

p5.Plot.prototype.barSort = function(_key){
  keyArr = [this.data[0][_key]];
  this.data[0][_key] = 0;

  for(let i=1;i<this.data.length;i++){
    let index = keyArr.indexOf(this.data[i][_key])
    if(index == -1){
      keyArr.push(this.data[i][_key])
      this.data[i][_key] = keyArr.length - 1;
    }
    else if (index != -1){
      this.data[i][_key] = index;
    }
  }
  return keyArr;
}

p5.Plot.prototype.barParse = function(key){
  keyObj = [{"key": keyArr[0], "quantity": 0}];

  for(let j=1; j<keyArr.length; j++){
    keyObj.push({"key": keyArr[j], "quantity": 0})
  }

  for(let k=0; k<this.data.length; k++){
    let search = this.data[k][key];
    keyObj[search].quantity += 1;
  }
  return keyObj;
}

p5.Plot.prototype.drawDotPlot = function(){

  let range = this._xmax - this._xmin;
  let max = this._xmax;
  let min = this._xmin;
  let key = this.xkey;
  let xDots  = this.cols - 1;
  let yDots = this.rows - 1;

  while (range % xDots != 0){
    range += 1;
  }

  let barRange = range / xDots;
  let keyArr = this.findKeys(barRange, min,max);
  let keyObj = this.histParse(keyArr, key, barRange);

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  let qmax = keyObj[0].quantity;

  for(let i in keyObj){
    if(keyObj[i].quantity > qmax){qmax = keyObj[i].quantity;}
  }

  console.log(keyObj);

  push();

  let xone = (this.right - this.left) / xDots;
  let xhalf = xone / 2;
  let yone = (this.top - this.bottom)/yDots
  let yhalf = yone / 2


  let x = this.left + xhalf;
  let y = this.bottom + yhalf;
  let w;

  if (yone <= xone){w = yone;}
  else{w = xone;}

  ellipseMode(CENTER);


  for(let k=0; k < keyObj.length; k++) {
    let dotNum = keyObj[k].quantity / yDots;
    for(let j = 0; j < dotNum; j++){
      ellipse(x, y, w);
      y += yone;
    }
    x += xone;
    y = this.bottom + yhalf;

  }
  pop();

}


p5.Plot.prototype.drawHistogram = function(){

  let range;
  let min;
  let max;
  let key;
  let bars;

  if (this.xkey != 0){
    range = this._xmax - this._xmin;
    max = this._xmax;
    min = this._xmin;
    key = this.xkey;
    bars  = this.cols;
  }
  else if (this.ykey != 1){
    range = this._ymax - this._ymin;
    max = this._ymax;
    min = this._ymin;
    key = this.ykey;
    bars = this.rows;
  }
  while (range % bars != 0){
    range += 1;
  }
  let barRange = range / bars;
  let keyArr = this.findKeys(barRange, min,max);
  let keyObj = this.histParse(keyArr, key, barRange);

  fill(this.fillcolor);
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  let qmax = keyObj[0].quantity;

  for(let i in keyObj){
    if(keyObj[i].quantity > qmax){qmax = keyObj[i].quantity;}
  }

  console.log(keyObj);

  push();

  let x;
  let y;
  let w;
  let h;
  let spacing

  if (key == this.xkey){
    x = this.left;
    y= 0;
    w= this.left;
    h= 0;
    spacing = (this.right - this.left)/(this.cols);

  }
  else if (key == this.ykey){
    x = this.left;
    y = this.top;
    w = 0;
    h = this.top;
    spacing = (this.top - this.bottom)/this.rows;
  }

  rectMode(CORNERS);

  for(let k=0; k < keyObj.length; k++)
  {
    if (key == this.xkey){
      y = map(keyObj[k].quantity, 0, qmax, this.bottom, this.top);
      w += spacing;
      h = this.bottom;
      rect(x, y, w, h)
      x += spacing;

    }
    else if (key == this.ykey){
      h -= spacing;
      w = map(keyObj[k].quantity, 0, qmax, this.left, this.right)
      rect(x, y, w, h)
      y-= spacing;
    }
  }


  pop();

}

p5.Plot.prototype.findKeys = function(barRange, min, max){
  let keyArr = [];
  let mult = 0;
  while ((mult * barRange) < min){
    mult += 1;
  }
  mult -=1;
  for (i = 0; i < this.cols; i++){
    keyArr.push(mult);
    mult += 1;
  }
  return keyArr;
}

p5.Plot.prototype.histParse = function(keyArr, key, barRange){
  keyObj = [{"key": (keyArr[0]* barRange) + "-" + ((keyArr[0] + 1) * barRange), "quantity": 0}];

  for(let j=1; j<keyArr.length; j++){
    keyObj.push({"key": (keyArr[j]* barRange) + "-" + ((keyArr[j] + 1) * barRange), "quantity": 0})
  }

  for(let k=0; k<this.data.length; k++){
    let num = this.data[k][key];
    for (let i = 0; i < keyArr.length; i++){
      if (num >= keyArr[keyArr.length - 1] * barRange){
        keyObj[keyArr.length - 1].quantity += 1;
      }
      else if (num >= keyArr[i] * barRange && num <  keyArr[i + 1] * barRange){
        keyObj[i].quantity += 1
      }
    }
  }
  return keyObj;
}
