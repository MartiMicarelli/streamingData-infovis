
bubbleMax = 50;
updateTime = 100; 

//box select 
//http://bl.ocks.org/jfreels/6734823
var data = ["Option 1", "Option 2", "Option 3", "Option 4"];

var select = d3.select('body')
  .append('select')
    .attr('class','select')
    .on('change',onchange)

var options = select
  .selectAll('option')
    .data(data).enter()
    .append('option')
        .text(function (d) { return d; });

function onchange() {
    selectValue = d3.select('select').property('value')
    d3.select('body')
        .append('p')
        .text(selectValue + ' is the last selected option.')
};


//dot drawing & updating
// https://www.d3-graph-gallery.com/graph/bubble_basic.html
function updateDrawing(values){
    //scale bubble dimension
    var rScale = d3.scaleLinear()
        .domain([0, max]) //-> max cumulata? o un max fisso? altrimenti se si usa un max temporaneo, ci possono essere dot che possono cambiare dimensione (che forse non è sbagliato, all'inizio sarebbero piccolissime)
        .range([ 0, bubbleMax]);

// Add dots
    var dots = graph.selectAll(".dot").data(values) //se non funziona attenzione qui eventualmente
    dots.enter().append("circle")
        .attr("class","dot")
        .attr("cx", function (d) { return xScale(d.dato); } ) //funzione che trasforma dato -> fascia dove si trova
        .attr("cy", function (d) { return yScale(d.hashtag); } ) // hashtag
        .attr("r", function (d) { return rScale(d.dato); } ) //cumulata per ogni fascia per ogni hashtag, forse qui funzione che li calcola al posto di function
        .style("fill", "rgb(2, 167, 204)")
        .style("opacity", "1")
        .attr("stroke", "none" ) //al momento rimosso stroke
    dots.exit().remove();
    //dots.transition().duration(updateTime)
    //  .attr("cx", function (d) { return x(d.dato); } ) //funzione che trasforma dato -> fascia dove si trova
    //    .attr("cy", function (d) { return y(d.hashtag); } ) // hashtag
    //    .attr("r", function (d) { return z(d.dato); } ) //cumulata per ogni fascia per ogni hashtag, forse qui funzione che li calcola al posto di function

} 

    
    //hover event (selezione)
        graph.on("mouseover", function(d){
                console.log(d);
                d3.select(this).attr("opacity",0.6);    
                })
        graph.on("mouseout", function(d){
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

//possibile funzione per cumulata
// http://learnjsdata.com/group_data.html
