// slot disponibili per l'utente: 1,4,8,12,16 ore
// durata intervalli: 
// come gestire scaler su dimensione cerchi?
// come far arrivare i tweet e con che tempi
var speedX = 100;
var border = 110; // margin
var width = 1550 - 2 * border; // width of the actual drawing
var height = 750 - 2 * border; // height of the actual drawing
var padding = 1; // padding value
var nIntervals = 5; // poi andrà modificato
var bubbleMax = 700;
var updateTime = 300; 

var optionsTime = ["Tutti i risultati", "Ultima ora", "Ultime 4 ore", "Ultime 8 ore"];
var optionTimeChosen = "Tutti i risultati"; //default

var optionsGroup = ["Singoli tweet", "Raggruppa in gruppi"];
var optionGroupChosen = "Singoli tweet"; //default

/* function minMax(data) {
	min=d3.min(new Date(function(d){return d.time}.substring(11,19)) );
	max=d3.max(new Date(function(d){return d.time}.substring(11,19)) );
	console.log(min);
	console.log(max);
	return [min,max];
} 
*/

var select1 = d3.select('body')
  .append('select')
    //.attr('transform', `translate(${border}, 0)`)
    .attr('class','select1')
    .on('change',onchangeTime)

var options1 = select1
  .selectAll('option')
    .data(optionsTime).enter()
    .append('option')
        .text(function (d) { return d; });

var select2 = d3.select('body')
  .append('select')
    //.attr('transform', `translate(400, 0)`)
    .attr('class','select2')
    .on('change',onchangeGroup)

var options2 = select2
  .selectAll('option')
    .data(optionsGroup).enter()
    .append('option')
        .text(function (d) { return d; });

function onchangeTime() {
    selectValue = d3.select('.select1').property('value')
    optionTimeChosen = selectValue;
    console.log(optionTimeChosen);
};

function onchangeGroup() {
    selectValue = d3.select('.select2').property('value')
    optionGroupChosen = selectValue;
    console.log(optionTimeChosen);
}

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
    .range(["#b30000"]) //, "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78", "#50e991"])


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

var rScale = d3.scaleLinear()
        .domain([0, 300]) //-> maxcumulata? o un max fisso? altrimenti se si usa un max temporaneo, ci possono essere dot che possono cambiare dimensione (che forse non è sbagliato, all'inizio sarebbero piccolissime)
        .range([ 0, bubbleMax]); 

function nestData(data){
    //http://learnjsdata.com/group_data.html
    //https://observablehq.com/@d3/d3-flatgroup
    //https://github.com/d3/d3-array/blob/main/README.md#flatGroup
    var values1 = d3.flatGroup(data, d => d.hashtag, d => bin(d,data));
        //.key ( function(d) {return bins(d,data)})
    //for ( const array in values)
    //var values = d3.flatRollup(data, v => v.length, d => d.hashtag, d=> bin(d,data)); //controllare sommi su secondo nest
    //var values = d3.flatRollup(values1, v => v.length, v=> v.hashtag, v => v.time);
        //.object(data);
    values = [];
    for(let i=0; i<values1.length; i++){
        line = values1[i];
        array = line[2];
        //console.log(array);
        d = {};
        d["hashtag"] = line[0];
        d["time"] = line[1];
        d["values"] = array.length;
        values.push(d);
    }
    //console.log(JSON.stringify(values));
    console.log(values);
    //bins(data);
    return values;
}

// https://observablehq.com/@d3/d3-bin-time-thresholds
/* function thresholdTime(n,data) {
  return (data, min, max) => {
    return d3.scaleTime().domain([minData(data), maxData(data)]).ticks(n);
  };
} */

function bin(d,data){
    min = minData(data).getTime();
    max = maxData(data).getTime();

    for(let i=0; i<nIntervals; i++){
        t = new Date(d.time).getTime();
        ts_min = ((max - min)/(nIntervals))*(i) + min;
        ts_max = ((max - min)/(nIntervals))*(i+1) + min;
        if(t <= ts_max) { 
            //console.log("date" + new Date(t) + "is in slot" + new Date(ts_min) + " - " + new Date(ts_max));
            return new Date(ts_max);
        }
    }
    return new Date(0);   
}

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
        .attr("r", function (d) { return rScale(d.values); } ) //cumulata per ogni fascia per ogni hashtag, forse qui funzione che li calcola al posto di function
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
                //console.log(d);
                //d3.select(this).attr("opacity",0.6); 
                d3.select(".mouse-line")
                    .style("opacity", "0.2");

                })
        graph.on("mouseout", function(d){
                //console.log(d);
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
        nestData(data);
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
                d = data[j];
                d["values"] = 1;
                values.push(d);
            }
            //console.log(values);

            values = filterData(values);

            //need to update scales BEFORE eventual nesting 
            updateXScaleDomain(values);
            //drawXAxis();
            updateYScaleDomain(values);
            //drawYAxis();
            updateAxes();

            if(optionGroupChosen == "Raggruppa in gruppi" ){
                values = nestData(values);
            }
            console.log(values);

            updateDrawing(values); //cambiare values
            dotListeners();

            sleeptime = new Date(data[i].time).getTime() - new Date(data[i-1].time).getTime();
            //console.log(sleeptime);
            await sleep(sleeptime/speedX);

            i = i + 1;
        }
	
	})
	.catch(function(error) {
		console.log(error); 
  	});
