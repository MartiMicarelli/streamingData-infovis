// slot disponibili per l'utente: 1,4,8,12,16 ore
// durata intervalli: 
// come gestire scaler su dimensione cerchi?
// come far arrivare i tweet e con che tempi

var border = 110; // margin
var width = 1550 - 2 * border; // width of the actual drawing
var height = 750 - 2 * border; // height of the actual drawing
var padding = 1; // padding value
var nIntervals = 16; // poi andrà modificato
var bubbleMax = 500;
var updateTime = 100; 


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

var options = ["Option 1", "Option 2", "Option 3", "Option 4"];

var select = d3.select('body')
  .append('select')
    .attr('class','select')
    .on('change',onchange)

var options = select
  .selectAll('option')
    .data(options).enter()
    .append('option')
        .text(function (d) { return d; });

function onchange() {
    selectValue = d3.select('select').property('value')
    d3.select('body')
        .append('p')
        .text(selectValue + ' is the last selected option.')
};

var svg = d3.select("body").append("svg")
    .attr("width", width + 2*border)      
    .attr("height", height + 2*border);

var graph = svg.append('g')
		.attr('transform', `translate(${border}, ${border})`);

//var xScale = d3.time.scale()
var xScale = d3.scaleTime()
	.range([0,width]);
	//.padding(padding);

function minData(data){
    return new Date(data[0].time);
}

function maxData(data){
    return new Date(data[data.length-1].time);
}

function updateXScaleDomain(data) {
  	var min = minData(data);
  	var max = maxData(data);

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
    	.attr('transform', `translate(-10,0)`)
    	.call(d3.axisLeft(yScale).tickSize(-width).tickSizeOuter(5) ); 
}

function nestData(data){
    //http://learnjsdata.com/group_data.html
    var values = d3.group(data, d => d.hashtag)
        //.key ( function(d) {return bins(d,data)})
        //.rollup(function(v) { return v.length; }) //controllare sommi su secondo nest
        //.object(data);
    console.log(JSON.stringify(values));
    console.log(values);
    bins(data);
    return null;
}

// https://observablehq.com/@d3/d3-bin-time-thresholds
/* function thresholdTime(n,data) {
  return (data, min, max) => {
    return d3.scaleTime().domain([minData(data), maxData(data)]).ticks(n);
  };
} */

function bins(data){
    console.log(data);
    values = d3.bin()
        .value(d => new Date(d.time).getTime()/1000)
        .domain([minData(data).getTime()/1000,maxData(data).getTime()/1000])
        .thresholds(nIntervals)
        (data)
  //console.log(values);
  //console.log(JSON.stringify(values));
}

//dot drawing & updating
// https://www.d3-graph-gallery.com/graph/bubble_basic.html
function updateDrawing(values){
    //scale bubble dimension
    var rScale = d3.scaleLinear()
        .domain([0, 200]) //-> maxcumulata? o un max fisso? altrimenti se si usa un max temporaneo, ci possono essere dot che possono cambiare dimensione (che forse non è sbagliato, all'inizio sarebbero piccolissime)
        .range([ 0, bubbleMax]); 

// Add dots
    var dots = graph.selectAll(".dot").data(values); //se non funziona attenzione qui eventualmente
    dots.enter().append("circle")
        .attr("class","dot")
        .attr("cx", function (d) { return xScale(new Date(d.time)); } ) //funzione che trasforma dato -> fascia dove si trova
        .attr("cy", function (d) { return yScale(d.hashtag); } ) // hashtag
        .attr("r", function (d) { return rScale(1); } ) //cumulata per ogni fascia per ogni hashtag, forse qui funzione che li calcola al posto di function
        .style("fill", "rgb(2, 167, 204)")
        .style("opacity", "1")
        .attr("stroke", "none" ); //al momento rimosso stroke
    dots.exit().remove();
    //dots.transition().duration(updateTime)
    //  .attr("cx", function (d) { return x(d.dato); } ) //funzione che trasforma dato -> fascia dove si trova
    //    .attr("cy", function (d) { return y(d.hashtag); } ) // hashtag
    //    .attr("r", function (d) { return z(d.dato); } ) //cumulata per ogni fascia per ogni hashtag, forse qui funzione che li calcola al posto di function

} 

function listen() {
	//const socket = new WebSocket("ws://localhost:8889");
	console.log("ciao");
	const socket = io("http://localhost:8889");
	console.log("ciao");
	//socket.on("connect", () => {
  // either with send()
  //socket.send("Hello!");

  // or with emit() and custom event names
  //socket.emit("salutations", "Hello!", { "mr": "john" }, Uint8Array.from([1, 2, 3, 4]));
//});
	socket.on("message", data => { console.log(data);});
	//socket.on("message", data => { console.log(data);});

// handle the event sent with socket.emit()
//socket.on("greetings", (elem1, elem2, elem3) => {
  //console.log(elem1, elem2, elem3);
//});

	}


d3.json("data/data.json")
	.then(function(data) {

		listen();
		// drawing of the x-axis and initial drawing
		updateXScaleDomain(data);
		drawXAxis();
		updateYScaleDomain(data);
		drawYAxis();
        //var values = nestData(data);
		updateDrawing(data); //cambiare values
		

            //hover event (selezione)
        graph.selectAll(".dot")
            .on("mouseover", function(d){
                console.log(d);
                d3.select(this).attr("opacity",0.6);    
                })
        graph.selectAll(".dot")
            .on("mouseout", function(d){
                console.log(d);
                d3.select(this).attr("opacity",1);
                })
        graph.selectAll(".dot")
            .on("mouseover", function(d){
                console.log(d)
                d3.select(this).attr("stroke","black")
            })
        graph.selectAll(".dot")
            .on("mouseout", function(d){
                console.log(d)
                d3.select(this).attr("stroke","none")
            })
	})
	.catch(function(error) {
		console.log(error); 
  	});
