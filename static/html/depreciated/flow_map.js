// FLOW MAP WITH MAP

// based on prepared DOM, initialize echarts instance
var myChart = echarts.init(document.getElementById('main'));


$(document).ready(function(){

    $('.slider-time').html('00:00');
    $('.slider-time2').html('01:00');

    $("#show_data_map").click(function(){

        // global var
        var get_time_1 = $('.slider-time').text();
        var get_time_2 = $('.slider-time2').text();

        // get our cyber data
        $.getJSON("/monkey", function(result){

            $.getJSON("/cities_info_out", function(yores){

                cities_dict = {}
                ip_dict = {}

                for (var key in yores){
                    cities_dict[yores[key][0]] = [parseFloat(yores[key][2]), parseFloat(yores[key][1])]
                    ip_dict[key] = [yores[key][0],parseFloat(yores[key][2]), parseFloat(yores[key][1])]
                }

                console.log("dict ip :");
                console.log(ip_dict);

                var series_dict = {};
                all_data_series = []

                // instanciate a 
                for (src_ip of result.src_ip) {
                    series_dict[src_ip] = [];
                }

                for (route of result.routes) {

                    console.log(route);

                    var serie = [
                        { name: ip_dict[route[0]][0] }, { name: ip_dict[route[1]][0], value: 70 }, { dst_port: route[3] },
                        { size: route[5] }, { emission_time: route[6] }, { emission_date: route[7] }, { is_malicious: false }
                    ]

                    // console.log(serie);

                    // create a serie for each src_ip
                    if (Object.keys(series_dict).includes(route[0])) {
                        series_dict[route[0]].push(serie);
                    }
    
                    // format_time();
                    /*
                    var time_string = route[7];
                    var extract_time;
                    if (time_string[time_string.length - 5] == ' ') {
                        var extract_time = '0' + time_string.substr(time_string.length - 4);    
                    } 
                    else {
                        var extract_time = time_string.substr(time_string.length - 5);
                    }
    
                    if (extract_time > get_time_1 && extract_time < get_time_2) {

                        // console.log(route)

                        console.log(route);

                        var serie = [
                            {name: ip_dict[route[0]][0]}, {name:ip_dict[route[1]][0], value:70}, {dst_port : route[3]},
                            {size: route[5]}, {emission_time: route[6]}, {emission_date: route[7]}, {is_malicious: false}
                        ]

                        // console.log(serie);

                        // create a serie for each src_ip
                        if (Object.keys(series_dict).includes(route[0])) {
                            series_dict[route[0]].push(serie);
                        }
                        
                    }
                    */
                }

                label_data = [] 

                for (var key in series_dict){
                    all_data_series.push([ip_dict[key][0], series_dict[key]]);
                    if (!label_data.includes(ip_dict[key][0])) {
                        label_data.push(ip_dict[key][0])
                    }
                }

                // console.log(all_data_series);

                createMap(cities_dict, all_data_series);

            })

        })

    })

});


// ------------------------ SLIDER ---------------------------

$("#slider-range").slider({
    range: true,
    min: 0,
    max: 1440,
    step: 5,
    values: [0, 60],

    slide: function (e, ui) {
        
        var hours1 = Math.floor(ui.values[0] / 60);
        var minutes1 = ui.values[0] - (hours1 * 60);

        if (hours1.toString().length == 1) hours1 = '0' + hours1;
        if (minutes1.toString().length == 1) minutes1 = '0' + minutes1;

        var hours2 = Math.floor(ui.values[1] / 60);
        var minutes2 = ui.values[1] - (hours2 * 60); 

        if (hours2.toString().length == 1) hours2 = '0' + hours2;
        if (minutes2.toString().length == 1) minutes2 = '0' + minutes2;

        $('.slider-time').html(hours1 + ':' + minutes1);

        $('.slider-time2').html(hours2 + ':' + minutes2);

    }

});

// ----------------------------------------------------------



// ------------------------ MAP ---------------------------

