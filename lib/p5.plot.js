// p5.Plot
// "grammar of graphics" influenced data viz for p5.js
// creative coding summer vibes team, NYU IDM, 2018
//


// the plan should be
// the constructor lets you set up whatever parameters you want
// but won't render anything
// plot() renders to a p5.createGraphics
// redraw() plunks down the p5.graphics context already plot()'ed
// hover() draws the fucker on top of the graphics context

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
			this.gridweight = 4;
			this.fillcolor = 'WhiteSmoke';
			this.strokecolor = 'DarkRed';
			this.strokeweight = 1;
      this.pointdiameter = 20;
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
			this.xkey = ""; // key value for x axis
			this.ykey = ""; // key value for y axis
      this.pd = 1; // pixeldensity

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

      push();
      //noLoop();
      this.graphics = createGraphics((this.right-this.left), (this.bottom-this.top));
      pop();
      this.graphics.pixelDensity(this.pd);

      this.plotData = []; // create a new dataset to workwith instead of changing the original!!!!!!!!!!!!
			console.log('p5 plot!');

		}; // end of constructor


		// MAIN PLOTTER FUNCTION
		//
		plot (_args) {

			// integrate arguments (see above):
			for(let i in arguments)
			{
				Object.assign(this, arguments[i]);
			}

			this.parseData(); // figure out min and max scalings, etc.

      this.graphics.clear();

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
          case 'histogram':
            this.drawHistogram();
          break;
          case 'pie':
            this.drawPieChart();
          break;
			}

      this.redraw();
		}; // END OF MAIN PLOTTER FUNCTION



    //
    // DRAW A BACKGROUND
    //
    drawBackground(){
      this.graphics.push();
      this.graphics.scale(1/this.pd);
      // dont need bg rect anymore cuz graphics is a new canvas
      this.graphics.background(this.backgroundcolor);

      this.graphics.stroke(this.gridcolor);
      this.graphics.strokeWeight(this.gridweight);

      // map one more line than given
      // vertical lines
      for(let i = 0;i<this.cols+1;i++)
      {
        let x = map(i, 0, this.cols, this.gridweight/2, this.graphics.width-this.gridweight/2); // have to minus gridweight!!!!!!!!!!!!!!!!!!!!!!!!!
        this.graphics.line(x, 0, x, this.graphics.height);
      }
      // horizongtal lines
      for(let j = 0;j<this.rows+1;j++)
      {
        let y = map(j, 0, this.rows, this.gridweight/2, this.graphics.height-this.gridweight/2);
        this.graphics.line(0, y, this.graphics.width, y);
      }
      this.graphics.pop();
    }


    //
    // ALWAYS NEED TO CALL THIS FUNCTION TO DISPLAY
    //
    redraw(){
      // final
      push();
      imageMode(CORNER);
      image(this.graphics, this.left, this.top, this.right-this.left, this.bottom-this.top);
      pop();
    }

    hover(_x, _y, _hittype) {
      let flakiness = 5;
      let hitme = -1; // controlling the data index...
      // PART 1 - WHAT ARE WE HOVERING OVER?
      for(let i=0; i<this.plotData.length; i++)
      {
        if(_hittype=='point')
        {
          if(dist(_x, _y, this.plotData[i]._hoverx, this.plotData[i]._hovery) <= flakiness) {
            hitme = i;
            break;
          }
        }
        else if(_hittype=='bin')
        {
          if(_x>=this.plotData[i]._hoverx &&
             _x<=this.plotData[i]._hoverx+this.plotData[i]._hoverw &&
             _y>=this.plotData[i]._hovery &&
             _y<=this.plotData[i]._hovery+this.plotData[i]._hoverh)
             {
               hitme = i;
               break;
             }
        }
      }
      // PART 2 - DO THE HOVER
      if(hitme>-1)
      {
        push();
        var bgc = color(this.backgroundcolor);
        bgc.setAlpha(100);
        fill(bgc);
        var fgc = color(this.strokecolor);
        fgc.setAlpha(255);
        stroke(fgc);
        rect(_x, _y, 200, 100);
        noStroke();
        fill(fgc);
        textSize(12);

        if(_hittype=='point') {
          text("DATA:", this.plotData[hitme]._hoverx+10, this.plotData[hitme]._hovery+20);
          text(this.xkey + ": " + this.plotData[hitme][this.xkey], this.plotData[hitme]._hoverx+10, this.plotData[hitme]._hovery+40);
          text(this.ykey + ": " + this.plotData[hitme][this.ykey], this.plotData[hitme]._hoverx+10, this.plotData[hitme]._hovery+60);
        }
        else if(_hittype=='bin') {
          // highlight bin
          text("Bin "+ (hitme+1), _x+10, _y+20)
          text("Frequency: " + this.plotData[hitme].freq, _x+10, _y+40);
          text("Range: " + this.plotData[hitme].minBound +" to "+this.plotData[hitme].maxBound, _x+10, _y+60);
          push();
          noFill();
          stroke(0);
          strokeWeight(this.strokeweight);
          rect(this.plotData[hitme]._hoverx, this.plotData[hitme]._hovery, this.plotData[hitme]._hoverw, this.plotData[hitme]._hoverh)
          pop();
        }
        pop();
      }
    }

		//
		// parseData() - MAKE SENSE OF THE DATASET
		//
		parseData() {
      // really need to have different ways to parse data for different graphs!
      // STEP ONE:
      // what happens if the data array is not made up of object literals

      // simple array test:
      if(Array.isArray(this.data) && typeof(this.data[0])==="number")
      {
        var _newdata = this.tokenize(this.data); // fix
        this.data = _newdata; // swap
      }

      // STEP TWO:
      // fix if we have no xkey / ykey defined
      if(this.xkey=="") this.xkey = Object.keys(this.data[0])[0];
      if(this.ykey=="") this.ykey = Object.keys(this.data[0])[1];
      let xkey = this.xkey;
			let ykey = this.ykey;
      console.log(xkey + " " + ykey);
			this._xmin = this.data[0][xkey];
			this._xmax = this.data[0][xkey];
			this._ymin = this.data[0][ykey];
			this._ymax = this.data[0][ykey];
			for(let i=0;i<this.data.length;i++)
      {
					if(this.data[i][xkey]<this._xmin) this._xmin = this.data[i][xkey];
					if(this.data[i][xkey]>this._xmax) this._xmax = this.data[i][xkey];
					if(this.data[i][ykey]<this._ymin) this._ymin = this.data[i][ykey];
					if(this.data[i][ykey]>this._ymax) this._ymax = this.data[i][ykey];

          let currentData = new Object();
          currentData[xkey] = this.data[i][xkey];
          currentData[ykey] = this.data[i][ykey]

          this.plotData.push(currentData);
			}
		}

		//
		//
    // SORT AN ARRAY BASED ON A KEY
		//
		sortData(_key) {
			// sort by xkey
			this.data.sort(function(a, b) {
  			return a[_key] - b[_key];
			});

      this.plotData.sort(function(a, b) {
        return a[_key] - b[_key];
      });
		}

    //
    // TOKENIZE - utility to JSONify a simple array
    //
    tokenize(_arr) {
      var a = [];
      for(var i in _arr)
      {
        var j = {};
        j.index = i;
        j.value = _arr[i];
        a.push(j);
      }
      return(a);
    }

		//
		// LINE GRAPH
		//
		drawLineGraph() {
      console.log('Line Graph!');
			let px = 0;
			let py = 0;

			this.graphics.push();
      this.graphics.scale(1/this.pd);
			this.graphics.fill(this.fillcolor);
			this.graphics.stroke(this.strokecolor);
			this.graphics.strokeWeight(this.strokeweight);

			this.sortData(this.xkey);

			for(let i=0; i< this.plotData.length; i++)
			{
        this.plotData[i]._plotx = map(this.plotData[i][this.xkey], this._xmin, this._xmax, 0, this.graphics.width);
        this.plotData[i]._ploty = map(this.plotData[i][this.ykey], this._ymin, this._ymax, this.graphics.height, 0);
        let x = this.plotData[i]._plotx;
				let y = this.plotData[i]._ploty;

        this.graphics.line(px, py, x, y);

				px = x;
				py = y;

        this.plotData[i]._hoverx = map(this.plotData[i][this.xkey], this._xmin, this._xmax, this.left, this.right);
        this.plotData[i]._hovery = map(this.plotData[i][this.ykey], this._ymin, this._ymax, this.bottom, this.top);
			}
			this.graphics.pop();
      console.log(this.plotData);

		}

		//
		// POINT GRAPH
		//
    drawPointGraph() {
      console.log('Point Graph!');
      this.graphics.push();
      //this.graphics.scale(1/this.pd);
      this.graphics.fill(this.fillcolor);
      this.graphics.stroke(this.strokecolor);
      this.graphics.strokeWeight(this.strokeweight);

      for(let i=0;i<this.plotData.length;i++)
      {
        this.plotData[i]._plotx = map(this.plotData[i][this.xkey], this._xmin, this._xmax, 0, this.graphics.width);
        this.plotData[i]._ploty = map(this.plotData[i][this.ykey], this._ymin, this._ymax, this.graphics.height, 0);
        let x = this.plotData[i]._plotx;
        let y = this.plotData[i]._ploty;

        this.graphics.ellipse(x,y,this.pointdiameter,this.pointdiameter);

        this.plotData[i]._hoverx = map(this.plotData[i][this.xkey], this._xmin, this._xmax, this.left, this.right);
        this.plotData[i]._hovery = map(this.plotData[i][this.ykey], this._ymin, this._ymax, this.bottom, this.top);
      }

      this.graphics.pop();
      console.log(this.plotData);
    }

    //
    // AREA GRAPH
    //
    drawAreaGraph(){
      this.graphics.push();
      this.graphics.fill(this.fillcolor);
      this.graphics.stroke(this.strokecolor);
      this.graphics.strokeWeight(this.strokeweight);

      this.sortData(this.xkey);

      this.graphics.beginShape();
      this.graphics.vertex(0, this.graphics.height);

      for(let i=0; i< this.plotData.length; i++)
			{
        this.plotData[i]._plotx = map(this.plotData[i][this.xkey], this._xmin, this._xmax, 0, this.graphics.width);
        this.plotData[i]._ploty = map(this.plotData[i][this.ykey], this._ymin, this._ymax, this.graphics.height, 0);
        let x = this.plotData[i]._plotx;
				let y = this.plotData[i]._ploty;

        this.graphics.vertex(x, y);
        this.graphics.ellipse(x, y, 3, 3);

        this.plotData[i]._hoverx = map(this.plotData[i][this.xkey], this._xmin, this._xmax, this.left, this.right);
        this.plotData[i]._hovery = map(this.plotData[i][this.ykey], this._ymin, this._ymax, this.bottom, this.top);
			}

      this.graphics.vertex(this.right, this.bottom);

      this.graphics.endShape(CLOSE);

      this.graphics.pop();
      console.log(this.plotData);
    }

    //
    // PIE CHART
    //
    drawPieChart(){
      // takes one discrete data, one continues data
      // for example:
      // pieData = [{"x":13, "y":"a"}, {"x":16, "y":"b"}, {"x":57, "y":"c"}, {"x":34, "y":"d"}];
      // the number of y values is the number of slices
      this.graphics.push();
      this.graphics.fill(this.fillcolor);
      this.graphics.stroke(this.strokecolor);
      this.graphics.strokeWeight(this.strokeweight);

      // loop through data, find the total amount of x
      let total = 0;
      for(let i in this.data){
        total+=this.data[i][this.xkey];
      }

      // map the percentage into data
      for (let j in this.data){
        this.data[j]["percentage"] = this.data[j][this.xkey]/total;
      }
      console.log(this.data);

      let pieSize = (this.bottom-this.top)/1.5;
      let startAngle = 0;

      // start drawing!
      this.graphics.angleMode(RADIANS);
      // arc(x, y, w, h, start, stop, PIE)
      for (let k in this.data){
        let increaseAngle = this.data[k]["percentage"]*(2*PI);
        console.log(increaseAngle);
        this.graphics.arc(this.graphics.width/2, this.graphics.height/2, pieSize, pieSize, startAngle, startAngle+increaseAngle, PIE);
        startAngle += increaseAngle;
      }

      this.graphics.pop();

    }

    drawHistogram(){
      // histogram is taking one contineous variable
      // mapping frequencies within each bin

      // here let's assume we only take xkey to plot our histogram
      let numBins = this.bins;
      let binRange = (this._xmax-this._xmin)/numBins;
      // create an empty array that's the length of the number of bins
      let binArr = new Array(numBins);

      this.sortData(this.xkey); // may not be necessary as we only looking for frequency

      let currentMinBound = this._xmin;
      let currentMaxBound = this._xmin+binRange;
      for (let i=0; i<binArr.length;i++){
        // map an object to every array item!!!
        binArr[i] = {freq:0, minBound:currentMinBound, maxBound:currentMaxBound}; // this is for displaying info for hover!
        // loop through data to check how many items are within range!
        for(let j in this.data){
          let currentValue = this.data[j][this.xkey];
          if ((currentValue >= currentMinBound) && (currentValue<currentMaxBound)){
            binArr[i].freq ++;
          }
        }
        // move on to the next bin
        currentMinBound = currentMaxBound
        currentMaxBound += binRange
      }

      // find the min and max frequencies to map
      let minFreq = binArr[0].freq;
      let maxFreq = binArr[0].freq;
      // compare the length of each value array within a bin
      for (let k=0; k<binArr.length; k++){
        let currentFreq = binArr[k].freq;
        if (currentFreq < minFreq){
          minFreq = currentFreq;
        }
        if (currentFreq > maxFreq){
          maxFreq = currentFreq;
        }
      }

      this.graphics.push();

      this.graphics.fill(this.fillcolor);
      this.graphics.stroke(this.strokecolor);
      this.graphics.strokeWeight(this.strokeweight);

      // okay, so here if we want to have a hover function, and a plotData,
      // the plotData should just have the length of the bins
      // we need to at least store 4 hover values:
      // _hoverx _hovery, _hoverw, hoverh
      // for plot values, also 4
      // I'm just gonna reset plotData to empty here
      this.plotData = binArr;

      // start to draw rectangles!!!
      this.graphics.rectMode(CORNER); // x, y, w, h
      let drawWidth = (this.right-this.left)/numBins; // width of each rect
      let currentX = 0; // in graphics, start with 0
      for (let p=0; p<binArr.length; p++){
        this.plotData[p]._plotx = currentX;
        this.plotData[p]._plotw = drawWidth;

        let currentFreq = binArr[p].freq;
        this.plotData[p]._ploty = map(currentFreq, maxFreq, minFreq, 0, this.graphics.height); // y & h of this box
        this.plotData[p]._ploth = this.graphics.height-this.plotData[p]._ploty;

        this.graphics.rect(this.plotData[p]._plotx, this.plotData[p]._ploty, this.plotData[p]._plotw, this.plotData[p]._ploth);

        // add hover data
        this.plotData[p]._hoverx = this.left+currentX;
        this.plotData[p]._hoverw = drawWidth;
        this.plotData[p]._hovery = map(currentFreq, maxFreq, minFreq, this.top, this.bottom);
        this.plotData[p]._hoverh = this.bottom-map(currentFreq, maxFreq, minFreq, this.top, this.bottom);

        currentX += drawWidth;
      }

      console.log(this.plotData);

      this.graphics.pop();
    }


    //
    // BOX PLOT
    //
    drawBoxPlot(){
      // draw box plot
      // graph minimum, first quartile, median, third quartile, and maximum

      // only makes sense when there's discrete y and continuous x or;
      // discrete x and continuous y or;
      // one set of contineous numbers
      // for example:
      // boxData = [{"x":13, "y":"a"}, {"x":16, "y":"a"}, {"x":57, "y":"a"}, {"x":34, "y":"a"}, {"x":26, "y":"a"}, {"x":67, "y":"a"}, {"x":12, "y":"a"}, {"x":45, "y":"b"}, {"x":32, "y":"b"}, {"x":24, "y":"b"}, {"x":86, "y":"b"}, {"x":65, "y":"b"}, {"x":37, "y":"b"}, {"x":98, "y":"b"}];

      // here lets assume xkey is discrete and
      // ykey is continuous
      // draw horizontal graphs
      // the number of xkey represent number of boxes
      let xkey = this.xkey;
      let ykey = this.ykey;

      // if y is contineous, find min & max
      let ymin = this._ymin;
      let ymax = this._ymax;

      this.graphics.push();

      this.graphics.fill(this.fillcolor);
      this.graphics.stroke(this.strokecolor);
      this.graphics.strokeWeight(this.strokeweight);

      // if there's more than one set of continuous data
      // put every unique x value into the array
      let boxArr = [];
      let valueMin = ymin;
      let valueMax = ymax;

      // check in our data, how many unique x & push them into new array
      // if no xkey is given, x would just be default "", boxArr would have one value
      if (xkey === ""){
        console.log("no xkey!")
        boxArr = ["values"];
      }
      else{
        for(let i in this.data){
          if (!boxArr.includes(this.data[i][xkey])){
            boxArr.push(this.data[i][xkey]);
          }
        }
      }

      console.log(boxArr);
      let numBox = boxArr.length;
      let boxMargin = (this.graphics.height/numBox)/10; // default margin
      let boxY = boxMargin;
      let boxHeight = this.graphics.height/numBox - boxMargin*2;

      // for every box array value, draw a box
      for (let j=0; j<numBox; j++){
        let valueArr = [];
        for (let k in this.data){
          if (this.data[k][xkey] === boxArr[j])
           valueArr.push(this.data[k][ykey]);
           // check the value, if it's higher or lower than the min & max value
           if (this.data[k][ykey]<valueMin){
             valueMin = this.data[k][ykey];
           }
           else if (this.data[k][ykey]>valueMax){
             valueMax = this.data[k][ykey];
           }
        }

        let yQuartileBoundsArr = this.quartileBounds(valueArr);
        // map minimum, first quartile, median, third quartile, and maximum into the graph
        // two graphs should have a common scale instead of their own scale
        let boxMin = map(yQuartileBoundsArr[0], valueMin, valueMax, 0, this.graphics.width);
        let boxQ1 = map(yQuartileBoundsArr[1], valueMin, valueMax, 0, this.graphics.width);
        let boxMedian = map(yQuartileBoundsArr[2], valueMin, valueMax, 0, this.graphics.width);
        let boxQ3 = map(yQuartileBoundsArr[3], valueMin, valueMax, 0, this.graphics.width);
        let boxMax = map(yQuartileBoundsArr[4], valueMin, valueMax, 0, this.graphics.width);

        console.log(boxMin+' '+boxQ1+' '+boxMedian+' '+boxQ3+' '+ boxMax);

        // graph multiple horizontal box plots after dealing with data

        // the height of box, keep it constant
        //let boxHeight = this.bottom-this.top;

        this.drawOneBox(boxMin, boxQ1, boxMedian, boxQ3, boxMax, boxY, boxHeight);

        //draw next box, the Y pos will increase!
        boxY += boxMargin + boxHeight;
        }
      this.graphics.pop();
    }
    // find the median
    // if array is odd number, median is middle number
    // if array is even number, median is middle two numbers added then divide by two
    getMedian(sampleArr){
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
    quartileBounds(sampleArr){
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
      let _25percent = this.getMedian(_firstHalf);
      let _75percent = this.getMedian(_secondHalf);

      let _50percent = this.getMedian(sampleArr);
      let _100percent = max(sampleArr);

      return [ _0percent, _25percent, _50percent, _75percent, _100percent];
    }

    drawOneBox(boxMin, boxQ1, boxMed, boxQ3, boxMax, boxY, boxHeight){
      this.graphics.line(boxMin, boxY+boxHeight/4, boxMin, boxY+boxHeight/4+boxHeight/2); // minimum

      this.graphics.line(boxQ1, boxY, boxQ1, boxY+boxHeight); // Q1

      this.graphics.line(boxMed, boxY, boxMed, boxY+boxHeight); // median

      this.graphics.line(boxQ3, boxY, boxQ3, boxY+boxHeight); // Q3

      this.graphics.line(boxMax, boxY+boxHeight/4, boxMax, boxY+boxHeight/4+boxHeight/2); //maximum

      // connect
      this.graphics.line(boxQ1, boxY, boxQ3, boxY); // top of box
      this.graphics.line(boxQ1, boxY+boxHeight, boxQ3, boxY+boxHeight); // bot of box
      this.graphics.line(boxMin, boxY+boxHeight/2, boxQ1, boxY+boxHeight/2);
      this.graphics.line(boxQ3, boxY+boxHeight/2, boxMax, boxY+boxHeight/2);
    }

    //
    // DENSITY GRAPH
    //
    drawDensityGraph(){
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

      this.graphics.push();

      this.graphics.noFill();
      this.graphics.stroke(this.strokecolor);
      this.graphics.strokeWeight(this.strokeweight);

      // start to draw data points!!!
      let pointDist = this.graphics.width/numBins; // distance between each point
      let currentX = 0;

      this.graphics.beginShape();
      for (let q=0; q<binFreqArr.length;q++){
        let prevFreq = 0;
        let nextFreq = 0;

        if(q>0) prevFreq = binFreqArr[q-1];

        let currentFreq = binFreqArr[q];

        if(q<binFreqArr.length-1) nextFreq = binFreqArr[q+1];

        let currentY = map(currentFreq, maxFreq, minFreq, 0, this.graphics.height); // y & h of this box

        this.graphics.ellipse(currentX, currentY, this.pointdiameter, this.pointdiameter); // the actual data point

        let avgY = map((prevFreq+currentFreq+nextFreq)/3, maxFreq, minFreq, 0, this.graphics.height); // map a smoothing value

        this.graphics.curveVertex(currentX, avgY);
        currentX += pointDist;
      }
      this.graphics.endShape();

      this.graphics.pop();
    }
	}; // end of p5.Plot()
})); // end of craziness
