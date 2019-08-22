
import os, sys, glob
import json
import cherrypy
from datetime import datetime
import time
import csv
import numpy


class BotnetServer(object):

    def __init__(self):
        self._flow_data = {'routes':[],'dst_ip':[],'src_ip':[], 'substation':[], 'substations_pos':{}}
        self._cities_info = {} # information about IP / cities / lat / lng
        self._detections = {}  # Detection data with time as a key
        self._substations_pos = {} # position of the different substations

    # methode to parse csv to JSON
    def load_flow_csv(self):
        with open('input_data/scadaflow.csv', 'r') as csvFile:
            reader = csv.reader(csvFile)
            for row in reader:
                self._flow_data['routes'].append(row)
                self._flow_data['src_ip'].append(row[0])
                self._flow_data['dst_ip'].append(row[1])
                self._flow_data['substation'].append(row[8])
        csvFile.close()
        self._flow_data['src_ip'] = list(set(self._flow_data['src_ip']))
        self._flow_data['dst_ip'] = list(set(self._flow_data['dst_ip']))
        self._flow_data['substation'] = list(set(self._flow_data['substation']))

    # method to parse csv cities info into server argument
    def load_cities_info(self):
        with open('input_data/IP_with_geo_loc.csv', 'r') as csvFile:
            print("OPEN FILE")
            reader = csv.reader(csvFile)
            for row in reader:
                print (row)
                self._cities_info[row[0]] = [row[1],row[2],row[3]]

    def load_detections(self, filename, ftime):
        with open(filename) as json_file:
            data = json.load(json_file)
            self._detections[ftime] = data

    # read the csv to get the position data of the different substations
    def load_sub_pos(self):
        with open('input_data/substation_position.csv', 'r') as csvFile:
            reader = csv.reader(csvFile)
            for row in reader:
                self._flow_data['substations_pos'][row[0]] = [row[1], row[2]]

    # JSON out - flow data
    @cherrypy.expose    
    @cherrypy.tools.json_out()
    def monkey(self, **params):
        return self._flow_data

    @cherrypy.expose    
    @cherrypy.tools.json_out()
    def cities_info_out(self, **params):
        return self._cities_info

    # Return detection data
    @cherrypy.expose
    @cherrypy.tools.json_out()
    def detectdata(self, dtime):
        return self._detections[dtime]

    # Redirect / URL to botnet example URL
    @cherrypy.expose
    def index(self):
        raise cherrypy.HTTPRedirect("/static/html/botnet.html")


if __name__ == "__main__":

    base_dir = os.path.dirname(os.path.realpath(sys.argv[0]))

    server = BotnetServer()

    detectionArray = glob.glob('input_data/scadaDummyDetections/*.dat')

    for i in detectionArray:
        server.load_detections(i, i[30:-4])

    cities_info = []

    # flow data
    server.load_flow_csv()

    # sub position
    server.load_sub_pos()

    print(server._substations_pos)

    ### CREATE CSV WITH US CITIES INFO ###
    # # read the csv with the US cities information
    # with open('us_cities_info.csv', 'r') as csvfile:
    #     spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
    #     for row in spamreader:
    #         cities_info.append(row)


    # # write a new csv file for each disctinct IP src and dst 
    # with open('IP_with_geo_loc.csv', 'w', newline='') as csvfile:
    #     filewriter = csv.writer(csvfile, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    #     offset_index = len(server._flow_data['src_ip'])

    #     print("number distinct src ip :", len(server._flow_data['src_ip']))
    #     print("number distinct dst ip :", len(server._flow_data['dst_ip']))

    #     for k, v in enumerate(server._flow_data['src_ip']):
    #         # print(k,v)
    #         filewriter.writerow([v,cities_info[k][0],cities_info[k][1],cities_info[k][2]])
    #     for k, v in enumerate(server._flow_data['dst_ip']):
    #         filewriter.writerow([v,cities_info[offset_index + k][0],cities_info[offset_index + k][1],cities_info[offset_index + k][2]])

    # server.load_cities_info()


    

    # Configure CherryPy to serve static data from /static
    conf = {'/static': {'tools.staticdir.on': True,
                        'tools.staticdir.debug': False,
                        'tools.staticdir.dir': os.path.join(os.getcwd(), "static")
                        },
            '/': {'tools.sessions.on': True,
                  'tools.sessions.storage_type': 'ram'
                  }}

    cherrypy.config.update({'server.socket_host': '127.0.0.1', 'server.socket_port': 8686})
    cherrypy.quickstart(server, '/', conf)



    while 1 != 0:
        time.sleep(3600)
        dt = datetime.now()
        now = str(dt.hour) + "-00-00"
        # server.load_flow("SCADA_GUI_Input_Data_Set-master/substation_1_JSON_Stub/192.168.1.10_flow_record_08-31-2017-" + str(now) + "_3600s.dat", now)
        server.load_detections("input_data/SCADA_GUI_Input_Data_Set-master/substation_1_JSON_Stub/detection_08-31-2017-" + str(now) + "_3600s.dat", now)
