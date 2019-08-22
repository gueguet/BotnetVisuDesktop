// FLOW DATA GLOB VUE

// based on prepared DOM, initialize echarts instance
var myChart = echarts.init(document.getElementById('main'));

    $.getJSON('myflights.json', function (data) {
        console.log(data);
    })


$.getJSON('myflights.json', function (data) {
    var airports = data.airports.map(function (item) {
        return {
            coord: [item[3], item[4]]
        }
    });
    function getAirportCoord(idx) {
        return [data.airports[idx][3], data.airports[idx][4]];
    }

    // Route: [airlineIndex, sourceAirportIndex, destinationAirportIndex]
    var routesGroupByAirline = {};
    data.routes.forEach(function (route) {
        var airline = data.airlines[route[0]];
        var airlineName = airline[0];
        if (!routesGroupByAirline[airlineName]) {
            routesGroupByAirline[airlineName] = [];
        }
        routesGroupByAirline[airlineName].push(route);
    });

    var pointsData = [];
    data.routes.forEach(function (airline) {
        pointsData.push(getAirportCoord(airline[1]));
        pointsData.push(getAirportCoord(airline[2]));
    });

    var OHLACOORD = [[-74.006015,40.7127281],[-85.006015,40.7127281]]


    mypointsdata = [[-74.006015,40.7127281],[-85.006015,40.7127281]]
    console.log(mypointsdata);


    // var series = data.airlines.map(function (airline) {
    //     var airlineName = airline[0];
    //     var routes = routesGroupByAirline[airlineName];

    //     if (!routes) {
    //         return null;
    //     }

    //     return {

    //         type: 'lines3D',
    //         name: mypointsdata,

    //         effect: {
    //             show: true,
    //             trailWidth: 2,
    //             trailLength: 0.15,
    //             trailOpacity: 1,
    //             trailColor: 'red'
    //         },

    //         lineStyle: {
    //             width: 1,
    //             color: 'grey',
    //             // color: 'rgb(118, 233, 241)',
    //             opacity: 0.1
    //         },

    //         blendMode: 'lighter',

    //         // data: routes.map(function (item) {
    //         //     console.log([airports[item[1]].coord, airports[item[2]].coord])
    //         //     return [airports[item[1]].coord, airports[item[2]].coord];
    //         // })

    //         data: mypointsdata

    //     };
    // }).filter(function (series) {
    //     return !!series;
    // });


    var series = [ 

        {

            type: 'lines3D',
            name: mypointsdata,
            
            effect: {
                show: true,
                trailWidth: 2,
                trailLength: 0.15,
                trailOpacity: 1,
                trailColor: 'red'
            },
            
            lineStyle: {
                width: 1,
                color: 'grey',
                // color: 'rgb(118, 233, 241)',
                opacity: 0.1
            },
            
            blendMode: 'lighter',
            
            // data: routes.map(function (item) {
            //     console.log([airports[item[1]].coord, airports[item[2]].coord])
            //     return [airports[item[1]].coord, airports[item[2]].coord];
            // })
            
            data: mypointsdata


        }


    ];


    // PUSH DATA static place
    series.push({
        type: 'scatter3D',
        coordinateSystem: 'globe',
        blendMode: 'lighter',
        symbolSize: 10,
        itemStyle: {
            color: 'green',
            opacity: 1
        },
        data: mypointsdata
    });


    console.log(routesGroupByAirline);

    console.log("test");
    console.log(series);


    // SET OPTION
    myChart.setOption({

        // legend: {
        //     selectedMode: 'single',
        //     left: 'left',
        //     data: Object.keys(routesGroupByAirline),
        //     orient: 'vertical',
        //     textStyle: {
        //         color: 'blue'
        //     }
        // },

        globe: {

            environment: 'asset/starfield.jpg',

            baseTexture: 'asset/earth.jpg',

            heightTexture: 'asset/bathymetry_bw_composite_4k.jpg',

            displacementScale: 0.1,
            displacementQuality: 'high',

            // baseColor: 'red',

            shading: 'realistic',
            realisticMaterial: {
                roughness: 0.2,
            },

            postEffect: {
                enable: true,
                depthOfField: {
                    enable: false,
                    focalDistance: 150
                }
            },
            temporalSuperSampling: {
                enable: true
            },
            light: {
                ambient: {
                    intensity: 0
                },
                main: {
                    intensity: 0.1,
                    shadow: false
                },
                ambientCubemap: {
                    texture: 'asset/lake.hdr',
                    // texture: 'data-gl/asset/lake.hdr',
                    exposure: 1,
                    diffuseIntensity: 0.5,
                    specularIntensity: 2
                }
            },
            viewControl: {
                autoRotate: false
            },
            silent: true
        },
        series: series
    });

    // window.addEventListener('keydown', function () {
    //     series.forEach(function (series, idx) {
    //         myChart.dispatchAction({
    //             type: 'lines3DToggleEffect',
    //             seriesIndex: idx
    //         });
    //     })
    // });

});


// // use configuration item and data specified to show chart
// myChart.setOption(option);