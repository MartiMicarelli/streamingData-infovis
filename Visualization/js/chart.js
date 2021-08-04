//----------------------------------- variabili --------------------------------------

var speedX = 50;
var border = 110; // margin
var width = 1550 - 2 * border; // width of the actual drawing
var height = 750 - 2 * border; // height of the actual drawing
var padding = 1; // padding value
var nIntervals = 20; // poi andrà modificato
var bubbleMax = 15;
var updateTime = 200; 

//----------------------------------- opzioni per le select --------------------------------------
var optionsTime = ["Tutti i risultati", "Ultima ora", "Ultime 4 ore", "Ultime 8 ore"];
var optionTimeChosen = "Tutti i risultati"; //default

var optionsGroup = ["Singoli tweet", "Raggruppa in gruppi"];
var optionGroupChosen = "Singoli tweet"; //default

var optionsColor = ["palette 1", "palette 2", "palette 3"];
var optionColorChosen = "palette 1"; //default

//----------------------------------- select box --------------------------------------
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

var select3 = d3.select('body')
  .append('select')
    //.attr('transform', `translate(800, 0)`)
    .attr('class','select3')
    .on('change',updateColor)

var options3 = select3
  .selectAll('option')
    .data(optionsColor).enter()
    .append('option')
        .text(function (d) { return d; });

//----------------------------------- graph --------------------------------------

var svg = d3.select("body").append("svg")
    .attr("width", width + 2*border)      
    .attr("height", height + 2*border);

var graph = svg.append('g')
        .attr("class","graph")
        .attr('transform', `translate(${border}, ${border})`);

//----------------------------------- linea extra da utilizzare per evento mouse -----------------------

graph.append("line")
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .attr("pointer-events", "none")
    .style("opacity", "0")
    .attr("x1", 200).attr("x2", 200) 
    .attr("y1", 0).attr("y2", height)
    .attr("stroke-dasharray", "1,1");

var freezeLine = false; //default

//----------------------------------- scaler --------------------------------------

var xScale = d3.scaleTime()
    .range([0,width]);

var yScale = d3.scaleBand()
    .range([0,height])
    .padding(padding);

var colorScale = d3.scaleOrdinal()
    .range(["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78", "#50e991"]); //default

var rScale = d3.scaleLinear()
    .range([ 0, bubbleMax]); 


//----------------------------------- funzioni di update select --------------------------------------
function onchangeTime() {
    selectValue = d3.select('.select1').property('value')
    optionTimeChosen = selectValue;
    //console.log(optionTimeChosen);
};

function onchangeGroup() {
    selectValue = d3.select('.select2').property('value')
    optionGroupChosen = selectValue;
    //console.log(optionTimeChosen);
}

function updateColor(){
    selectValue = d3.select('.select3').property('value')
    optionColorChosen = selectValue;
    //https://www.omnisci.com/blog/12-color-palettes-for-telling-better-stories-with-your-data
    if(optionColorChosen == "palette 1"){
        colorScale.range(["#b30000", "#7c1158", "#4421af", "#1a53ff", "#0d88e6", "#00b7c7", "#5ad45a", "#8be04e", "#ebdc78", "#50e991"]);
    }
    if(optionColorChosen == "palette 2"){
        colorScale.range(["#ea5545", "#f46a9b", "#ef9b20", "#edbf33", "#ede15b", "#bdcf32", "#87bc45", "#27aeef", "#b33dc6", "#9b19f5"]);
    }
    if(optionColorChosen == "palette 3"){
        colorScale.range(["#fd7f6f", "#7eb0d5", "#b2e061", "#bd7ebe", "#ffb55a", "#ffee65", "#beb9db", "#fdcce5", "#8bd3c7", "#b3d4ff"]);
    }
}

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

//----------------------------------- funzioni generali utili --------------------------------------

function minData(data){
    return new Date(data[0].time);
}

