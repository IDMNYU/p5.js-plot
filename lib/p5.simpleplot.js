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
			this.type = 'line'; // type of plot
			this.stat = 'bin'; // statistical transformation for 1-var plots
			this.bins = 30; // number of slices in binning plots
			this.cols = 5;
			this.rows = 5;
			this.left = 0;
			this.top = 0;
      this.pointdiameter = 5;
			this.right = width;
			this.bottom = height;
			this.data = {};
			//this.xkey = ""; // key value for x axis
			//this.ykey = ""; // key value for y axis
      this._xkey = [];
      this._ykey = [];
      //this.pd = 1; // pixeldensity
      this.barpct = 0.5;

      this.typelist = {};

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

      this.plotData = []; // create a new dataset to workwith instead of changing the original!!!!!!!!!!!!
			console.log('p5 plot!');

		}; // end of constructor

    // setters:
    set xkey (xkey) {
      this._xkey = Array.isArray(xkey) ? xkey : [xkey];
    };
    set ykey (ykey) {
      this._ykey = Array.isArray(ykey) ? ykey : [ykey];
    };

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

      // how do we only run this once unless the 'data' parameter changes:
			this.parseData(); // figure out min and max scalings, etc.

      // this.graphics.clear();

			// which graph style?
      if(Array.isArray(this.type)) {
        for(let i in this.type)
        {
          this.typelist[this.type[i]].function(this);
        }
      }
      else {
        this.typelist[this.type].function(this);
      }

		}; // END OF MAIN PLOTTER FUNCTION

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
      if(this._xkey.length==0){
         this._xkey = [Object.keys(this.data[0])[0]];
      }
      if(this._ykey.length==0){
        this._ykey = [Object.keys(this.data[0])[1]];
      }

      // console.log('_xkey', this._xkey, '_ykey', this._ykey);

      // STEP THREE:
      // make sure the keys are the right type
      // console.log(this.typelist[this.type].xtype + " " + this.typelist[this.type].ytype);

      this._xmin = this.data[0][this._xkey[0]];
      this._xmax = this.data[0][this._xkey[0]];
      this._ymin = this.data[0][this._ykey[0]];
      this._ymax = this.data[0][this._ykey[0]];


      for(let i=0;i<this.data.length;i++){ // iterate through all data!
        let currentData = new Object();
        // xkey
        for (let j=0; j<this._xkey.length;j++){
          if(this.data[i][this._xkey[j]]<this._xmin) this._xmin = this.data[i][this._xkey[j]];
          if(this.data[i][this._xkey[j]]>this._xmax) this._xmax = this.data[i][this._xkey[j]];
          currentData[this._xkey[j]] = this.data[i][this._xkey[j]];
        }

        // ykey
        for (let k=0; k<this._ykey.length;k++){
          if(this.data[i][this._ykey[k]]<this._ymin) this._ymin = this.data[i][this._ykey[k]];
          if(this.data[i][this._ykey[k]]>this._ymax) this._ymax = this.data[i][this._ykey[k]];
          currentData[this._ykey[k]] = this.data[i][this._ykey[k]];
        }

        // data we actually use
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

      /*
      let plotxArr = new Array(that.plotData.length);
      let plotyArr = new Array(that.plotData.length);
      let hoverxArr = new Array(that.plotData.length);
      let hoveryArr = new Array(that.plotData.length);

      for (let k = 0; k < that.plotData.length; k++) {
        plotxArr[k] = new Array(that.xkey.length);
        plotyArr[k] = new Array(that.xkey.length);
        hoverxArr[k] = new Array(that.xkey.length);
        hoveryArr[k] = = new Array(that.xkey.length);
      }
      */

      push();
      // need to figure out a way to do this for all graphs
      // faceting: multiple xkeys
      // iterate through all x keys

      // what happens when multiple xkeys and ykeys?
      for (let i=0; i<that._xkey.length; i++) {

        that.sortData(that._xkey[i]);


        // start drawing
        let px = 0;
        let py = height;

        // iterate through all datasets
        for(let j=0; j< that.plotData.length; j++)
        {
          that.plotData[j]._plotx = map(that.plotData[j][that._xkey[i]], that._xmin, that._xmax, 0, width);
          that.plotData[j]._ploty = map(that.plotData[j][that._ykey], that._ymin, that._ymax, height, 0);

          let x = that.plotData[j]._plotx;
          let y = that.plotData[j]._ploty;

          line(px, py, x, y);

          px = x;
          py = y;

          that.plotData[j]._hoverx = map(that.plotData[j][that._xkey[i]], that._xmin, that._xmax, that.left, that.right);
          that.plotData[j]._hovery = map(that.plotData[j][that._ykey], that._ymin, that._ymax, that.bottom, that.top);
        }
      }
      pop();
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
          that.plotData[j]._plotx = map(that.plotData[j][that._xkey[i]], that._xmin, that._xmax, 0, width);
          that.plotData[j]._ploty = map(that.plotData[j][that._ykey], that._ymin, that._ymax, height, 0);
          let x = that.plotData[j]._plotx;
          let y = that.plotData[j]._ploty;

          ellipse(x,y,that.pointdiameter,that.pointdiameter);

          that.plotData[j]._hoverx = map(that.plotData[j][that._xkey[i]], that._xmin, that._xmax, that.left, that.right);
          that.plotData[j]._hovery = map(that.plotData[j][that._ykey], that._ymin, that._ymax, that.bottom, that.top);
        }

      }
      pop();
    }

	}; // end of p5.Plot()
})); // end of craziness
