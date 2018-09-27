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
  this.bin;

  let xkey = this.xkey;
  let ykey = this.ykey;

  let xAllStr = false;
  let xAllNum = false;

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
