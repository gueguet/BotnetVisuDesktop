// FLOW DATA WITH CYTOSCAPE FRAMEWORK

// Background : Arkansas map
const background = new Image(1200, 800);



// ------------------------ INIT CYTOSCAPE ---------------------------

var cy = cytoscape({
    container: document.getElementById('cy'),
    style: [
        {
            selector: 'node',
            style: {
                'shape': 'ellipse',
                'background-color': 'grey',
                'label': 'data(label)',
                'font-size': '5px'
            }
        },
        {
            selector: 'edge',
            style: {
                'label': 'data(label)',
                'font-size': '3px',
                "curve-style": "bezier",
                'control-point-step-size': 200,
                "edge-text-rotation": "autorotate",
            }
        },
    ],

    // zoom sensitivity
    wheelSensitivity: 0.1,

});


// ------------------------ MAP BACKGROUND ---------------------------

const bottomLayer = cy.cyCanvas({
    zIndex: -1,
});

const canvas = bottomLayer.getCanvas();
const ctx = canvas.getContext("2d");

cy.on("render cyCanvas.resize", evt => {
    bottomLayer.resetTransform(ctx);
    bottomLayer.clear(ctx);
    bottomLayer.setTransform(ctx);

    ctx.save();
    ctx.drawImage(background, 0, 0);

    // If we want to create fix label and so on...

    // Draw text that follows the model
    // ctx.font = "24px Helvetica";
    // ctx.fillStyle = "black";
    // ctx.fillText("This text follows the model", 200, 300);

    // Draw shadows under nodes
    // ctx.shadowColor = "black";
    // ctx.shadowBlur = 25 * cy.zoom();
    // ctx.fillStyle = "white";
    // cy.nodes().forEach(node => {
    //   const pos = node.position();
    //   ctx.beginPath();
    //   ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI, false);
    //   ctx.fill();
    // });
    // ctx.restore();

    // Draw text that is fixed in the canvas
    // bottomLayer.resetTransform(ctx);
    // ctx.save();
    // ctx.font = "24px Helvetica";
    // ctx.fillStyle = "red";
    // ctx.fillText("This text is fixed", 200, 200);
    // ctx.restore();
});


// Preload images
background.src ="../asset/arkansas_map_2.svg";


// ------------------------ GET JSON FROM SERVER / STORE IT ---------------------------

// var to store our data the first time we load them --> we will haev to had a column for malicious edge
var flow_data;

