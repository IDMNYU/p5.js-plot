p5.Plot.prototype.drawAlex = function()
{

}

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