// create the map
function createMap(city_dict, data_series) {

    // console.log("data series");
    // console.log(data_series);

    // console.log("create maps");

    // load a JSON map of the USA
    $.get('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95368/USA_geo.json', function (usaJson) {
        myChart.hideLoading();
    
        // register this map as "USA"
        echarts.registerMap('USA', usaJson, {
            Alaska: {              
                left: -131,
                top: 25,
                width: 15
            },
            Hawaii: {
                left: -110,       
                top: 28,
                width: 5
            },
            'Puerto Rico': {       
                left: -76,
                top: 26,
                width: 2
            }
        });
    
    
    // geo coord of the different city --> the different src/dst IP
    var geoCoordMap = city_dict;
    
    // mystere...
    var convertData = function (data) {
        
        var res = [];
        for (var i = 0; i < data.length; i++) {
            var dataItem = data[i];
            var fromCoord = geoCoordMap[dataItem[0].name];
            var toCoord = geoCoordMap[dataItem[1].name];
            if (fromCoord && toCoord) {
                res.push({
                    fromName: dataItem[0].name,
                    toName: dataItem[1].name,
                    coords: [fromCoord, toCoord],
                    flow_details: dataItem
                });
            }
        }
        return res;
    };
    
    // series array
    var series = [];

    // console.log("test");

    data_series[0].push(true);
    // console.log("data series");
    // console.log(data_series[0]);

    // console.log(data_series[0]);
    data_series[0][1].forEach(function (item, i) {
        // console.log('yo');
        // console.log(item);
    });


    // var flow_color;




        // ------------------------ STYLE OF THE MAP ---------------------------
        data_series.forEach(function (item, i) {

            // console.log(i);
            // console.log(item);
            // console.log(item[2]);

            // if (item[2] == true) {
            //     flow_color = 'red';
            // }
            // else {
            //     flow_color = 'green';
            // }

            // console.log("ITEM");
            // console.log(item);

            // console.log(item[1]);
            // console.log(item[1][2][3]);
            // console.log(item[1][2][2]);

            series.push({

                name: item[0],
                type: 'lines',
                zlevel: 1,
                symbol: ['none', 'arrow'],
                symbolSize: 20,

                // effect of the trail
                effect: {
                    show: true,
                    period: 4,
                    trailLength: 0,
                    color: 'green',
                    symbolSize: 8,
                },
        
                // style of the line flow
                lineStyle: {
                    normal: {
                        color: '#29990a',
                        width: 2,
                        curveness: 0.2,
                        opacity: 0.8,
                    }
                },
        
                data: convertData(item[1]),
        
                label: {
                    normal: {
                        show: true,
                        position: 'right',
                        formatter: '{b}'
                    }
                },
            },
        
            {
                name: item[0],
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 2,
                // rippleEffect: {
                //     brushType: 'stroke'
                // },
                symbol: ['none', 'arrow'],
                symbolSize: 15,
        
                lineStyle: {
                    normal: {
                        color: 'grey',
                        width: 0.5,
                        curveness: 0.2,
                        opacity: 0.4,
                    }
                },
        
                data: convertData(item[1]),
        
                // show the name of the city
                label: {
                    normal: {
                        show: true,
                        position: 'bottom',
                        formatter: '{b}'
                    }
                },
        
                // size of the city symbol
                symbolSize: function (val) {
                    return val[2] / 15;
                },
                
                itemStyle: {
                    normal: {
                        color: '#ff7f44'
                    }
                },
        
                data: item[1].map(function (dataItem) {
                    return {
                        name: dataItem[1].name,
                        value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
                    };
                })
        
        
            },

         
        );
    });

    // console.log("SERIES");
    // console.log(series);
    // console.log(series[0]);

    
    // ------------------------ SETTINGS OF THE MAP ---------------------------

    option = {
        backgroundColor: '#404a59',
        title : {
            text: 'Flow Data Map',
            subtext: 'USA',
            left: 'center',
            textStyle : {
                color: '#dd7842',
            }
        },
    
        tooltip : {
            trigger: 'item'
        },
    
        // legend selection data
        legend: {
            orient: 'vertical',
            top: 'top',
            left: 'right',
            data: label_data,
            textStyle: {
                color: '#dd7842'
            },
            // can set the selection mode 
            selectedMode: 'single'
        },
    
        // map options
        geo: {
                map: 'USA',
                label: {
                    // show or not the label of the map
                    emphasis: {
                        show: true
                    }
                },
                // allow or not the navigation
                roam: true,
                itemStyle: {
                    normal: {
                        // color of the different states
                        areaColor: '#323c48',
                        // border color of the different states
                        borderColor: '#dd7842'
                    },
                    emphasis: {
                        // color of the states when over is active
                        areaColor: '#dd7842'
                    }
                }
            },
            series: series
        };
    
        // use configuration item and data specified to show chart
        myChart.setOption(option);
    });
}


var selected_data;



myChart.on('click', function (touche_flow) {

    console.log(touche_flow);
    console.log(touche_flow.data);

    console.log(touche_flow.data.flow_details);
    console.log(touche_flow.data.flow_details[3]);


    $('#form-info').html(touche_flow.data.flow_details[0].name);
    $('#to-info').html(touche_flow.data.flow_details[1].name);
    $('#dst-port-info').html(touche_flow.data.flow_details[2].dst_port);
    $('#flow-size-info').html(touche_flow.data.flow_details[3].size + ' bytes');
    $('#emission-time-info').html(touche_flow.data.flow_details[4].emission_time + ' seconds');
    $('#emission-date-info').html(touche_flow.data.flow_details[5].emission_date);
    $('#is-malicious-info').html(touche_flow.data.flow_details[6].is_malicious.toString());



});








