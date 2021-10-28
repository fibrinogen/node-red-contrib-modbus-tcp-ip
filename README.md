# node-red-contrib-re-modbus-tcp-ip

Forked from https://github.com/balaji8385/node-red-contrib-modbus-tcp-ip

Version 1.2.0
* Modified error log handling
* Empty port can be saved without error
* Exception can now be cought from catch node
* Added number of retries and retry period in ms
* All parameters can be send as input in the payload

Internal code rework:
* The promise is used to control flow in case a connection could not be established

# Node-RED Modbus TCP Flexi Reader

Connects to a modbus slave and performs modbus read operations via TCP/IP.

## Getting Started

Install the module via npm or directly via node-red. The module will be located in the function block. 
See help for an example.

### Flow
![Flow](https://github.com/fibrinogen/node-red-contrib-modbus-tcp-ip/raw/master/sample/images/flow.png)

### Editing Connection
![Edit Connection](https://github.com/fibrinogen/node-red-contrib-modbus-tcp-ip/raw/master/sample/images/edit.png)

### Injecting Payload
![Input Payload](https://github.com/fibrinogen/node-red-contrib-modbus-tcp-ip/raw/master/sample/images/payload.png)

## Additional Payload Options
You can also send the modbus ip and port along with payload instead of giving it at the input of node. 
The values inside the configuration dialog will be used with higher priority. So you have to empty them if you want to send the parameters as payload.
Eg:
{   
    "unitid":5,  
    "functioncode":3,   
    "address":3000,   
    "quantity":100,   
    "modbus_ip":"192.168.10.31", 
    "modbus_port": 3666,
    "timeout": 100,
    "retries": 0,
    "retry": 100,
    "logerror": true
}

## Authors

* **Balaji L Narayanan** - *Initial work* - [balaji8385](https://github.com/balaji8385)
* **Stefan Bremer** [fibrinogen](https://github.com/fibrinogen)

Makes use of:
* modbus-stream (is included directly to avoid build problems with serial drivers)
* modbus-pdu

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/fibrinogen/node-red-contrib-modbus-tcp-ip/raw/master/LICENSE) file for details
