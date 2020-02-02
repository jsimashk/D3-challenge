
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";



// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, height]);
  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

function renderLabels(labelsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  labelsGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis])-6)
    .attr("y", d => newYScale(d[chosenYAxis])+2)
    .text(d => d["abbr"])

  return labelsGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "In Poverty (%):";
  }
  else {
    var label = "# of Albums:";
  }

  console.log(chosenXAxis);

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      console.log(d[chosenXAxis]);
      return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;

}


// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function(healthData, err) 
{
    if (err) throw err;
  
    // parse data
    //id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,
    //healthcare,healthcareLow,healthcareHigh,
    //obesity,obesityLow,obesityHigh,
    //smokes,smokesLow,smokesHigh
    healthData.forEach(function(data) {
      data.id = +data.id;
      data.state = data.state;
      data.abbr = data.abbr;
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.income = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityLow;
      data.obesityHigh = +data.obesityHigh;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
    });

    console.log(healthData);
  
    
    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);
  
    
    // Create y scale function
    var yLinearScale = yScale(healthData, chosenYAxis);

    //var yLinearScale = d3.scaleLinear()
    //  .domain([0, d3.max(healthData, d => d.healthcare)])
    //  .range([height, 0]);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", false)
     // .attr("transform", `translate(${width}, 0)`)
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("fill", "green")
      .attr("opacity", ".5");

   
    var labelsGroup = chartGroup.selectAll("text")
      .data(healthData)
      .enter()
      .append("text")
      .text(d => d["abbr"])
      .attr("fill", "darkgreen")
      .attr("font-size", 10)
      .attr("font-weight", 400)
      //.attr("text-anchor", "middle")
      .attr("x",  d => xLinearScale(d[chosenXAxis])-6)
      .attr("y",  d => yLinearScale(d[chosenYAxis])+2)

    
    // Create group for  3 x- axis labels
    var labels_x_Group = chartGroup.append("g")
      .attr("transform", `translate(${width / 3}, ${height + 20})`);

    // Create group for  3 y- axis labels
    var labels_y_Group = chartGroup.append("g")
      .attr("transform", `translate(0, 0)`);
  
    var povertyLabel = labels_x_Group.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = labels_x_Group.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = labels_x_Group.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
  
  
    // append y axis
    var obesityLabel = labels_y_Group.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0-height/2)
      .attr("y", 20-margin.left)
      //.attr("dy", "1em")
      //.classed("axis-text", true)
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obesity (%)");
  
    var smokesLabel = labels_y_Group.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0-height/2)
      .attr("y", 40 - margin.left)
      //.attr("dy", "1em")
      //.classed("axis-text", true)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var healthcareLabel = labels_y_Group.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - (height / 2))
      .attr("y", 60 - margin.left)
      //.attr("dy", "1em")
      //.classed("axis-text", true)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    //var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  

    // x axis labels event listener
    labels_x_Group.selectAll("text")
      .on("click", function() 
      {
        // get value of selection

        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          console.log(chosenXAxis);
          console.log(chosenYAxis);

          //console.log(labels_x_Group.selectAll("text"));
          //console.log(labels_y_Group.selectAll("text"));

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(healthData, chosenXAxis);
          //yLinearScale = yScale(healthData, chosenYAxis);

          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
  //        yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new x and y values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // updates circles with new x and y values
          labelsGroup = renderLabels(labelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
         // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis == "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
              
          }
          else if(chosenXAxis == "poverty"){
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
    
   
    // y axis labels event listener
    labels_y_Group.selectAll("text")
      .on("click", function() {

        // get value of selection

        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
  
          // replaces chosenYAxis with value
          chosenYAxis = value;
  
          console.log(chosenXAxis);
          console.log(chosenYAxis);
  
          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = yScale(healthData, chosenYAxis);
          //xLinearScale = xScale(healthData, chosenXAxis);

          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);
          //xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x and y values
          //circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // updates circles with new x and y values
          labelsGroup = renderLabels(labelsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
         // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenYAxis == "obesity") {
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
              
          }
          else if(chosenYAxis == "smokes"){
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  }).catch(function(error) {
    console.log(error);
  });
