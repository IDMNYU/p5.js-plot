
p5.Plot.prototype.drawSally = function()
{
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
    //if(i>0) line(px, py, x, y);
    if(i>0) rect(x, y, this.strokeweight*4, this.strokeweight*4);
    px = x;
    py = y;
  }

  pop();


}
