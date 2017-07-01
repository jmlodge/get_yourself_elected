queue()
    .defer(d3.json, "/donorsUS/projects")
    .await(makeGraphs);

function makeGraphs(error, projectsJson) {
    //clean projectJson data
    var donorsUSProjects = projectsJson;
    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
    var numberFormat = d3.format(",f");
    donorsUSProjects.forEach(function (d) {
       d["date_posted"] = dateFormat.parse(d["date_posted"]);
       d["date_posted"].setDate(1);
       d["total_donations"] = +d["total_donations"];
    });

    //create crossfilter instance
    var ndx = crossfilter(donorsUSProjects);

    //define dimensions
    var dateDim = ndx.dimension(function (d) {
        return d["date_posted"];
    });
    var resourceTypeDim = ndx.dimension(function (d) {
       return d["resource_type"];
    });
    var povertyLevelDim = ndx.dimension(function (d) {
       return d["poverty_level"];
    });
    var cityDim = ndx.dimension(function (d) {
       return d["school_city"];
    });
    var totalDonationsDim = ndx.dimension(function (d) {
       return d["total_donations"];
    });
    var fundingStatus = ndx.dimension(function (d) {
       return d["funding_status"];
    });
    var primaryFocusSubDim = ndx.dimension(function (d) {
        return d["primary_focus_subject"];
    });

    var literacyDim = primaryFocusSubDim.filter('Literacy');

    var gradeDim = ndx.dimension(function (d) {
       return d['grade_level']
    });

    var metroDim = ndx.dimension(function (d) {
       return d['school_metro']
    });

    //calc metrics
    var numProjectsByDate = dateDim.group();
    var numProjectsByResourceType = resourceTypeDim.group();
    var numProjectsByPovertyLevel = povertyLevelDim.group();
    var cityGroup = cityDim.group();
    var numProjectsByFundingStatus = fundingStatus.group();
    var numPrimaryFocusSub = primaryFocusSubDim.group();
    var numGradeLevel = gradeDim.group();
    var numMetro = metroDim.group();

    var all = ndx.groupAll();
    var totalDonations = ndx.groupAll().reduceSum(function (d) {
       return d["total_donations"];
    });

    //define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["date_posted"];
    var maxDate = dateDim.top(1)[0]["date_posted"];

    //charts
    var timeChart = dc.barChart("#time-chart");
    var resourceTypeChart = dc.rowChart("#resource-type-row-chart");
    var povertyLevelChart = dc.rowChart("#poverty-level-row-chart");
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalDonationsND = dc.numberDisplay("#total-donations-nd");
    var fundingStatusChart = dc.pieChart("#funding-chart");
    var primaryFocusSubChart = dc.pieChart("#pri-focus-chart");
    var gradeLevelChart = dc.pieChart("#grade-level-chart");
    var metroChart = dc.pieChart("#metro-chart");

    var selectField = dc.selectMenu('#menu-select')
        .dimension(cityDim)
        .group(cityGroup);

    var colourScale = d3.scale.ordinal().range(["#BED661", "#89E894", "#78D5E3", "#7AF5F5", "#34DDDD", "#93E2D5"]);

    numberProjectsND
       .formatNumber(d3.format("d"))
       .valueAccessor(function (d) {
           return d;
       })
       .group(all);

    totalDonationsND
       .formatNumber(d3.format("d"))
       .valueAccessor(function (d) {
           return d;
       })
       .group(totalDonations)
       .formatNumber(d3.format(".3s"));

    timeChart
        .width(800)
        .height(330)
        .colors(colourScale)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dateDim)
        .group(numProjectsByDate)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(4);

    primaryFocusSubChart
        .height(250)
        .radius(90)
        .innerRadius(40)
        .colors(colourScale)
        .transitionDuration(1500)
        .dimension(primaryFocusSubDim)
        .group(numPrimaryFocusSub)
        .dimension(literacyDim)
        .transitionDuration(600);

     gradeLevelChart
        .height(250)
        .radius(90)
        .innerRadius(40)
        .colors(colourScale)
        .transitionDuration(1500)
        .dimension(gradeDim)
        .group(numGradeLevel)
        .transitionDuration(600);

     metroChart
        .height(250)
        .radius(90)
        .innerRadius(40)
        .colors(colourScale)
        .transitionDuration(1500)
        .dimension(metroDim)
        .group(numMetro)
        .transitionDuration(600);

    resourceTypeChart
        .width(550)
        .height(250)
        .colors(colourScale)
        .dimension(resourceTypeDim)
        .group(numProjectsByResourceType)
        .ordering(function(d) {
            return +d.value
        })
        .xAxis().ticks(4);

    povertyLevelChart
        .width(700)
        .height(330)
        .colors(colourScale)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .ordering(function(d) {
            return +d.value
        })
        .xAxis().ticks(4);

    fundingStatusChart
        .height(250)
        .radius(90)
        .innerRadius(40)
        .colors(colourScale)
        .transitionDuration(1500)
        .dimension(fundingStatus)
        .group(numProjectsByFundingStatus);

   dc.renderAll();
}
