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
      //this.pd = 1; // pixeldensity
      this.barpct = 0.5;

      this.typelist = {};

      // function definitions
      this.typelist.line = { // 1 continuous
                            // continuous function x y
        xtype: 'continuous',
        ytype: 'continuous',
        function: this.drawLineGraph
      };

      this.typelist.point = { // continuous x, continuous y
        xtype: 'continuous',
        ytype: 'continuous',
        function: this.drawPointGraph
      };

      this.typelist.area = { // 1 continuous
                            // continuous function x y
        xtype: 'continuous',
        ytype: 'continuous',
        function: this.drawAreaGraph
      };

      this.typelist.density = { // 1 continuous
        xtype: 'continuous',
        ytype: 'none',
        function: this.drawDensityGraph
      };

      this.typelist.box = { // discrete x, continuous y
        xtype: 'discrete',
        ytype: 'continuous',
        function: this.drawBoxPlot
      };

      this.typelist.histogram = { // 1 continuous variable
        xtype: 'continuous',
        ytype: 'none',
        function: this.drawHistogram
      };

      this.typelist.bar = { // discrete x, continuous y
        xtype: 'discrete',
        ytype: 'continuous',
        function: this.drawBar
      };

      this.typelist.bar2 = { // discrete x, continuous y
        xtype: 'discrete',
        ytype: 'none',
        function: this.drawBar2
      };

      this.typelist.pie = {
        xtype: 'discrete',
        ytype: 'continuous',
        function: this.drawPieChart
      };

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
      this.graphics = createGraphics((this.right-this.left), (this.bottom-this.top));
      pop();
      //this.graphics.pixelDensity(this.pd);

      this.plotData = []; // create a new dataset to workwith instead of changing the original!!!!!!!!!!!!
			console.log('p5 plot!');

		}; // end of constructor

    // setters:
    set barwidth(_v) // bar percentage
    {
      this.barpct = constrain(_v, 0, 1);
    };

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
      this.typelist[this.type].function(this);

      this.redraw();
		}; // END OF MAIN PLOTTER FUNCTION

    //
    // DRAW A BACKGROUND
    //
    drawBackground(){
      this.graphics.push();
      // this.graphics.scale(1/this.pd);
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
      let flakiness = this.pointdiameter/2;
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
      if(this.xkey==""){
         this.xkey = Object.keys(this.data[0])[0];
      }
      if(this.ykey==""){
        this.ykey = Object.keys(this.data[0])[1];
      }

      console.log(this.xkey + " " + this.ykey);

      // STEP THREE:
      // make sure the keys are the right type
      console.log(this.typelist[this.type].xtype + " " + this.typelist[this.type].ytype);

      // & faceting
      // given an array as xkey/ykey

      if (Array.isArray(this.xkey)){
        this._xmin = this.data[0][this.xkey[0]];
        this._xmax = this.data[0][this.xkey[0]];
      }
      else{
        this._xmin = this.data[0][this.xkey];
        this._xmax = this.data[0][this.xkey];
      }
      if (Array.isArray(this.ykey)){
        this._ymin = this.data[0][this.ykey[0]];
        this._ymax = this.data[0][this.ykey[0]];
      }
      else{
        this._ymin = this.data[0][this.ykey];
        this._ymax = this.data[0][this.ykey];
      }


      for(let i=0;i<this.data.length;i++){ // iterate through all data!
        let currentData = new Object();
        // xkey
        if (Array.isArray(this.xkey)){ // xkey is array
          for (let j=0; j<this.xkey.length;j++){
            if(this.data[i][this.xkey[j]]<this._xmin) this._xmin = this.data[i][this.xkey[j]];
            if(this.data[i][this.xkey[j]]>this._xmax) this._xmax = this.data[i][this.xkey[j]];
            currentData[this.xkey[j]] = this.data[i][this.xkey[j]];
          }
          // min and max of total
        }
        else{
          if(this.data[i][this.xkey]<this._xmin) this._xmin = this.data[i][this.xkey];
          if(this.data[i][this.xkey]>this._xmax) this._xmax = this.data[i][this.xkey];
          currentData[this.xkey] = this.data[i][this.xkey];
        }

        // ykey
        if (Array.isArray(this.ykey)){ // ykey is array
          for (let i=0; i<this.ykey.length;i++){
            if(this.data[i][this.ykey[j]]<this._ymin) this._ymin = this.data[i][this.ykey[j]];
            if(this.data[i][this.ykey[j]]>this._ymax) this._ymax = this.data[i][this.ykey[j]];
            currentData[this.ykey[i]] = this.data[i][this.ykey[i]];
          }
        }
        else{
          if(this.data[i][this.ykey]<this._ymin) this._ymin = this.data[i][this.ykey];
          if(this.data[i][this.ykey]>this._ymax) this._ymax = this.data[i][this.ykey];
          currentData[this.ykey] = this.data[i][this.ykey];
        }
        this.plotData.push(currentData);
      }

    } // end of parseData



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
		drawLineGraph(that) {
      console.log('Line Graph!');


      that.graphics.push();
      //  that.graphics.scale(1/that.pd);
      that.graphics.fill(that.fillcolor);
      that.graphics.stroke(that.strokecolor);
      that.graphics.strokeWeight(that.strokeweight);

      // faceting: multiple xkeys
      for (let i=0; i<that.xkey.length; i++){
        //console.log(that.xkey[i]);
        that.sortData(that.xkey[i]);
        console.log(that.plotData);
        // start drawing
        let px = 0;
        let py = that.graphics.height;

        for(let j=0; j< that.plotData.length; j++)
        {
          console.log(that.plotData[j][that.xkey[i]]);
          that.plotData[j]._plotx = map(that.plotData[j][that.xkey[i]], that._xmin, that._xmax, 0, that.graphics.width);
          that.plotData[j]._ploty = map(that.plotData[j][that.ykey], that._ymin, that._ymax, that.graphics.height, 0);
          let x = that.plotData[j]._plotx;
          let y = that.plotData[j]._ploty;
          console.log("x: " + x + " y: " + y)

          that.graphics.line(px, py, x, y);

          px = x;
          py = y;

          that.plotData[j]._hoverx = map(that.plotData[j][that.xkey[i]], that._xmin, that._xmax, that.left, that.right);
          that.plotData[j]._hovery = map(that.plotData[j][that.ykey], that._ymin, that._ymax, that.bottom, that.top);
        }
        console.log(that.plotData);
      }
      that.graphics.pop();
		}

		//
		// POINT GRAPH
		//
    drawPointGraph(that) {
      console.log('Point Graph!');
      that.graphics.push();
      //that.graphics.scale(1/that.pd);
      that.graphics.fill(that.fillcolor);
      that.graphics.stroke(that.strokecolor);
      that.graphics.strokeWeight(that.strokeweight);

      for(let i=0;i<that.plotData.length;i++)
      {
        that.plotData[i]._plotx = map(that.plotData[i][that.xkey], that._xmin, that._xmax, 0, that.graphics.width);
        that.plotData[i]._ploty = map(that.plotData[i][that.ykey], that._ymin, that._ymax, that.graphics.height, 0);
        let x = that.plotData[i]._plotx;
        let y = that.plotData[i]._ploty;

        that.graphics.ellipse(x,y,that.pointdiameter,that.pointdiameter);

        that.plotData[i]._hoverx = map(that.plotData[i][that.xkey], that._xmin, that._xmax, that.left, that.right);
        that.plotData[i]._hovery = map(that.plotData[i][that.ykey], that._ymin, that._ymax, that.bottom, that.top);
      }

      that.graphics.pop();
      console.log(that.plotData);
    }

    //
    // AREA GRAPH
    //
    drawAreaGraph(that){
      that.graphics.push();
      that.graphics.fill(that.fillcolor);
      that.graphics.stroke(that.strokecolor);
      that.graphics.strokeWeight(that.strokeweight);

      that.sortData(that.xkey);

      that.graphics.beginShape();
      that.graphics.vertex(0, that.graphics.height);

      for(let i=0; i< that.plotData.length; i++)
			{
        that.plotData[i]._plotx = map(that.plotData[i][that.xkey], that._xmin, that._xmax, 0, that.graphics.width);
        that.plotData[i]._ploty = map(that.plotData[i][that.ykey], that._ymin, that._ymax, that.graphics.height, 0);
        let x = that.plotData[i]._plotx;
				let y = that.plotData[i]._ploty;

        that.graphics.vertex(x, y);
        that.graphics.ellipse(x, y, 3, 3);

        that.plotData[i]._hoverx = map(that.plotData[i][that.xkey], that._xmin, that._xmax, that.left, that.right);
        that.plotData[i]._hovery = map(that.plotData[i][that.ykey], that._ymin, that._ymax, that.bottom, that.top);
			}

      that.graphics.vertex(that.right, that.bottom);

      that.graphics.endShape(CLOSE);

      that.graphics.pop();
      console.log(that.plotData);
    }

    //
    // PIE CHART
    //
    drawPieChart(that){
      // takes one discrete data, one continues data
      // for example:
      // pieData = [{"x":13, "y":"a"}, {"x":16, "y":"b"}, {"x":57, "y":"c"}, {"x":34, "y":"d"}];
      // the number of y values is the number of slices
      that.graphics.push();
      that.graphics.fill(that.fillcolor);
      that.graphics.stroke(that.strokecolor);
      that.graphics.strokeWeight(that.strokeweight);

      // loop through data, find the total amount of x
      let total = 0;
      for(let i in that.data){
        total+=that.data[i][that.xkey];
      }

      // map the percentage into data
      for (let j in that.data){
        that.data[j]["percentage"] = that.data[j][that.xkey]/total;
      }
      console.log(that.data);

      let pieSize = (that.bottom-that.top)/1.5;
      let startAngle = 0;

      // start drawing!
      that.graphics.angleMode(RADIANS);
      // arc(x, y, w, h, start, stop, PIE)
      for (let k in that.data){
        let increaseAngle = that.data[k]["percentage"]*(2*PI);
        console.log(increaseAngle);
        that.graphics.arc(that.graphics.width/2, that.graphics.height/2, pieSize, pieSize, startAngle, startAngle+increaseAngle, PIE);
        startAngle += increaseAngle;
      }

      that.graphics.pop();

    }

    drawHistogram(that){
      // histogram is taking one contineous variable
      // mapping frequencies within each bin

      // here let's assume we only take xkey to plot our histogram
      let numBins = that.bins;
      let binRange = (that._xmax-that._xmin)/numBins;
      // create an empty array that's the length of the number of bins
      let binArr = new Array(numBins);

      that.sortData(that.xkey); // may not be necessary as we only looking for frequency

      let currentMinBound = that._xmin;
      let currentMaxBound = that._xmin+binRange;
      for (let i=0; i<binArr.length;i++){
        // map an object to every array item!!!
        binArr[i] = {freq:0, minBound:currentMinBound, maxBound:currentMaxBound}; // that is for displaying info for hover!
        // loop through data to check how many items are within range!
        for(let j in that.data){
          let currentValue = that.data[j][that.xkey];
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

      that.graphics.push();

      that.graphics.fill(that.fillcolor);
      that.graphics.stroke(that.strokecolor);
      that.graphics.strokeWeight(that.strokeweight);

      // okay, so here if we want to have a hover function, and a plotData,
      // the plotData should just have the length of the bins
      // we need to at least store 4 hover values:
      // _hoverx _hovery, _hoverw, hoverh
      // for plot values, also 4
      // I'm just gonna reset plotData to empty here
      that.plotData = binArr;

      // start to draw rectangles!!!
      that.graphics.rectMode(CORNER); // x, y, w, h
      let drawWidth = (that.right-that.left)/numBins; // width of each rect
      let currentX = 0; // in graphics, start with 0
      for (let p=0; p<binArr.length; p++){
        that.plotData[p]._plotx = currentX;
        that.plotData[p]._plotw = drawWidth;

        let currentFreq = binArr[p].freq;
        that.plotData[p]._ploty = map(currentFreq, maxFreq, minFreq, 0, that.graphics.height); // y & h of that box
        that.plotData[p]._ploth = that.graphics.height-that.plotData[p]._ploty;

        that.graphics.rect(that.plotData[p]._plotx, that.plotData[p]._ploty, that.plotData[p]._plotw, that.plotData[p]._ploth);

        // add hover data
        that.plotData[p]._hoverx = that.left+currentX;
        that.plotData[p]._hoverw = drawWidth;
        that.plotData[p]._hovery = map(currentFreq, maxFreq, minFreq, that.top, that.bottom);
        that.plotData[p]._hoverh = that.bottom-map(currentFreq, maxFreq, minFreq, that.top, that.bottom);

        currentX += drawWidth;
      }

      console.log(that.plotData);

      that.graphics.pop();
    }

    //
    // BAR GRAPH
    //

    drawBar(that){
      console.log('bar graph!');
      // discrete x, continuous y
      // here, assuming every x value is unique

      // get the number of unique x values
      let numBars = that.plotData.length;
      console.log(numBars);

      that.graphics.push();

      that.graphics.fill(that.fillcolor);
      that.graphics.stroke(that.strokecolor);
      that.graphics.strokeWeight(that.strokeweight);
      that.graphics.rectMode(CORNER); // x, y, w, h


      let drawWidth = ((that.right-that.left)/numBars)*that.barpct; // width of each rect
      let barMargin = ((that.right-that.left)/numBars-drawWidth)/2;
      let currentX = barMargin; // in graphics, start with 0

      for(let i=0;i<numBars;i++){
        that.plotData[i]._plotx = currentX;
        that.plotData[i]._plotw = drawWidth;
        that.plotData[i]._ploty = map(that.plotData[i][that.ykey], 0, that._ymax, that.graphics.height, 0); // y & h of that box
        that.plotData[i]._ploth = that.graphics.height - that.plotData[i]._ploty;

        that.graphics.rect(that.plotData[i]._plotx, that.plotData[i]._ploty, that.plotData[i]._plotw, that.plotData[i]._ploth);
        currentX += drawWidth+barMargin*2;
      }
      that.graphics.pop();
      console.log(that.plotData);
    }

    //
    // BAR GRAPH2
    //

    drawBar2(that){
      console.log('BAR FUCKEN GRAPH 2!');
      // discrete x
      // here, assuming every x value is NOT unique and will SUM the occurrences as the y

      // get the number of unique x values
      let ourData = {};
      let localymax = 0;
      for(let i = 0;i<that.plotData.length;i++)
      {
        if(ourData[that.plotData[i][that.xkey]] == undefined) // never seen this before
        {
          ourData[that.plotData[i][that.xkey]] = {};
          ourData[that.plotData[i][that.xkey]].count = 0;
        }
        ourData[that.plotData[i][that.xkey]].count++;
        localymax = max(localymax, ourData[that.plotData[i][that.xkey]].count);
      }

      let numBars = Object.keys(ourData).length;

      that.graphics.push();

      that.graphics.fill(that.fillcolor);
      that.graphics.stroke(that.strokecolor);
      that.graphics.strokeWeight(that.strokeweight);
      that.graphics.rectMode(CORNER); // x, y, w, h

      let drawWidth = ((that.right-that.left)/numBars)*that.barpct; // width of each rect
      let barMargin = ((that.right-that.left)/numBars-drawWidth)/2;
      let currentX = barMargin; // in graphics, start with 0
      console.log("barmargin: " + barMargin);
      for(let i in ourData){
        ourData[i]._plotx = currentX;
        ourData[i]._plotw = drawWidth;
        ourData[i]._ploty = map(ourData[i].count, 0, localymax, that.graphics.height, 0); // y & h of that box
        ourData[i]._ploth = that.graphics.height - ourData[i]._ploty;

        that.graphics.rect(ourData[i]._plotx, ourData[i]._ploty, ourData[i]._plotw, ourData[i]._ploth);
        currentX += drawWidth+barMargin*2;
      }
      that.graphics.pop();
      console.log(ourData);
      }

    //
    // BOX PLOT
    //
    drawBoxPlot(that){
      console.log('box plot!');
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
      let xkey = that.xkey;
      let ykey = that.ykey;

      // if y is contineous, find min & max
      let ymin = that._ymin;
      let ymax = that._ymax;

      that.graphics.push();

      that.graphics.fill(that.fillcolor);
      that.graphics.stroke(that.strokecolor);
      that.graphics.strokeWeight(that.strokeweight);

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
        for(let i in that.data){
          if (!boxArr.includes(that.data[i][xkey])){
            boxArr.push(that.data[i][xkey]);
          }
        }
      }

      console.log(boxArr);
      let numBox = boxArr.length;
      let boxMargin = (that.graphics.height/numBox)/10; // default margin
      let boxY = boxMargin;
      let boxHeight = that.graphics.height/numBox - boxMargin*2;

      // for every box array value, draw a box
      for (let j=0; j<numBox; j++){
        let valueArr = [];
        for (let k in that.data){
          if (that.data[k][xkey] === boxArr[j])
           valueArr.push(that.data[k][ykey]);
           // check the value, if it's higher or lower than the min & max value
           if (that.data[k][ykey]<valueMin){
             valueMin = that.data[k][ykey];
           }
           else if (that.data[k][ykey]>valueMax){
             valueMax = that.data[k][ykey];
           }
        }

        let yQuartileBoundsArr = that.quartileBounds(valueArr);
        // map minimum, first quartile, median, third quartile, and maximum into the graph
        // two graphs should have a common scale instead of their own scale
        let boxMin = map(yQuartileBoundsArr[0], valueMin, valueMax, 0, that.graphics.width);
        let boxQ1 = map(yQuartileBoundsArr[1], valueMin, valueMax, 0, that.graphics.width);
        let boxMedian = map(yQuartileBoundsArr[2], valueMin, valueMax, 0, that.graphics.width);
        let boxQ3 = map(yQuartileBoundsArr[3], valueMin, valueMax, 0, that.graphics.width);
        let boxMax = map(yQuartileBoundsArr[4], valueMin, valueMax, 0, that.graphics.width);

        console.log(boxMin+' '+boxQ1+' '+boxMedian+' '+boxQ3+' '+ boxMax);

        // graph multiple horizontal box plots after dealing with data

        // the height of box, keep it constant
        //let boxHeight = this.bottom-this.top;

        that.drawOneBox(boxMin, boxQ1, boxMedian, boxQ3, boxMax, boxY, boxHeight);

        //draw next box, the Y pos will increase!
        boxY += boxMargin + boxHeight;
        }
      that.graphics.pop();
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
    drawDensityGraph(that){
      // density graph is taking one contineous variable
      // here we assume a bin is given, !!!!!!!!!!!!but possibly no bin and discrete data is given!!!!!!!!!
      // mapping frequencies within each bin
      // find the percentage of the frequency

      // here let's assume we only take xkey
      let xkey = that.xkey;
      //let ykey = that.ykey;

      let xmin = that._xmin;
      let xmax = that._xmax;
      //let ymin = that._ymin;
      //let ymax = that._ymax;

      let numBins = that.bins;
      let binRange = (xmax-xmin)/numBins;
      // create an empty array with numBins of items, later will store the number of values in that bin
      let binFreqArr = new Array(numBins);

      that.sortData(xkey); // may not be necessary as we only looking for frequency

      let currentMinBound = xmin;
      let currentMaxBound = xmin+binRange;
      for (let j=0; j<binFreqArr.length;j++){
        binFreqArr[j] = 0;
        for(let k in that.data){
          let currentValue = that.data[k][xkey];
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

      that.graphics.push();

      that.graphics.noFill();
      that.graphics.stroke(that.strokecolor);
      that.graphics.strokeWeight(that.strokeweight);

      // start to draw data points!!!
      let pointDist = that.graphics.width/numBins; // distance between each point
      let currentX = 0;

      that.graphics.beginShape();
      for (let q=0; q<binFreqArr.length;q++){
        let prevFreq = 0;
        let nextFreq = 0;

        if(q>0) prevFreq = binFreqArr[q-1];

        let currentFreq = binFreqArr[q];

        if(q<binFreqArr.length-1) nextFreq = binFreqArr[q+1];

        let currentY = map(currentFreq, maxFreq, minFreq, 0, that.graphics.height); // y & h of that box

        that.graphics.ellipse(currentX, currentY, that.pointdiameter, that.pointdiameter); // the actual data point

        let avgY = map((prevFreq+currentFreq+nextFreq)/3, maxFreq, minFreq, 0, that.graphics.height); // map a smoothing value

        that.graphics.curveVertex(currentX, avgY);
        currentX += pointDist;
      }
      that.graphics.endShape();

      that.graphics.pop();
    }
	}; // end of p5.Plot()
})); // end of craziness
