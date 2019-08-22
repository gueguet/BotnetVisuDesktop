// FLOW DATA WITH CYTOSCAPE FRAMWORK
// CIRCLE DISTRIBUTION 

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
                'font-size': '50px'
            }
        },

        {
            selector: 'edge',
            style: {
                'label': 'data(label)',
                'font-size': '100px',
                "curve-style": "bezier",
                'control-point-step-size': 200,
                "edge-text-rotation": "autorotate",
            }
        },

    ],

    wheelSensitivity: 0.1,

});

// var to store our data the first time we load them
var flow_data;



// ------------------------ GET JSON FROM SERVER / STORE IT ---------------------------
$(document).ready(function(){

    // init time slider
    $('.slider-time').html('00:00');
    $('.slider-time2').html('01:00');

    $("#get_data").click(function(){

        console.log("YO")

        // global var
        var get_time_1 = $('.slider-time').text();
        var get_time_2 = $('.slider-time2').text();

        // zoom animation
        cy.animate({
            pan: { x: 550, y: 380 },
            zoom : 0.02511886431509579
        }, {
            duration: 1500
        });

        // if this is the first time we load our data
        if (flow_data == undefined) {
            // get JSON data, routes from the server
            $.getJSON("/monkey", function(result){

                flow_data = result;


                // nodes for SRC_IP
                var range_src_ip = 0;
                for (srcIP of result.src_ip) {
                    cy.add({
                        data: { id: srcIP,
                                label: srcIP},
                        position: { x: 1400*range_src_ip, y: 100},
                        style: {
                            height: 200,
                            width: 200,
                            'background-color': '#4788ef',
                            'font-size': '300px',
                            'shape': 'circle',
                            'color': '#4788ef',
                        }
                    });	     
                    range_src_ip ++;
                }

                // dst_IP
                theta = 0;
                R = 14000;

                // node for DST_IP
                for (srcIP of result.dst_ip) {
                    cy.add({
                        data: { id: srcIP,
                                label: srcIP},
                        position: { x: 2600 + (R*Math.cos(theta)), y: 100 + (R*Math.sin(theta))},
                            style: {
                                height: 200,
                                width: 200,
                                'background-color': '#5c53ba',
                                'font-size': '300px',
                                'shape': 'circle',
                                'color': '#5c53ba',
                            }
                    });	
                    theta = theta + 0.19; // 2*pi divided by nunmber of dstip
                }

                ind_routes = 0;

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
                    if (extract_time > get_time_1 && extract_time < get_time_2) {

                        console.log(route);

                        // create edges and classify according to the protocol TCP
                        if (route[4] == "TCP") {
                            cy.add({
                                data: {
                                    'source': route[0],
                                    'target': route[1],
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
        
                        if (route[4] == "UDP") {
                            cy.add({
                                data: {
                                    source: route[0],
                                    target: route[1],
                                    label: route[4] + ' / ' + 'Dst Port : ' + route[3] + ' / ' + route[5] + ' bytes',
                                    'duration':route[6],
                                    'emission_time':route[7],
                                    'ind': ind_routes,
                                },
                                style: {
                                    'line-color':'#4bd85e',
                                    'color': 'grey',
                                    'width': (route[5]/5000) + 'px',
                                }
                            });
                        }                
                    }

                    ind_routes = ind_routes + 1;

                    // for each route we will add a bool false --> not malicious for now
                    route.push(false);

                }

            });
        }

        // if we already have the data and set some malicious edges
        else {

            result = flow_data;

            // nodes for SRC_IP
            var range_src_ip = 0;
            for (srcIP of result.src_ip) {
                cy.add({
                    data: { id: srcIP,
                            label: srcIP},
                    position: { x: 1400*range_src_ip, y: 100},
                    style: {
                        height: 200,
                        width: 200,
                        'background-color': '#4788ef',
                        'font-size': '300px',
                        'shape': 'circle',
                        'color': '#4788ef',
                    }
                });	     
                range_src_ip ++;
            }

            // dst_IP
            theta = 0;
            R = 14000;

            // node for DST_IP
            for (srcIP of result.dst_ip) {
                cy.add({
                    data: { id: srcIP,
                            label: srcIP},
                    position: { x: 2600 + (R*Math.cos(theta)), y: 100 + (R*Math.sin(theta))},
                        style: {
                            height: 200,
                            width: 200,
                            'background-color': '#5c53ba',
                            'font-size': '300px',
                            'shape': 'circle',
                            'color': '#5c53ba',
                        }
                });	
                theta = theta + 0.19; // 2*pi divided by nunmber of dstip
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
                if (extract_time > get_time_1 && extract_time < get_time_2) {

                    console.log(route);

                    // non malicious edge --> grey
                    if (route[8] == false) {
                        // create edges and classify according to the protocol TCP
                        if (route[4] == "TCP") {
                            cy.add({
                                data: {
                                    'source': route[0],
                                    'target': route[1],
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
        
                        if (route[4] == "UDP") {
                            cy.add({
                                data: {
                                    'source': route[0],
                                    'target': route[1],
                                    'label': route[4] + ' / ' + 'Dst Port : ' + route[3] + ' / ' + route[5] + ' bytes',
                                    'duration':route[6],
                                    'emission_time':route[7],
                                    'ind': ind_routes,
                                },
                                style: {
                                    'line-color':'#4bd85e',
                                    'color': 'grey',
                                    'width': (route[5]/5000) + 'px',
                                }
                            });
                        }                
                    }

                    else {
                        if (route[4] == "TCP") {
                            cy.add({
                                data: {
                                    'source': route[0],
                                    'target': route[1],
                                    'label': route[4] + ' / ' + 'Dst Port : ' + route[3] + ' / ' + route[5] + ' bytes',
                                    'duration':route[6],
                                    'emission_time':route[7],
                                    'ind': ind_routes,
                                },
                                style: {
                                    'line-color':'red',
                                    'color': 'black',
                                    'width':(route[5]/5000) + 'px',
                                }
                            });
                        }
        
                        if (route[4] == "UDP") {
                            cy.add({
                                data: {
                                    source: route[0],
                                    target: route[1],
                                    label: route[4] + ' / ' + 'Dst Port : ' + route[3] + ' / ' + route[5] + ' bytes',
                                    'duration':route[6],
                                    'emission_time':route[7],
                                    'ind': ind_routes,
                                },
                                style: {
                                    'line-color':'red',
                                    'color': 'black',
                                    'width': (route[5]/5000) + 'px',
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

        // console.log(cy.zoom());

        // console.log("position du noeud touche : "); 
        // console.log(this.position());

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
                    'height': '1000',
                    'width': '1000',
                    'font-size': '400px',
                    'shape': 'hexagon',
                },
            })
  
            // place all the connected nodes to see flows correctly
            connected_node.forEach(function (node, i) {
                node.position().x = 40000;

                if (connected_node.length > 1) {
                    node.position().y = -10000 + (i * (20000/(connected_node.length-1)));
                } else {
                    node.position().y = 0;
                }
                node.animate({
                    style: {
                        'height': '1000',
                        'width': '1000',
                        'font-size': '400px',
                        'shape': 'hexagon',
                    },
                });  
            });

            // change the position of the node we clicked
            this.position().x = 60000;
            this.position().y = 100;

            // zoom on the node we clicked
            cy.animate({
                pan: { x: -800, y: 380 },
                zoom : 0.03
            }, {
                duration: 500
            });


            // change display of connected edges
            this.connectedEdges().animate({
                style: {
                    'font-size': '300px',
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
                    'height': 200,
                    'width': 200, 
                    'font-size': '300px',
                },
            })

            this.position().x = previous_pose_x;
            this.position().y = previous_pose_y;
    
            this.connectedEdges().animate({
                style: {
                    'font-size': '100px',
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
                        'height':'200',
                        'width':'200',
                        'font-size': '300px',
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
                pan: { x: 550, y: 380 },
                zoom : 0.02511886431509579
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
                    'font-size': '400px',
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
                    'font-size': '400px',
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
                    'font-size': '100px',
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
                    'font-size': '100px',
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
        flow_data.routes[current_edge.data().ind][8] = true;


        // console.log(current_edge.data().emission_time);

        my_time_string = current_edge.data().emission_time;

        var my_extract_time;

        if (my_time_string[my_time_string.length - 5] == ' ') {
            var my_extract_time = '0' + my_time_string.substr(my_time_string.length - 4);    
        } 
        else {
            var my_extract_time = my_time_string.substr(my_time_string.length - 5);
        }

        // console.log("ny extract time");
        // console.log(my_extract_time);


        var my_hours = parseFloat(my_extract_time.substr(0,2));
        var my_min = parseFloat(my_extract_time.substr(3,5));

        total = my_hours *60 + my_min;
        total_percent = (total / 1440) * 100;

        console.log(total_percent + ' %');

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

        console.log(testDiv);
        console.log(testDiv.style);
        

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



    
    