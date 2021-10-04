# Node-RED Modbus TCP Flexi Reader

This package enables the user to read data from the modbus enabled devices through TCP/IP.

## Getting Started

npm install this module and you can find the block. Example node-red code can be found this repo.

### Flow
![Flow](https://github.com/balaji8385/node-red-contrib-modbus-tcp-ip/raw/master/sample/images/flow.png)

### Editing Connection
![Edit Connection](https://github.com/balaji8385/node-red-contrib-modbus-tcp-ip/raw/master/sample/images/edit.png)

### Injecting Payload
![Input Payload](https://github.com/balaji8385/node-red-contrib-modbus-tcp-ip/raw/master/sample/images/payload.png)

## Additioal Payload Options
Also you can send the modbus ip and port along with payload instead of giving it at the input of node. You need to empty the values for ip and port inside the node.
Eg:
{   "unitid":5,  "functioncode":3,   "address":3000,   "quantity":100,   "modbus_ip":"192.168.10.31", "modbus_port": 3666  }

## Authors

* **Balaji L Narayanan** - *Initial work* - [balaji8385](https://github.com/balaji8385)

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/balaji8385/node-red-contrib-modbus-tcp-ip/raw/master/LICENSE) file for details
