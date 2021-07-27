// slot disponibili per l'utente: 1,4,8,12,16 ore
// durata intervalli: 
// come gestire scaler su dimensione cerchi?
// come far arrivare i tweet e con che tempi
var speedX = 1000;
var border = 110; // margin
var width = 1550 - 2 * border; // width of the actual drawing
var height = 750 - 2 * border; // height of the actual drawing
var padding = 1; // padding value
var nIntervals = 16; // poi andrà modificato
var bubbleMax = 500;
var updateTime = 200; 

var optionsTime = ["Tutti i risultati", "Ultima ora", "Ultime 4 ore", "Ultime 8 ore"];
var optionTimeChosen = "Tutti i risultati"; //default

/* function minMax(data) {
	min=d3.min(new Date(function(d){return d.time}.substring(11,19)) );
	max=d3.max(new Date(function(d){return d.time}.substring(11,19)) );
	console.log(min);
	console.log(max);
	return [min,max];
} 
*/

var select = d3.select('body')
  .append('select')
    .attr('class','select')
    .on('change',onchange)

var options = select
  .selectAll('option')
    .data(optionsTime).enter()
    .append('option')
        .text(function (d) { return d; });

function onchange() {
    selectValue = d3.select('select').property('value')
    optionTimeChosen = selectValue;
    console.log(optionTimeChosen);
};

var svg = d3.select("body").append("svg")
    .attr("width", width + 2*border)      
    .attr("height", height + 2*border);

var graph = svg.append('g')
        .attr("class","graph")
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
        .attr("class", "x axis")
    	.attr('transform', `translate(0, ${height})`)
    	.call(d3.axisBottom(xScale))
        .exit().remove();
}

var yScale = d3.scaleBand()
	.range([0,height])
	.padding(padding);

var colorScale = d3.scaleOrdinal()
    .range(["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78", "#50e991"])


function updateYScaleDomain(data) {
    yScale.domain(data.map((s) => s.hashtag));
    colorScale.domain(data.map((s) => s.hashtag)); 
}


function drawYAxis(){
    graph.append("g")
        .attr("class", "y axis")
    	.attr('transform', `translate(-10,0)`)
    	.call(d3.axisLeft(yScale).tickSize(-width).tickSizeOuter(5) )
        .exit().remove();
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


graph.append("clipPath")
    .attr("id", "rect-clip")
    .append("rect")
    .attr("x", -10)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

// Add dots
    var dots = graph.selectAll(".dot").data(values); //se non funziona attenzione qui eventualmente
    dots.enter().append("circle")
        .attr("class","dot")
        .attr("cx", function (d) { return xScale(new Date(d.time)); } ) //funzione che trasforma dato -> fascia dove si trova
        .attr("cy", function (d) { return yScale(d.hashtag); } ) // hashtag
        .attr("r", function (d) { return rScale(5); } ) //cumulata per ogni fascia per ogni hashtag, forse qui funzione che li calcola al posto di function
        //.style("fill", "rgb(2, 167, 204)")
        .style("fill", (d) => colorScale(d.hashtag))
        .style("opacity", "1")
        .attr("clip-path", "url(#rect-clip)")
        .attr("stroke", "none" ); //al momento rimosso stroke

    dots.exit().remove();

    dots.transition().duration(updateTime)
        .attr("cx", function (d) { return xScale(new Date(d.time)); } ) 
        .attr("cy", function (d) { return yScale(d.hashtag); } ) 
        .attr("r", function (d) { return rScale(1); } );    
} 

function listen() {
    port = 8889;
	//const socket = new WebSocket("ws://127.0.0.1:8889");
	const socket = io("localhost:8889");
	//socket.on("connect", () => {
  // either with send()
  //socket.send("Hello!");
  //socket.listen(port, () => {
  //console.log(`Socket.IO server running at http://localhost:${port}/`);
//});
  // or with emit() and custom event names
  //socket.emit("salutations", "Hello!", { "mr": "john" }, Uint8Array.from([1, 2, 3, 4]));
//});
	//socket.on("message", data => { console.log(data);});
	//socket.on("message", data => { console.log(data);});
    socket.addEventListener('message', function (event) { console.log('Message from server ', event.data); });
// handle the event sent with socket.emit()
//socket.on("greetings", (elem1, elem2, elem3) => {
  //console.log(elem1, elem2, elem3);
//});
}

