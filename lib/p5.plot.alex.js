p5.Plot.prototype.drawAlex = function()
{

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

  let xkey = this.xkey;
  let ykey = this.ykey;

  let xtypeArr = [];
  let ytypeArr = [];
  // store the type of each key value in arrays
  for (let i=0;i<this.data.length;i++){
    xtypeArr.push(typeof this.data[i][xkey]);
    ytypeArr.push(typeof this.data[i][ykey]);
  }

  // loop through
  for (let j=0;j<xtypeArr.length;j++){
    // this is incorrect
    // ????????????????????whats a good way to check the type for all???????????????????
    // if key values are all strings, key type is "d"
    if (xtypeArr[j] === "string"){
      this.xtype = "d";
    }
    else if (xtypeArr[j] === "number"){
      this.xtype = "c";
    }
  }

  for (let k=0;k<ytypeArr.length;k++){
    if (ytypeArr[k] === "string"){
      this.ytype = "d";
    }
    else if (ytypeArr[k] === "number"){
      this.ytype = "c";
    }
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
