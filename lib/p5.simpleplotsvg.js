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
			this.left = 0;
			this.top = 0;
      this.pointdiameter = 5;
			this.right = width;
			this.bottom = height;
			this._data = {};
			//this.xkey = ""; // key value for x axis
			//this.ykey = ""; // key value for y axis
      this._xkey = [];
      this._ykey = [];
      this._needsparse = true;
      this._needssort = true;
      this.plotSVGURL;

      this.typelist = {};

      //this.plotsvg;
      this.plotdiv;
      this.svghtml = '';

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



		// MAIN PLOTTER FUNCTION
		//
		plot (_args) {

			// integrate arguments (see above):
			for(let i in arguments)
			{
				Object.assign(this, arguments[i]);
			}

      if(this._needsparse) this.parseData();
      // temporarily putting this here
      /*
      this.plotsvg = createElement('svg');
      this.plotsvg.style('z-index', '500');
      this.plotsvg.id('plotsvg');
      this.plotsvg.style('width', (this.right-this.left).toString());
      this.plotsvg.style('height', (this.bottom-this.top).toString());
      */

      this.plotdiv = createDiv('').size(this.right-this.left,this.bottom-this.top);
      this.plotdiv.position(this.left, this.top);

      // start writing to svghtml
      this.svghtml = '<svg xmlns="http://www.w3.org/2000/svg" width="'+((this.right-this.left)).toString()+'" height="'+((this.bottom-this.top)).toString()+'">';

      // which graph style?
      // draw the graphs
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

      return loadImage(this.plotSVGURL);
    }; // END OF MAIN PLOTTER FUNCTION

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
        /*
        <svg height="200" width="500">
          <polyline points="20,20 40,25 60,40 80,120 120,140 200,180"
          style="fill:none;stroke:black;stroke-width:3" />
        </svg>
        */
        that.svghtml += '<polyline points="';

        /*
        let polylinePointsStr = '';
        let polyline = createElement('polyline');
        polyline.parent('plotsvg');
        polyline.style('fill', 'none');
        polyline.style('stroke', 'black');
        polyline.style('stroke-width', '1');
        */

        if(that._needssort) that.sortData(that._xkey[i]);

        // start drawing
        //let px = 0;
        //let py = height;

        // iterate through all datasets
        for(let j=0; j< that.plotData.length; j++)
        {
          that.plotData[j]._plotx = map(that.plotData[j][that._xkey[i]], that._xmin, that._xmax, 0, width);
          that.plotData[j]._ploty = map(that.plotData[j][that._ykey], that._ymin, that._ymax, height, 0);

          let x = that.plotData[j]._plotx;
          let y = that.plotData[j]._ploty;

          //polylinePointsStr += (x.toString()+','+y.toString()+ ' ');
          that.svghtml += x.toString()+','+y.toString()+ ' ';

          //polyline.style('points', polylinePointsStr);

          //line(px, py, x, y);

          //px = x;
          //py = y;
        }
      }
      pop();
      that.svghtml += '" style="fill:none;stroke:black;stroke-width:1"/>';

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


          /*
          <svg height="100" width="100">
            <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
          </svg>
          */
          //<rect x=\"20\" y=\"20\" rx=\"20\" ry=\"20\" width=\"100\" height=\"100\" style=\"fill:lightgray; stroke:#1c87c9; stroke-width:4;\"/></svg>'
          that.svghtml += '<circle cx="' + x.toString() + '" cy="' + y.toString() + '" r="' + (that.pointdiameter*2).toString() + '" stroke="black" stroke-width="1" fill="red"/>';

          /*
          let circle = createElement('circle');
          circle.parent('plotsvg');
          circle.style('cx', x.toString());
          circle.style('cy', y.toString());
          circle.style('r', (that.pointdiameter*2).toString());
          circle.style('stroke', 'black');
          circle.style('stroke-width', '1');
          */
          //ellipse(x,y,that.pointdiameter,that.pointdiameter);
        }
      }
      pop();

    }

	}; // end of p5.Plot()
})); // end of craziness
