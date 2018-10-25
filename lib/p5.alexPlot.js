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
			this.gridweight = 4;
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
			console.log('Alex testing p5.Plot()');

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

    hover(_x, _y) {
      let flakiness = 5;
      for(let i=0; i<this.plotData.length; i++)
      {
        if(dist(_x, _y, this.plotData[i]._hoverx, this.plotData[i]._hovery) <= flakiness)
        {
          push();
          console.log(this.backgroundcolor);
          var bgc = color(this.backgroundcolor);
          bgc.setAlpha(100);
          fill(bgc);
          var fgc = color(this.strokecolor);
          fgc.setAlpha(255);
          stroke(fgc);
          rect(this.plotData[i]._hoverx, this.plotData[i]._hovery, 200, 100);
          noStroke();
          fill(fgc);
          textSize(12);
          text("DATA:", this.plotData[i]._hoverx+10, this.plotData[i]._hovery+20);
          text(this.xkey + ": " + this.plotData[i][this.xkey], this.plotData[i]._hoverx+10, this.plotData[i]._hovery+40);
          text(this.ykey + ": " + this.plotData[i][this.ykey], this.plotData[i]._hoverx+10, this.plotData[i]._hovery+60);
          pop();
          break;
        }
      }
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
		// sortData() - SORT AN ARRAY BASED ON A KEY
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
		// LINE GRAPH
		//
		drawLineGraph() {
			let px = 0;
			let py = 0;

			this.graphics.push();
      this.graphics.scale(1/this.pd);

			this.graphics.fill(this.fillcolor);
			this.graphics.stroke(this.strokecolor);
			this.graphics.strokeWeight(this.strokeweight);

			this.sortData(xkey);
			for(let i=0; i< this.plotData.length; i++)
			{
        this.plotData[i]._plotx = map(this.plotData[i][this.xkey], this.xmin, this.xmax, 0, this.graphics.width);
        this.plotData[i]._ploty = map(this.plotData[i][this.ykey], this.ymin, this.ymax, this.graphics.height, 0);
        let x = this.plotData[i]._plotx;
				let y = this.plotData[i]._ploty;
				if(i>0) line(px, py, x, y);
				px = x;
				py = y;

        this.plotData[i]._hoverx = map(this.plotData[i][this.xkey], this.xmin, this.xmax, this.left, this.right);
        this.plotData[i]._hovery = map(this.plotData[i][this.ykey], this.ymin, this.ymax, this.bottom, this.top);
			}
			this.graphics.pop();

		}

		//
		// POINT GRAPH
		//
    drawPointGraph() {
      this.graphics.push();
      this.graphics.scale(1/this.pd);
      this.graphics.fill(this.fillcolor);
      this.graphics.stroke(this.strokecolor);
      this.graphics.strokeWeight(this.strokeweight);

      for(let i=0;i<this.plotData.length;i++)
      {
        this.plotData[i]._plotx = map(this.plotData[i][this.xkey], this._xmin, this._xmax, 0, this.graphics.width);
        this.plotData[i]._ploty = map(this.plotData[i][this.ykey], this._ymin, this._ymax, this.graphics.height, 0);
        let x = this.plotData[i]._plotx;
        let y = this.plotData[i]._ploty;

        this.graphics.ellipse(x,y,5,5);

        this.plotData[i]._hoverx = map(this.plotData[i][this.xkey], this._xmin, this._xmax, this.left, this.right);
        this.plotData[i]._hovery = map(this.plotData[i][this.ykey], this._ymin, this._ymax, this.bottom, this.top);
      }

      this.graphics.pop();
    }

	}; // end of p5.Plot()
})); // end of craziness
