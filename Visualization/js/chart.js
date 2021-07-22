// slot disponibili per l'utente: 1,4,8,12,16 ore
// durata intervalli: 
// come gestire scaler su dimensione cerchi?
// come far arrivare i tweet e con che tempi

var border = 110; // margin
var width = 1550 - 2 * border; // width of the actual drawing
var height = 750 - 2 * border; // height of the actual drawing
var padding = 1; // padding value
var nIntervals = 16; // poi andrà modificato


/* function minMax(data) {
	min=d3.min(new Date(function(d){return d.time}.substring(11,19)) );
	max=d3.max(new Date(function(d){return d.time}.substring(11,19)) );
	console.log(min);
	console.log(max);
	return [min,max];
} 

function mapValues(min, max, data) {
	range = 
} */


var svg = d3.select("body").append("svg")
    .attr("width", width + 2*border)      
    .attr("height", height + 2*border);

var graph = svg.append('g')
		.attr('transform', `translate(${border}, ${border})`);

//var xScale = d3.time.scale()
var xScale = d3.scaleTime()
	.range([0,width])
	//.padding(padding);

function updateXScaleDomain(data) {

  	var min = new Date(data[0].time);
  	var max = new Date(data[data.length-1].time);
  	
    xScale.domain([min,max]);
}

function drawXAxis(){
    graph.append("g")
    	.attr('transform', `translate(0, ${height})`)
    	.call(d3.axisBottom(xScale) ); 
}

var yScale = d3.scaleBand()
	.range([0,height])
	.padding(padding);

function updateYScaleDomain(data) {
    yScale.domain(data.map((s) => s.hashtag)); 
}

function drawYAxis(){
    graph.append("g")
    	//.attr('transform', `translate(0, ${height})`)
    	.call(d3.axisLeft(yScale) ); 
}

/* function updateDrawing(values){

// petals for the 'a' variable
var petalA = graph.selectAll(".petalA").data(values,function(d){return d.a})
  // enter clause, to add new petals for the 'a' variable
  petalA.enter().append("path")
  .attr("class", "petalA")
  // each petal is translated to the right position and scaled according to the value of the 'a' variable
  // rotation instead is not necessary in this case because this is the petal above
  .attr("transform", function(d) { return "translate(" + xScale(d.id) + "," + height/2 + ") scale(" + sizeA(d.a) + ") "; })
  .attr("d", petalPath)
  .style("fill", "rgb(51,153,255)");

  // exit clause, to remove elements if necessary
  petalA.exit().remove();


// petals for the 'b' variable
var petalB = graph.selectAll(".petalB").data(values,function(d){return d.b})
  // enter clause, to add new petals for the 'b' variable
  petalB.enter().append("path")
  .attr("class", "petalB")
  // each petal is translated to the right position, rotated of 90 degrees (right petal) and scaled according to the value of the 'b' variable
  .attr("transform", function(d) { return "translate(" + xScale(d.id) + "," + height/2 + ") rotate(" + 90 + ") scale(" + sizeB(d.b) + ") "; })
  .attr("d", petalPath)
  .style("fill", "rgb(255,51,51)");

  // exit clause, to remove elements if necessary
  petalB.exit().remove();
 
// petals for the 'c' variable  
var petalC = graph.selectAll(".petalC").data(values,function(d){return d.c})
  // enter clause, to add new petals for the 'c' variable
  petalC.enter().append("path")
  .attr("class", "petalC")
  // each petal is translated to the right position, rotated of 180 degrees (petal below) and scaled according to the value of the 'c' variable
  .attr("transform", function(d) { return "translate(" + xScale(d.id) + "," + height/2 + ") rotate(" + 180 + ") scale(" + sizeC(d.c) + ") "; })
  .attr("d", petalPath)
  .style("fill", "rgb(51,255,51)");
  
  // exit clause, to remove elements if necessary
  petalC.exit().remove();

// petals for the 'd' variable   
var petalD = graph.selectAll(".petalD").data(values,function(d){return d.d})
  // enter clause, to add new petals for the 'd' variable
  petalD.enter().append("path")
  .attr("class", "petalD")
  // each petal is translated to the right position, rotated of 270 degrees (left petal) and scaled according to the value of the 'd' variable
  .attr("transform", function(d) { return "translate(" + xScale(d.id) + "," + height/2 + ") rotate(" + 270 + ") scale(" + sizeD(d.d) + ") "; })
  .attr("d", petalPath)
  .style("fill", "rgb(255,255,51)");

  // exit clause, to remove elements if necessary
  petalD.exit().remove();

} */

d3.json("data/data.json")
	.then(function(data) {


		// drawing of the x-axis and initial drawing
		updateXScaleDomain(data);
		drawXAxis();
		updateYScaleDomain(data);
		drawYAxis();
		//updateDrawing(data);
		
	})
	.catch(function(error) {
		console.log(error); 
  	});