function maxData(data){
    return new Date(data[data.length-1].time);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//----------------------------------- funzioni di update scaler --------------------------------------

function updateXScaleDomain(data) {
  	var min = minData(data);
  	var max = maxData(data);
    xScale.domain([min,max]);
}

function updateYScaleDomain(data) {
	var dictSum = {};
    for(var k=0; k<data.length; k++) {
    	key = data[k].hashtag;
    	dictSum[key] = get(dictSum,key,0) + 1;
    }

	var orderedDict = Object.keys(dictSum).sort(function(a, b) {return d3.descending(get(dictSum,a,0),get(dictSum,b,0)) });
    yScale.domain(orderedDict);
    colorScale.domain(orderedDict); 
}

function updateRScaleDomainStatic(){
    rScale.domain([0, 4]); //default
}

function updateRScaleDomainDynamic(data){
    rScale.domain([0, d3.max(data, function(d) { return d.values; })]); 
}

//----------------------------------- funzioni per assi x-y --------------------------------------
function drawXAxis(){
    graph.append("g")
        .attr("class", "x axis")
    	.attr('transform', `translate(0, ${height})`)
    	.call(d3.axisBottom(xScale))
        .exit().remove();
}

function drawYAxis(){
    graph.append("g")
        .attr("class", "y axis")
    	.attr('transform', `translate(-10,0)`)
    	.call(d3.axisLeft(yScale).tickSize(-width).tickSizeOuter(5) )
        .exit().remove();
}   

function updateAxes(){
    svg.select(".y.axis").transition().duration(updateTime).call(d3.axisLeft(yScale).tickSize(-width).tickSizeOuter(5));
    svg.select(".x.axis").transition().duration(updateTime).call(d3.axisBottom(xScale));
}


//----------------------------------- funzioni per raggruppare dati --------------------------------------

function nestData(data){
    //http://learnjsdata.com/group_data.html
    //https://observablehq.com/@d3/d3-flatgroup
    //https://github.com/d3/d3-array/blob/main/README.md#flatGroup
    var values1 = d3.flatGroup(data, d => d.hashtag, d => bin(d,data));
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
    //console.log(values);
    return values;
}

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

// https://observablehq.com/@d3/d3-bin-time-thresholds
/* function thresholdTime(n,data) {
  return (data, min, max) => {
    return d3.scaleTime().domain([minData(data), maxData(data)]).ticks(n);
  };
} */

/*
function bins(data){
    console.log(data);
    values = d3.bin()
        .value(d => new Date(d.time).getTime()/1000)
        .domain([minData(data).getTime()/1000,maxData(data).getTime()/1000])
        .thresholds(nIntervals)
        (data)
  //console.log(values);
  //console.log(JSON.stringify(values));
}*/

//------------------------------ funzione per estrarre valore da un dizionario ---------------

function get(object, key, default_value) {
    var result = object[key];
    return (typeof result !== "undefined") ? result : default_value;
}

//------------------------------ dot drawing & updating --------------------------------------

// https://www.d3-graph-gallery.com/graph/bubble_basic.html
function updateDrawing(values){

    //clipping mask per risolvere... problemi irrisolvibili
    graph.append("clipPath")
        .attr("id", "rect-clip")
        .append("rect")
        .attr("x", -10)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);

    // Add dots
    var dots = graph.selectAll(".dot").data(values); 
    dots.enter().append("circle")
        .attr("class","dot")
        .attr("cx", function (d) { return xScale(new Date(d.time)); } ) 
        .attr("cy", function (d) { return yScale(d.hashtag); } ) 
        .attr("r", function (d) { return rScale((d.values)^(0.7)); } ) 
        .style("fill", (d) => colorScale(d.hashtag))
        .style("opacity", "1")
        .attr("clip-path", "url(#rect-clip)")
        .attr("stroke", "none"); //rimosso stroke

    dots.append("svg:title").data(values)
            .text(function(d) { return d.values; });

    dots.exit().remove();

    dots.transition().duration(updateTime)
        .attr("cx", function (d) { return xScale(new Date(d.time)); } ) 
        .attr("cy", function (d) { return yScale(d.hashtag); } ) 
        .attr("r", function (d) { return rScale((d.values)^(0.7)); } )
        .style("fill", (d) => colorScale(d.hashtag))     
        .select("title").text(function(d) { return d.values });

}

//background per trigger eventi
function background(){
    graph.append("rect")
        .attr("class","bg")
        .attr("x", -10)
        .attr("y", 0)
        .attr("width", width + 10)
        .attr("height", height)
        .attr("fill", "blue")
        .attr("opacity", 0.01)
        .attr("stroke", "black") 
        .attr("class","background");
} 

//----------------------------------- tentativo socket (non riuscito) --------------------------------------
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
    socket.addEventListener('message', function (event) { console.log('Message from server ', event.data); }); //non funziona su client browser, sembra :c
// handle the event sent with socket.emit()
//socket.on("greetings", (elem1, elem2, elem3) => {
  //console.log(elem1, elem2, elem3);
//});
}

//----------------------------------- event listeners --------------------------------------

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
        if(!freezeLine){
            var mouse_x = d3.pointer(d)[0];
            d3.select(".mouse-line").attr("x1", mouse_x).attr("x2", mouse_x).style("opacity", 0.2);
            }
        })
    //https://stackoverflow.com/questions/29711219/how-to-freeze-and-unfreeze-hover-line-on-click-in-d3
    graph.on('click', function(d){ // on mouse click toggle frozen status
        freezeLine = !freezeLine;
        })
}

function dotListeners(){
    graph.selectAll(".dot")
        .on("mouseover", function(d){
            //console.log(d)
            d3.select(this).attr("stroke","black")
        })
    graph.selectAll(".dot")
        .on("mouseout", function(d){
            //console.log(d)
            d3.select(this).attr("stroke","none")
        })
}

//----------------------------------------- finto streaming ---------------------------------
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

            //need to update scales BEFORE eventual nesting, or functions min-max will not work 
            updateXScaleDomain(values);
            updateYScaleDomain(values);
            updateAxes();
            updateRScaleDomainStatic();


            if(optionGroupChosen == "Raggruppa in gruppi" ){
                values = nestData(values);
                updateRScaleDomainDynamic(values);
            }
            //console.log(values);

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
