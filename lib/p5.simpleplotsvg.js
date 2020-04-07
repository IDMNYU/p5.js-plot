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

//
// to do 3/24:
// alex adds back in some styles using the new svg regime
// luke figures out how to do grid lines and keys
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
			this.type = 'line'; // type of plot
			this.stat = 'bin'; // statistical transformation for 1-var plots
			this.bins = 30; // number of slices in binning plots

			this.left = 0;
			this.top = 0;
      this.width = width;
      this.height = height;
      this.padding = width*0.02; // in pixels

      // color shit
      this._fillcolor = "white";
      this._strokecolor = "black";

      this.pointdiameter = 5;
      this.strokeweight = 1;

			this._data = {};
      this._xkey = [];
      this._ykey = [];
      this._needsparse = true;
      this._needssort = true;
      this.plotSVGURL;

      this.typelist = {};

      this.aa = 8; // antialising factor for rending svg

      this.svghtml = '';
      this.plotImg;

      // function definitions
      this.typelist.line = { // continuous function x y
        xtype: 'continuous',
        ytype: 'continuous',
        function: this.drawLineGraph
      };

      this.typelist.point = { // continuous x, continuous y
        xtype: 'continuous',
        ytype: 'continuous',
        function: this.drawPointGraph
      };

      this.typelist.bar1 = { // discrete x, count occurances of each unique x
        xtype: 'discrete',
        ytype: null,
        function: this.drawBarGraph1
      };

      this.typelist.bar2 = { // discrete x, continuous y, add all y for each unique x
        xtype: 'discrete',
        ytype: 'continuous',
        function: this.drawBarGraph2
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

      this.plotData = [];            // create a new dataset to workwith instead of changing the original
			console.log('p5 plot!');

		}; // end of constructor

    // setters:
    set xkey (xkey) {
      this._xkey = Array.isArray(xkey) ? xkey : [xkey];
    }
    get xkey() {
      return this._xkey;
    }
    set ykey (ykey) {
      this._ykey = Array.isArray(ykey) ? ykey : [ykey];
    }
    get ykey() {
      return this._ykey;
    }
    set data (data) {
      this._data = data;
      this._needsparse = true;
      this._needssort = true;
    }
    get data() {
      return this._data;
    }

    set fillcolor (fillcolor) {
      this._fillcolor = this.colorfucker(fillcolor);
    }
    get fillcolor() {
      return this._fillcolor;
    }

    set strokecolor (strokecolor) {
      this._strokecolor = this.colorfucker(strokecolor);
    }
    get strokecolor() {
      return this._strokecolor;
    }

		// MAIN PLOTTER FUNCTION
		//
		plot (_args) {

			// integrate arguments (see above):
			for(let i in arguments)
			{
				Object.assign(this, arguments[i]);
			}

      if(this._needsparse) this.parseData();

      // start writing to svghtml
      this.svghtml = '<svg xmlns="http://www.w3.org/2000/svg" width="'+(this.width*this.aa).toString()+'" height="'+(this.height*this.aa).toString()+'">';

      // which graph style?
      // DRAW THE GRAPHS!!!
      if(Array.isArray(this.type)) {
        for(let i in this.type)
        {
          this.typelist[this.type[i]].function(this);
        }
      }
      else {
        this.typelist[this.type].function(this);
      }

      this.svghtml += '</svg>';

      console.log(this.svghtml);
      // make it base64
      let svg64 = btoa(this.svghtml);
      let b64Start = 'data:image/svg+xml;base64,';

      // prepend a "header"
      this.plotSVGURL = b64Start + svg64;

      this.plotImg = loadImage(this.plotSVGURL);

    }; // END OF MAIN PLOTTER FUNCTION

    // draw function display
    draw(_x=this.left, _y=this.top, _w=this.width, _h=this.height){
        image(this.plotImg, _x, _y, _w, _h);
    }

		//
		// parseData() - MAKE SENSE OF THE DATASET
		//
		parseData() {
      console.log("PARSING!!! " + millis());
      //console.log(this.dataUnchanged());
      // STEP ONE:
      // what happens if the data array is not made up of object literals

      // simple array test:
      if(Array.isArray(this._data) && typeof(this._data[0])==="number")
      {
        var _newdata = this.tokenize(this._data); // fix
        this._data = _newdata; // swap
      }

      // STEP TWO:
      // fix if we have no xkey / ykey defined
      if(this._xkey.length==0){
         this._xkey = [Object.keys(this._data[0])[0]];
      }
      if(this._ykey.length==0){
        this._ykey = [Object.keys(this._data[0])[1]];
      }

      // STEP THREE:
      // make sure the keys are the right type
      // console.log(this.typelist[this.type].xtype + " " + this.typelist[this.type].ytype);

      this._xmin = this._data[0][this._xkey[0]];
      this._xmax = this._data[0][this._xkey[0]];
      this._ymin = this._data[0][this._ykey[0]];
      this._ymax = this._data[0][this._ykey[0]];

      for(let i=0;i<this._data.length;i++){ // iterate through all data!
        let currentData = new Object();
        // xkey
        for (let j=0; j<this._xkey.length;j++){
          if(this._data[i][this._xkey[j]]<this._xmin) this._xmin = this._data[i][this._xkey[j]];
          if(this._data[i][this._xkey[j]]>this._xmax) this._xmax = this._data[i][this._xkey[j]];
          currentData[this._xkey[j]] = this._data[i][this._xkey[j]];
        }

        // ykey
        for (let k=0; k<this._ykey.length;k++){
          if(this._data[i][this._ykey[k]]<this._ymin) this._ymin = this._data[i][this._ykey[k]];
          if(this._data[i][this._ykey[k]]>this._ymax) this._ymax = this._data[i][this._ykey[k]];
          currentData[this._ykey[k]] = this._data[i][this._ykey[k]];
        }

        // data we actually use
        this.plotData.push(currentData);
      }

      this._needsparse = false;

    } // end of parseData

		//
    // SORT AN ARRAY BASED ON A KEY
		//
		sortData(_key) {
      console.log("SORTING!!! " + millis());
			// sort by xkey
			this._data.sort(function(a, b) {
  			return a[_key] - b[_key];
			});

      this.plotData.sort(function(a, b) {
        return a[_key] - b[_key];
      });

      this._needssort = false;
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

      push();
      // need to figure out a way to do this for all graphs
      // faceting: multiple xkeys
      // iterate through all x keys

      // what happens when multiple xkeys and ykeys?
      for (let i=0; i<that._xkey.length; i++) {

        that.svghtml += '<polyline points="';

        if(that._needssort) that.sortData(that._xkey[i]);

        // iterate through all datasets
        for(let j=0; j< that.plotData.length; j++)
        {
          that.plotData[j]._plotx = map(that.plotData[j][that._xkey[i]], that._xmin, that._xmax, that.padding*that.aa, (that.width-that.padding)*that.aa);
          that.plotData[j]._ploty = map(that.plotData[j][that._ykey], that._ymin, that._ymax, (that.height-that.padding)*that.aa, that.padding*that.aa);

          let x = that.plotData[j]._plotx;
          let y = that.plotData[j]._ploty;

          that.svghtml += x.toString()+','+y.toString()+ ' ';
        }
      }
      pop();
      that.svghtml += '" style="fill:none;stroke:'+that.strokecolor+';stroke-width:'+(that.strokeweight*that.aa).toString()+'"/>';

		}

		//
		// POINT GRAPH
		//
    drawPointGraph(that) {
      push();

      // iterate through all xkeys
      for (let i=0; i<that._xkey.length; i++) {

        for(let j=0;j<that.plotData.length;j++)
        {
          that.plotData[j]._plotx = map(that.plotData[j][that._xkey[i]], that._xmin, that._xmax, that.padding*that.aa, (that.width-that.padding)*that.aa);
          that.plotData[j]._ploty = map(that.plotData[j][that._ykey], that._ymin, that._ymax, (that.height-that.padding)*that.aa, that.padding*that.aa);
          let x = that.plotData[j]._plotx;
          let y = that.plotData[j]._ploty;

          that.svghtml += '<circle cx="' + x.toString() + '" cy="' + y.toString() + '" r="' + (that.pointdiameter*2*that.aa).toString() + '" stroke="'+that.strokecolor+'" stroke-width="'+(that.strokeweight*that.aa).toString()+'" fill="'+that.fillcolor+'"/>';

        }
      }
      pop();
    }

    drawBarGraph1(that){
      // discrete x, count occurances of each unique x
      let uniqueXArr = [];
      let countArr = [];

      for(let i=0;i<that.plotData.length;i++){
        let currentXKey = that.plotData[i][that.xkey];
        // if this xkey already in the array, add one to count
        if (uniqueXArr.includes(currentXKey)){
          countArr[uniqueXArr.findIndex(currentXKey)]+=1;
        }
        // if not already in the array, add this xkey to array
        else{
          uniqueXArr.push(currentXKey);
          countArr.push(1);
        }
      }

      // number of unique x values determine how many bars there are
      // counter determines how tall each bar are
      let barW = ((that.width-that.padding)*that.aa - that.padding*that.aa)/uniqueXArr.length;
      let barX = that.padding*that.aa;

      for (let j=0; j<uniqueXArr.length; j++){
        let barH = map(0, max(countArr), that.padding*that.aa, (that.height-that.padding)*that.aa);
        let barY = (that.height-that.padding)*that.aa - barH;
        that.svghtml += '<rect x="' + barX.toString() + '" y="' + barY.toString() + '" width="' + barW.toString() + '" height="' + barH.toString() + '" stroke="'+that.strokecolor+'" stroke-width="'+(that.strokeweight*that.aa).toString()+'" fill="'+that.fillcolor+'"/>';

        /* how to draw rect in svg
        <rect x="50" y="20" width="150" height="150"
        style="fill:blue;stroke:pink;stroke-width:5"/>
        */
        barX += barW;
      }
    }


    drawBarGraph2(that){
      // discrete x, continuous y, add all y for each unique x

    }

    colorfucker(_c)
    {
      var rc;
      var cm0 = colorMode()._colorMaxes[colorMode()._colorMode][0]; // r/h
      var cm1 = colorMode()._colorMaxes[colorMode()._colorMode][1]; // g/s
      var cm2 = colorMode()._colorMaxes[colorMode()._colorMode][2]; // b/b/l
      var cm3 = colorMode()._colorMaxes[colorMode()._colorMode][3]; // a

      // in CSS, the maxes are:
      // for rgba: 255, 255, 255, 1
      // for hsla: 360, 100%, 100%, 1

      if(Array.isArray(_c)){
        if(_c.length==1) rc = "rgb("+_c[0]+", " + _c[0] + ", " + _c[0] + ")";
        if(_c.length==2) rc = "rgba("+_c[0]+", " + _c[0] + ", " + _c[0] + ", " + _c[1]/255 + ")";
        if(_c.length==3&&colorMode()._colorMode=="rgb") rc = "rgb("+_c[0]/cm0*255+", " + _c[1]/cm1*255 + ", " + _c[2]/cm2*255 + ")";
        if(_c.length==4&&colorMode()._colorMode=="rgb") rc = "rgba("+_c[0]/cm0*255+", " + _c[1]/cm1*255 + ", " + _c[2]/cm2*255 + ", " + _c[3]/cm3 + ")";
        if(_c.length==3&&(colorMode()._colorMode=="hsb"||colorMode()._colorMode=="hsl")) rc = "hsl("+_c[0]/cm0*360+", " + _c[1]/cm1*100 + "%, " + _c[2]/cm2*100 + "%)";
        if(_c.length==4&&(colorMode()._colorMode=="hsb"||colorMode()._colorMode=="hsl")) rc = "hsla("+_c[0]/cm0*360+", " + _c[1]/cm1*100 + "%, " + _c[2]/cm2*100 + "%, " + _c[3]/cm3 + ")";
      }
      else if(Number.isInteger(_c)) {
        rc = "rgb("+_c+", " + _c + ", " + _c + ")";
      }
      else {
        rc = _c;
      }
      return(rc);
    }

	}; // end of p5.Plot()
})); // end of craziness
