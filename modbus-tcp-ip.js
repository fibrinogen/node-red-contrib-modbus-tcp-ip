const modbus = require("./module/modbus-stream/lib/modbus");

let connection;
let getModbusConnection = (ip, port) => {
    return new Promise((resolve, reject) => {
        modbus.tcp.connect(port, ip, {
            debug: null,
            connectTimeout: 3000
        }, (err, connection) => {
            if (!err) resolve(connection);
            else reject(err)
        })
    })
}

let startTime, endTime;

function start() {
    startTime = new Date();
};

function end() {
    endTime = new Date();
    let timeDiff = endTime - startTime;
    timeDiff /= 1;
    let seconds = Math.round(timeDiff);
    return seconds;
}

module.exports = function (RED) {
    function ModbusTcpIpNode(config) {
        RED.nodes.createNode(this, config);
        this.ip = config.ip;
        this.port = config.port;
        this.logerror = config.logerror;
        var node = this;
        node.on('input', async function (msg, send, done) {
            msg = msg;
            msg.payload = msg.payload;
            msg.ip = node.ip ? node.ip : msg.payload.modbus_ip;
            msg.port = node.port ? parseInt(node.port) : parseInt(msg.payload.modbus_port);

            if(!msg.ip || !msg.port) 
                done("Invaid Modbus IP or PORT");
            if (!msg.payload.address && msg.payload.address !== 0) 
                done("Invaid Modbus Address");
            if (!msg.payload.quantity)
                done("Invaid Modbus Quantity");
            if (!msg.payload.unitid)
                done("Invaid Modbus Unit ID");
            
            try {
                node.status({
                    fill: "yellow",
                    shape: "dot",
                    text: "Connecting to MODBUS TCP/IP"
                });
                connection = await getModbusConnection(msg.ip , msg.port);
                // node.log("Connection Established");
                connection.on('error', (err) => {
                    node.log(`Re-Connecting to ${node.ip}:${node.port}`);
                });
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: "Connection Established"
                });
            } catch (err) {
                if(node.logerror) node.error(err, err.message);
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: "Connection Error"
                })
                done();
            }

            if (connection) {
                start();
                node.status({
                    fill: "yellow",
                    shape: "dot",
                    text: "Sending Request"
                })

                let responseCallBack = (err, res) => {
                    if (!err) {
                        node.status({
                            fill: "green",
                            shape: "dot",
                            text: "Response Received " + end() + " ms"
                        })
                        msg.responseBuffer = {};
                        msg.responseBuffer.buffer = Buffer.concat(res.response.data);
                        connection.close(() => {
                            node.log("Connection closed");
                        });
                        send(msg);
                        done();
                    } else {
                        node.status({
                            fill: "red",
                            shape: "dot",
                            text: "Error Getting Response"
                        })
                        if(node.logerror) node.error(err, err.message)
                        connection.close(() => {
                            node.log("Connection closed");
                        });
                        done();
                    }
                }

                if (msg.payload.functioncode == 1) {
                    connection.readCoils({
                        address: msg.payload.address,
                        quantity: msg.payload.quantity,
                        extra: {
                            unitId: msg.payload.unitid
                        }
                    }, responseCallBack)
                } else if (msg.payload.functioncode == 2) {
                    connection.readDiscreteInputs({
                        address: msg.payload.address,
                        quantity: msg.payload.quantity,
                        extra: {
                            unitId: msg.payload.unitid
                        }
                    }, responseCallBack)
                } else if (msg.payload.functioncode == 3) {
                    connection.readHoldingRegisters({
                        address: msg.payload.address,
                        quantity: msg.payload.quantity,
                        extra: {
                            unitId: msg.payload.unitid
                        }
                    }, responseCallBack)
                } else if (msg.payload.functioncode == 4) {
                    connection.readInputRegisters({
                        address: msg.payload.address,
                        quantity: msg.payload.quantity,
                        extra: {
                            unitId: msg.payload.unitid
                        }
                    }, responseCallBack)
                }
            }           
        });
    }
    RED.nodes.registerType("modbus-tcp-ip", ModbusTcpIpNode);
}