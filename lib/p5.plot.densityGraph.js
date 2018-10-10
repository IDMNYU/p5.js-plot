p5.Plot.prototype.drawDensityGraph = function()
{
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

  //fill(this.fillcolor);
  noFill();
  stroke(this.strokecolor);
  strokeWeight(this.strokeweight);

  // start to draw rectangles!!!
  rectMode(CORNER); // x, y, w, h
  drawWidth = (this.right-this.left)/numBins; // width of each rect
  let currentX = this.left;
  beginShape();
  for (let q=0; q<binArr.length;q++){
    let prevFreq = 0;
    let nextFreq = 0;
    if(q>0) prevFreq = binArr[q-1];
    let currentFreq = binArr[q];
    if(q<binArr.length-1) nextFreq = binArr[q+1];
    let currentY = map(currentFreq, maxFreq, minFreq, this.top, this.bottom); // y & h of this box
    ellipse(currentX, currentY, 5, 5);
    let avgY = map((prevFreq+currentFreq+nextFreq)/3, maxFreq, minFreq, this.top, this.bottom); // y & h of this box
    curveVertex(currentX, avgY);
    currentX += drawWidth;
  }
  endShape();

  pop();


}
