
p5.Plot.prototype.drawAreaGraph = function()
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

  this.sortData(xkey);

  beginShape();
  vertex(this.left, this.bottom);

  for(let i in this.data)
  {
    let x = map(this.data[i][xkey], xmin, xmax, this.left, this.right);
    let y = map(this.data[i][ykey], ymin, ymax, this.bottom, this.top);
    if(i>0) vertex(x, y);
  }
  vertex(this.right, this.bottom);

  endShape(CLOSE);

  pop();


}
