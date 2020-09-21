function init() {
  var selector = d3.select("#selDataset");
  //inside data object, names array contains id numbers of all study participants
  d3.json("samples.json").then((data) => {
    console.log(data);
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector.append("option").text(sample).property("value", sample);
    });
  
})
buildMetadata("940");
buildCharts("940");
}

init();


//takes in user selected ID from dropdown menu as newsample. called in index.html
function optionChanged(newSample){
  buildMetadata(newSample);
  buildCharts(newSample);
}

//when dropdown menu option is selected id number is passed in as sample
function buildMetadata(sample){
  d3.json("samples.json").then((data) => {
      var metadata = data.metadata;
      //filters for an object in the array whose id property matches the id number passed into buildMetadata
      var resultArray = metadata.filter(sampleObject => sampleObject.id == sample);
      var result = resultArray[0];
      var PANEL = d3.select("#sample-metadata");
      //ensures contents are cleared when another id number is chosen
      PANEL.html("");
      //object.entries returns key-value pair in an array. this gives us the remaining results corresponding with the user selection
      Object.entries(result).forEach(([key,value]) => {
          PANEL.append("h6").text(key + ": " + value);
      })

  });
} 
function buildCharts(sample){
  d3.json("samples.json").then((data) => {
      //access samples for graph building
      var chartData = data.samples;
      var chartArray = chartData.filter(sampleObject => sampleObject.id == sample);
      var chartResult = chartArray[0];

      var barChart = {
          //sort sample values to show top 10
          x: chartResult.sample_values.sort((a,b) => b-a).slice(0,10).reverse(),
          //top 10 OTUID's 
          y: chartResult.otu_ids.map((otuID) => "otu " + otuID).slice(10),
          text: chartResult.otu_labels.slice(0,10),
          type: "bar",
          orientation: "h"
      };
      var layoutBar = {
          title: "Top 10 Bacterial Species",
          xaxis: {title: "Frequency"}

      };
      Plotly.newPlot("bar", [barChart], layoutBar);

      var bubbleChart = {
          x: chartResult.otu_ids,
          y: chartResult.sample_values,
          text: chartResult.otu_labels,
          mode: "markers",
          marker: {
              size: chartResult.sample_values,
              color: chartResult.otu_ids
          }
      };
      var layoutBubble = {
          xaxis: {title: "OTU ID"},
          yaxis: {title: "Frequency"}

      };
      Plotly.newPlot("bubble", [bubbleChart], layoutBubble);

      //access metadata for gauge
      var wfreqData = data.metadata;
      var wfreqArray = wfreqData.filter(sampleObject => sampleObject.id == sample);
      var wfreqResult = wfreqArray[0];

      var gaugeChart = {
          type: "indicator",
          mode: "gauge",
          gauge: {
              axis: {
                  range: [0,10],
                  tickmode: "auto",
                  nticks: 10
              },
              steps: [],
              threshold:{
                  value: wfreqResult.wfreq,
                  line: {color: "red", width: 4}
              },
              
          }
      };
      var layoutGauge = {
          title: "Belly Button Wash Frequency Per Week"
      };
      Plotly.newPlot("gauge", [gaugeChart], layoutGauge);
  });
}