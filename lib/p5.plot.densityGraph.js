p5.Plot.prototype.drawDensityGraph = function()
{
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
