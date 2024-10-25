const width = 1000;
const height = 600;

// Define a color scale with at least 2 colors (using D3's color schemes)
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const tooltip = d3.select("#tooltip");

const svg = d3.select("#tree-map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Fetch data
const dataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

d3.json(dataURL).then(data => {
  const root = d3.hierarchy(data)
    .eachBefore(d => {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  const treemap = d3.treemap()
    .size([width, height])
    .padding(1);

  treemap(root);

  const tile = svg.selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  tile.append("rect")
    .attr("class", "tile")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => colorScale(d.data.category))  // Use color scale for distinct colors
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .on("mouseover", (e, d) => {
      tooltip
        .style("visibility", "visible")
        .html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
        .attr("data-value", d.data.value)
        .style("left", `${e.pageX + 10}px`)
        .style("top", `${e.pageY - 20}px`);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

  tile.append("text")
    .selectAll("tspan")
    .data(d => d.data.name.split(/(?=[A-Z][a-z])/g))
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", (d, i) => 13 + i * 10)
    .text(d => d);

  // Legend
  const categories = Array.from(new Set(root.leaves().map(d => d.data.category)));

  const legend = d3.select("#legend")
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "legend-item");

  legend.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d, i) => colorScale(i));

  legend.append("text")
    .attr("x", 30)
    .attr("y", 15)
    .text(d => d);
});
