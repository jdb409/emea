// url
// https://localhost:8080/emea?fund1=sharpe:.4,return:.4&fund2=sharpe:1,return:.7&fund3=sharpe:1,return:.5&fund4=sharpe:1.2,return:.9
// format comes from java webhook


let query = location.search.replace('\?', '').split('&');

let funds = query.reduce((memo, current) => {
    let queryPair = current.split("=");
    console.log(queryPair[1])
    if (queryPair[1] != undefined) {
        let fund = queryPair[0].replace(/%20/g, ' ');
        let trimmed = queryPair[1].replace('[', '');
        trimmed = trimmed.replace(']', '');
        let fundStats = trimmed.split(",")
        let statMap = {}
        fundStats.forEach(stat => {
            stat = stat.split(":");

            let statName = stat[0].replace(/%20/g, '');

            statMap[stat[0]] = stat[1].replace('%', '');
        })
        memo.set(fund, statMap);
    }
    return memo;
}, new Map())


let stats = query[0].split("=")[1].split(",");
let data = {}
stats.forEach(stat => {
    let statName = stat.split(":")[0].replace(/\[|]/, '');

    data[statName] = []
    // data[statName]["fundNames"] = [];
    // data[statName]["values"] = [];

    funds.forEach((stats, key, map) => {
        data[statName].push({
            fundName: key,
            value: Number(map.get(key)[statName])
        })
    })
})

// Create chart for each stat
for (let stat in data) {
    if (stat.indexOf('peerpercentile') >= 0) continue;
    // set the dimensions and margins of the graph
    var margin = { top: 40, right: 20, bottom: 30, left: 50 },
        width = (window.innerWidth / 3) - margin.left - margin.right,
        height = window.innerHeight / 3 - margin.top - margin.bottom;


    // set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);

    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", window.innerHeight)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + window.innerHeight / 4 + ")");

    // get the data

    let containsNeg = data[stat].some(d => {

        return d.value < 0
    })

    x.domain(data[stat].map(function (d) { return d.fundName; }))
    y.domain(containsNeg ? [d3.min(data[stat], function (d) { return d.value }), d3.max(data[stat], function (d) { return d.value; })] : [0, d3.max(data[stat], function (d) { return d.value; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(data[stat])
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.fundName); })
        .attr("width", x.bandwidth())
        // .attr("y", function (d) { return y(d.value); })
        .attr("y", function (d) { return y(Math.max(0, d.value)); })
        // .attr("height", function (d) { return height - y(d.value); })
        .attr("height", function (d) { return Math.abs(y(d.value) - y(0)); })
        .attr('fill', function (d) {
            return d.value > 0 ? 'steelblue' : 'red';
        })
        .attr('class', function (d) {
            return d.fundName;
        })
        .attr('id', function (d) {
            console.log('asdfs', addPercentage(stat));

            return addPercentage(stat) ? d.value + '%' : d.value;
        });

    stat = stat.replace(/%20/g, '');
    const title = stat[0].toUpperCase() + stat.slice(1);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -50)
        .attr("font-size", '2em')
        .style("text-anchor", "middle")
        .text(title);


    // // add the x Axis
    // svg.append("g")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    $(function () {
        // On document load, call the render() function to load the graph
        // render();

        $('rect').mouseenter(function () {
            $('#fund').html(this.className.animVal);
            $('#stat').html($(this).attr('id'));
        });
    });
}

function addPercentage(stat) {

    return !stat.toLowerCase().includes("sharpe") && !stat.toLowerCase().includes("beta") && !stat.toLowerCase().includes("sortino");
}