function background(){
    graph.append("rect")
        .attr("class","bg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white")
        .attr("opacity", 0.01)
        .attr("class","background");
}

graph.append("line")
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .attr("pointer-events", "none")
    .style("opacity", "0")
    .attr("x1", 200).attr("x2", 200) 
    .attr("y1", 0).attr("y2", height)
    .attr("stroke-dasharray", "1,1");

function filterData(data){
    //var optionsTime = ["Tutti i risultati", "Ultima ora", "Ultime 4 ore", "Ultime 8 ore"]
    if(optionTimeChosen == "Ultima ora") { 
         var max = new Date(maxData(data)).getTime()/1000; //in secondi
         var interval = 60*60;
         var threshold = max - interval;
         for (let i=0; i<data.length; i++){
            var delta = new Date(data[i].time).getTime()/1000;
            if(delta > threshold){ return data.slice(i,data.length) }
         }
    }
    if(optionTimeChosen == "Ultime 4 ore") { 
        var max = new Date(maxData(data)).getTime()/1000; //in secondi
         var interval = 60*60*4;
         var threshold = max - interval;
         for (let i=0; i<data.length; i++){
            var delta = new Date(data[i].time).getTime()/1000;
            if(delta > threshold){ return data.slice(i,data.length) }
         }
    }
    if(optionTimeChosen == "Ultime 8 ore") { 
        var max = new Date(maxData(data)).getTime()/1000; //in secondi
         var interval = 60*60*8;
         var threshold = max - interval;
         for (let i=0; i<data.length; i++){
            var delta = new Date(data[i].time).getTime()/1000;
            if(delta > threshold){ return data.slice(i,data.length) }
         }
    }
    //altrimenti max
    return data;
}


function eventListenersActive(){
                //hover event (selezione)
        graph.on("mouseover", function(d){
                console.log(d);
                //d3.select(this).attr("opacity",0.6); 
                d3.select(".mouse-line")
                    .style("opacity", "0.2");

                })
        graph.on("mouseout", function(d){
                console.log(d);
                //d3.select(this).attr("opacity",1);
                d3.select(".mouse-line")
                    .style("opacity", "0");
                })
        graph.on('mousemove', function(d) { // mouse moving over canvas
                var mouse_x = d3.pointer(d)[0];
                d3.select(".mouse-line").attr("x1", mouse_x).attr("x2", mouse_x).style("opacity", 0.2);
                })
}

function dotListeners(){
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
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateAxes(){
    svg.select(".y.axis").transition().duration(updateTime).call(d3.axisLeft(yScale).tickSize(-width).tickSizeOuter(5));
    svg.select(".x.axis").transition().duration(updateTime).call(d3.axisBottom(xScale));
}

d3.json("data/data.json")
	.then( async function(data) {

        var values = [data[0]]; 
		//listen();
		// drawing of the x-axis and initial drawing
		updateXScaleDomain(values);
		drawXAxis();
		updateYScaleDomain(values);
		drawYAxis();
        updateDrawing(values);
        //var values = nestData(data);
        background();
        eventListenersActive();
        

        //fake streaming

        var i = 1;
        var sleeptime = 0;
        

        while(i < data.length){

            values = [];
            //data to use each iteration
            for(let j=0; j<i+1; j++){
                values.push(data[j]);
            }
            console.log(values);

            values = filterData(values);

            updateXScaleDomain(values);
            //drawXAxis();
            updateYScaleDomain(values);
            //drawYAxis();
            updateAxes()

            updateDrawing(data); //cambiare values
            dotListeners();

            sleeptime = new Date(data[i].time).getTime() - new Date(data[i-1].time).getTime();
            console.log(sleeptime);
            await sleep(sleeptime/speedX);

            i = i + 1;

        }

		
		
	})
	.catch(function(error) {
		console.log(error); 
  	});
