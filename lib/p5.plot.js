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
				let x = map(this.data[i][xkey], xmin, xmax, this.left, this.right);
				let y = map(this.data[i][ykey], ymin, ymax, this.bottom, this.top);
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
				let x = map(this.data[i][xkey], xmin, xmax, this.left, this.right);
				let y = map(this.data[i][ykey], ymin, ymax, this.bottom, this.top);
				ellipse(x,y,5,5);
			}

			pop();

		}

	}; // end of p5.Plot()


})); // end of craziness