$(document).ready(function(){

    // init time slider
    $('.slider-time').html('00:00');
    $('.slider-time2').html('01:00');

    $("#get_data").click(function(){

        // global var
        var get_time_1 = $('.slider-time').text();
        var get_time_2 = $('.slider-time2').text();

        // zoom animation
        cy.animate({
            pan: { x: 200, y: 100 },
            zoom : 0.9
        }, {
            duration: 1500
        });

        // if this is the first time we load our data
        if (flow_data == undefined) {
            // get JSON data, routes from the server
            $.getJSON("/monkey", function(result){

                // store the result
                flow_data = result;

                // nodes for SRC_IP
                var range_src_ip = 0;
                for (srcIP of result.src_ip) {
                    cy.add({
                        data: { id: srcIP,
                                label: srcIP},
                        position: { x: 150 + 150*range_src_ip, y: 500},
                        style: {
                            height: 10,
                            width: 10,
                            'background-color': '#4788ef',
                            'font-size': '5px',
                            'shape': 'circle',
                            'color': '#4788ef',
                        }
                    });	     
                    range_src_ip ++;
                }

                // for substation node distribution 
                theta = 0;
                R = 600;

                // to create different id for each route id
                ind_routes = 0;

                // to store the substation we already place on the canvas
                var subArray = [];
                // store the route to draw it later with animation and time managing
                var routeToDraw = []; 

                // initialize our dictionnary
                var dictRouteToDraw = {}; 

                for (route of result.routes) {

                    // extract time of our JSON
                    var time_string = route[7];
                    var extract_time;
                    if (time_string[time_string.length - 5] == ' ') {
                        var extract_time = '0' + time_string.substr(time_string.length - 4);    
                    } 
                    else {
                        var extract_time = time_string.substr(time_string.length - 5);
                    }

                    dictRouteToDraw[extract_time] = [];
                }


                for (route of result.routes) {

                    // extract time of our JSON
                    var time_string = route[7];
                    var extract_time;
                    if (time_string[time_string.length - 5] == ' ') {
                        var extract_time = '0' + time_string.substr(time_string.length - 4);    
                    } 
                    else {
                        var extract_time = time_string.substr(time_string.length - 5);
                    }

                    // if the time of the flow is inbetween our two slide values --> create the edge     
                    // we also want to draw the flow emit by non "normal" dst_IP           
                    if ( (extract_time > get_time_1 && extract_time < get_time_2) && route[10]!='normal') {

                        dictRouteToDraw[extract_time].push(route);

                        routeToDraw.push(route);

                        // be sure that we not already add a node for a particular substation
                        if (!subArray.includes(route[8])) {

                            //  create a node for the substation
                            cy.add({
                                data: { id: route[8],
                                        label: route[8]},
                                position: { x: parseFloat(result.substations_pos[route[8]][0]) , y: parseFloat(result.substations_pos[route[8]][1]) },
                                    style: {
                                        height: 10,
                                        width: 10,
                                        'background-color': '#5c53ba',
                                        'font-size': '5px',
                                        'shape': 'circle',
                                        'color': '#5c53ba',
                                    }
                            });	

                            // add the substation to the substation we already seen
                            subArray.push(route[8]);
                        }



                        
        
             
                    }

                    // for each route we will add a bool false --> not malicious for now
                    // we can change this value with the "malicious btn"
                    route.push(false);
                    ind_routes += 1;

                }

                // console.log(dictRouteToDraw);

                // store number of different "packages" of route to draw
                keyToDraw = [];
                for (var key in dictRouteToDraw) {
                    
                    if (dictRouteToDraw[key].length != 0) {
                        keyToDraw.push(key);
                    }
                    
                }

                // console.log(routeToDraw);
                // console.log(routeToDraw.length);
                // console.log(routeToDraw[0]);
                // console.log(routeToDraw[1]);

                // for (var i_route = 0; i_route < routeToDraw.length; i_route++) {
                //     (function (i_route) {
                //         setTimeout(function () {
                //           drawRoute(routeToDraw[i_route])
                //          }, 1000*i_route);
                //     })(i_route);
                // }

                for (var key_ind = 0; key_ind < keyToDraw.length; key_ind++) {
                    (function (key_ind) {



                        setTimeout(function () {

                            console.log(keyToDraw[key_ind]);

                            for (route of dictRouteToDraw[keyToDraw[key_ind]]) {
                                drawRoute(route)
                            }

                            $('#time-value').html(keyToDraw[key_ind])
                          
                         }, 1000*key_ind);

                    })(key_ind);
                }


                function drawRoute(route) {
                    cy.add({
                        data: {
                            'source': route[0],
                            'target': route[8],
                            'label': route[4] + ' / ' + 'Dst Port : ' + route[3] + ' / ' + route[5] + ' bytes',
                            'duration':route[6],
                            'emission_time':route[7],
                            'ind': ind_routes,
                        },
                        style: {
                            'line-color':'#4bd85e',
                            'color': 'grey',
                            'width':(route[5]/5000) + 'px',
                        }
                    });                    
                }
                
            });




        }

        // if we already have the data and set some malicious edges --> retieve the data with the new column
        else {
            result = flow_data;

            // nodes for SRC_IP
            var range_src_ip = 0;
            for (srcIP of result.src_ip) {
                cy.add({
                    data: { id: srcIP,
                            label: srcIP},
                    position: { x: 150*range_src_ip, y: 300},
                    style: {
                        height: 10,
                        width: 10,
                        'background-color': '#4788ef',
                        'font-size': '5px',
                        'shape': 'circle',
                        'color': '#4788ef',
                    }
                });	     
                range_src_ip ++;
            }

            // dst_IP
            theta = 0;
            R = 600;

            // node for SUBSTATIONS
            for (sub of result.substation) {
                cy.add({
                    data: { id: sub,
                            label: sub},
                    position: { x: 2600 + (R*Math.cos(theta)), y: 100 + (R*Math.sin(theta))},
                        style: {
                            height: 10,
                            width: 10,
                            'background-color': '#5c53ba',
                            'font-size': '5px',
                            'shape': 'circle',
                            'color': '#5c53ba',
                        }
                });	
                theta = theta + (2*3.14/270); // 2*pi divided by nunmber of substations
            }

            var ind_routes = 0;

            // edges = routes
            for (route of result.routes) {

                // extract time of our JSON
                var time_string = route[7];
                var extract_time;
                if (time_string[time_string.length - 5] == ' ') {
                    var extract_time = '0' + time_string.substr(time_string.length - 4);    
                } 
                else {
                    var extract_time = time_string.substr(time_string.length - 5);
                }

                // if the time of the flow is inbetween our two slide values --> create the edge                
                if (extract_time > get_time_1 && extract_time < get_time_2 && route[10]!='normal') {


                    // non malicious edge --> grey
                    if (route[9] == false) {

                        // create edges and classify according to the protocol TCP
                        if (route[4] == "TCP") {
                            cy.add({
                                data: {
                                    'source': route[0],
                                    'target': route[8],
                                    'label': route[4] + ' / ' + 'Dst Port : ' + route[3] + ' / ' + route[5] + ' bytes',
                                    'duration':route[6],
                                    'emission_time':route[7],
                                    'ind': ind_routes,
                                },
                                style: {
                                    'line-color':'#4bd85e',
                                    'color': 'grey',
                                    'width':(route[5]/25000) + 'px',
                                }
                            });
                        }
        
                        if (route[4] == "UDP") {
                            cy.add({
                                data: {
                                    'source': route[0],
                                    'target': route[8],
                                    'label': route[4] + ' / ' + 'Dst Port : ' + route[3] + ' / ' + route[5] + ' bytes',
                                    'duration':route[6],
                                    'emission_time':route[7],
                                    'ind': ind_routes,
                                },
                                style: {
                                    'line-color':'#4bd85e',
                                    'color': 'grey',
                                    'width': (route[5]/25000) + 'px',
                                }
                            });
                        }                
                    }

                    else {

                        if (route[4] == "TCP") {
                            cy.add({
                                data: {
                                    'source': route[0],
                                    'target': route[8],
                                    'label': route[4] + ' / ' + 'Dst Port : ' + route[3] + ' / ' + route[5] + ' bytes',
                                    'duration':route[6],
                                    'emission_time':route[7],
                                    'ind': ind_routes,
                                },
                                style: {
                                    'line-color':'red',
                                    'color': 'black',
                                    'width':(route[5]/25000) + 'px',
                                }
                            });
                        }
        
                        if (route[4] == "UDP") {
                            cy.add({
                                data: {
                                    source: route[0],
                                    target: route[8],
                                    label: route[4] + ' / ' + 'Dst Port : ' + route[3] + ' / ' + route[5] + ' bytes',
                                    'duration':route[6],
                                    'emission_time':route[7],
                                    'ind': ind_routes,
                                },
                                style: {
                                    'line-color':'red',
                                    'color': 'black',
                                    'width': (route[5]/25000) + 'px',
                                }
                            });
                        }   
                    }


                }

                ind_routes += 1;

            }
        
            // disable the get data button
            $("#get_data").attr('disabled', 'disabled');
        }

    });
        


    // ------------------------ CLICK ON NODE ---------------------------
    
    // to know if a node was touch or not 
    var node_touched = false;
    var previous_pose_x;
    var previous_pose_x;

    // var for clicking node
    var connected_node = new Array();
    var connected_node_position = new Array();
    
    cy.on('click', 'node', function(evt){

        // if a node is touch for the first time --> we store the connected nodes and the different positions of those nodes
        if (node_touched == false) {
            for (i = 0; i < this.connectedEdges().connectedNodes().length; i++) {
                if (this.connectedEdges().connectedNodes()[i].id() != this.id()) {
                    connected_node.push(this.connectedEdges().connectedNodes()[i]);
                    connected_node_position.push({x:this.connectedEdges().connectedNodes()[i].position().x, y:this.connectedEdges().connectedNodes()[i].position().y})
                }
            }

            // set clicked node information in the UI zone
            current_node = this;
            var all_connected_node_id = '';
            connected_node.forEach(function (node, i) {
                all_connected_node_id += node.id() + ' / ';
            })
            
            $('#node_id').html(this.id());
            $('#connected_node').html(all_connected_node_id);
            $('#linked_flows').html(this.connectedEdges().length);

            // save previous position of the clicked node
            previous_pose_x = this.position().x;
            previous_pose_y = this.position().y;

            this.animate({
                style: {
                    'height': '50',
                    'width': '50',
                    'font-size': '20px',
                    'shape': 'hexagon',
                },
            })
  
            // place all the connected nodes to see flows correctly
            connected_node.forEach(function (node, i) {
                node.position().x = 1500;

                if (connected_node.length > 1) {
                    node.position().y = -100 + (i * (2000/(connected_node.length-1)));
                } else {
                    node.position().y = 0;
                }
                node.animate({
                    style: {
                        'height': '50',
                        'width': '50',
                        'font-size': '20px',
                        'shape': 'hexagon',
                    },
                });  
            });

            // change the position of the node we clicked
            this.position().x = 3000;
            this.position().y = 500;

            // zoom on the node we clicked
            cy.animate({
                pan: { x: -500, y: -100 },
                zoom : 0.8
            }, {
                duration: 500
            });


            // change display of connected edges
            this.connectedEdges().animate({
                style: {
                    'font-size': '20px',
                    'color': 'black',
                    'control-point-step-size': '1000',
                },
            }); 
                
            node_touched = true;
        }


        // if it's the second time we touche the node --> replace everything
        else {
       
            this.animate({
                style: {
                    'height': 10,
                    'width': 10, 
                    'font-size': '5px',
                },
            })

            this.position().x = previous_pose_x;
            this.position().y = previous_pose_y;
    
            this.connectedEdges().animate({
                style: {
                    'font-size': '3px',
                    'color': 'grey',
                    'control-point-step-size': '200',
                },
            });   


            // replace all the connected nodes to original position
            connected_node.forEach(function (node, i) {

                node.position().x = connected_node_position[i].x;
                node.position().y = connected_node_position[i].y;

                node.animate({
                    style: {
                        'height':'10',
                        'width':'10',
                        'font-size': '5px',
                    },
                });  

            });

            node_touched = false;

            connected_node = [];
            connected_node_position = [];

            // update UI, node information
            $('#node_id').html('');
            $('#connected_node').html('');
            $('#linked_flows').html('');

            // dezoom
            cy.animate({
                pan: { x: 300, y: 200 },
                zoom : 0.9
            }, {
                duration: 500
            });

        }

    });



    // ------------------------ CLICK ON EDGE ---------------------------

    // click on edges
    var last_edge_touched_id = 0;
    var last_edge_touched;

    cy.on('click', 'edges', function(evt){

        // if no edge has been touched --> display this one
        if (this.id() != last_edge_touched_id && last_edge_touched_id == 0) {
            current_edge = this;
            this.animate({
                style: {
                    'color': 'black',
                    'font-size': '20px',
                    'font-weight':'bolder',
                    'control-point-step-size': '1000'
                }
            });
    
            // update UI
            var edge_connected_nodes = '';
            edge_connected_nodes = current_edge.connectedNodes()[0].id() + ' / ' + current_edge.connectedNodes()[1].id()
            $('#edge_emission').html(current_edge.data().emission_time);
            $('#edge_duration').html(current_edge.data().duration);
            $('#edge_connected_node').html(edge_connected_nodes);

            last_edge_touched_id = this.id();
            last_edge_touched = this;
        }

        // if we click on another edge --> display it and hide the previous one
        else if (this.id() != last_edge_touched_id && last_edge_touched_id != 0) {
            current_edge = this;
            this.animate({
                style: {
                    'color': 'black',
                    'font-size': '20px',
                    'control-point-step-size': '1000'
                }
            });
    
            // update UI
            var edge_connected_nodes = '';
            edge_connected_nodes = current_edge.connectedNodes()[0].id() + ' / ' + current_edge.connectedNodes()[1].id()
            $('#edge_emission').html(current_edge.data().emission_time);
            $('#edge_duration').html(current_edge.data().duration);
            $('#edge_connected_node').html(edge_connected_nodes);

            last_edge_touched_id = this.id();
            // hide the previous edge
            last_edge_touched.animate({
                style: {
                    'color': 'grey',
                    'font-size': '3px',
                    'control-point-step-size': '200'
                }
            });
            last_edge_touched = this;
        }
        
        // if we click again on the same edge --> hide it
        else {
            current_edge = this;
            this.animate({
                style: {
                    'color': 'grey',
                    'font-size': '3px',
                    'control-point-step-size': '200'
                }
            });

            // update UI
            $('#edge_emission').html('');
            $('#edge_duration').html('');
            $('#edge_connected_node').html('');

            last_edge_touched_id = 0
        }

    });



    // delete the graph
    $("#del_graph").click(function(){
        cy.elements().remove();
        $("#get_data").removeAttr("disabled");
    })



    // ------------------------ MALICIOUS DECLARATION ---------------------------

    // define an edge as malicious
    $('#malicious-edge-btn').click(function(){

        // define the edge as malicious by changing the last argument of the array

        flow_data.routes[current_edge.data().ind][9] = true;


        my_time_string = current_edge.data().emission_time;

        var my_extract_time;

        if (my_time_string[my_time_string.length - 5] == ' ') {
            var my_extract_time = '0' + my_time_string.substr(my_time_string.length - 4);    
        } 
        else {
            var my_extract_time = my_time_string.substr(my_time_string.length - 5);
        }



        var my_hours = parseFloat(my_extract_time.substr(0,2));
        var my_min = parseFloat(my_extract_time.substr(3,5));

        total = my_hours *60 + my_min;
        total_percent = (total / 1440) * 100;

        // create the vertical red line and inser it in the slider div 
        // to represent malicious flow at the correct time
        var newDiv = document.createElement("div");
        newDiv.className = "vertical-line";

        sliderDiv = $('#slider-range');


        // var testDiv = '<div class="vertical-line" style="left:%{total_percent}%"></div>',total_percent;
        var testDiv = document.createElement('div');

        testDiv.className = "vertical-line";

        testDiv.style.left = total_percent + '%';

        sliderDiv.append(testDiv);

        

        current_edge.animate({
            style: {
                'line-color':'red',
                'color':'black',
            },
        })

        // all edges connected to this node --> become red
        // current_edge.connectedNodes().animate({
        //     style: {
        //         'background-color':'red',
        //         'color':'red',
        //     },
        // }); 

    })


    // save that this flow / node is malicious + new graph ??
    /* MALICIOUS NODE DECLARATION
    $('#malicious-btn').click(function(){

        // the malicious node --> become red
        current_node.animate({
            style: {
                'background-color':'red',
                'color':'red',
            },
        })

        // all edges connected to this node --> become red
        current_node.connectedEdges().animate({
            style: {
                'font-size': '200px',
                'color': 'black',
                'control-point-step-size': '1000',
                'line-color':'red',
            },
        }); 

        // the linked nodes --> become red
        connected_node.forEach(function (node, i) {
            node.animate({
                style: {
                    'background-color':'red',
                    'color':'red',
                },
            }); 
        })
    })
    */



    // ------------------------ SLIDER ---------------------------

    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 1440, // 24:00
        step: 5,
        values: [0, 60], // default values

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

});







// ----------------------------- MOUSE WHEEL EVENT -----------------------------


// Script to create event on mouse wheel action

//     $("#YOYOTEST").click(function() {
//     console.log("test");
//     console.log(cy.zoom());

//     zoom = cy.zoom();

//     if (zoom < 0.5) {
//         console.log("PETIT");
//     }
//     else if (zoom > 1) {
//         console.log("GROS");
//     }

// });


// zoom = cy.zoom();

// if (zoom < 0.5) {
//     console.log("PETIT");
// }
// else if (zoom > 1) {
//     console.log("GROS");
// }

// document.addEventListener("wheel", myFunction);

// function myFunction() {
//     console.log("use mouse");

//     zoom = cy.zoom();

//     if (zoom < 0.05) {
//         console.log("PETIT");
//     }
//     else if (zoom > 0.05) {
//         console.log("GROS");
//     }
// }


    
    