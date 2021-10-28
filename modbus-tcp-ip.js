const modbus = require("./module/modbus-stream/lib/modbus");

let connection;
let getModbusConnection = (ip, port, timeout, retries, retry) => {
    return new Promise((resolve, reject) => {
        modbus.tcp.connect(port, ip, {
            debug: null,
            connectTimeout: timeout,
            retries: retries,
            retry: retry
        }, (err, connection) => {
            if (!err) 
                resolve(connection);
            else 
                reject(err)
        })
    })
}

let startTime, endTime;

function startMeasureTime() {
    startTime = new Date();
}

function doMeasureTime() {
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
        this.timeout = config.timeout;
        this.retries = config.retries;
        this.retry = config.retry;
        this.logerror = config.logerror;
        var node = this;
        node.on('input', async function (msg, send, done) {
            msg = msg;
            msg.payload = msg.payload;
            msg.ip = node.ip ? node.ip : msg.payload.modbus_ip;
            msg.address = node.address ? node.address : msg.payload.address;
            msg.quantity = node.quantity ? node.quantity : msg.payload.quantity;
            msg.unitid = node.unitid ? node.unitid : msg.payload.unitid;
            msg.port = node.port ? parseInt(node.port) : parseInt(msg.payload.modbus_port);
            msg.timeout = node.timeout ? parseInt(node.timeout) : parseInt(msg.payload.timeout);
            msg.retries = (node.retries || node.retries == 0) ? parseInt(node.retries) : parseInt(msg.payload.retries);
            msg.retry = node.retry ? parseInt(node.retry) : parseInt(msg.payload.retry);
            msg.logerror = msg.payload.logerror ? msg.payload.logerror : node.logerror;

            if(!msg.ip || !msg.port) {
                done("Invalid modbus IP or PORT");
                return;
            }
            if (!msg.address && msg.address !== 0) {
                done("Invalid modbus address");
                return;
            }
            if (!msg.quantity) {
                done("Invalid modbus quantity");
                return;
            }
            if (!msg.unitid) {
                done("Invalid modbus unit ID");
                return;
            }
            if (!msg.timeout) {
                done("Invalid modbus timeout");
                return;
            }
            if ((!msg.retries && msg.retries != 0) || !msg.retry) {
                done("Invalid modbus number of retries or retry period(ms)");
                return;
            }

            startMeasureTime();
            node.status({
                fill: "yellow",
                shape: "dot",
                text: "Connecting to MODBUS TCP/IP"
            });
            connection = getModbusConnection(msg.ip , msg.port, msg.timeout, msg.retries, msg.retry);

            connection.then (
                function (connection) {
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: "Connection Established " + doMeasureTime() + "ms " + msg.ip + ":" + msg.port
                    });
                    
                    startMeasureTime();

                    let responseCallBack = (err, res) => {
                        if (!err) {
                            node.status({
                                fill: "green",
                                shape: "dot",
                                text: "Response Received " + doMeasureTime() + "ms " + msg.ip + ":" + msg.port
                            })
                            msg.responseBuffer = {};
                            msg.responseBuffer.buffer = Buffer.concat(res.response.data);
                            connection.close(() => {
                                node.log("Connection closed " + msg.ip + ":" + msg.port );
                            });
                            send(msg);
                            done();
                        } else {
                            node.status({
                                fill: "red",
                                shape: "dot",
                                text: "Error Getting Response " + msg.ip + ":" + msg.port
                            })
                            connection.close(() => {
                                node.log("Connection closed " + msg.ip + ":" + msg.port);
                            });

                            if (msg.logerror)
                              done(err);
                            else
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
                },
                function (err) {
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: "Connection Error " + doMeasureTime() + "ms " + msg.ip + ":" + msg.port
                    })
                    node.log("Connection error " + msg.ip + ":" + msg.port );
                    if (msg.logerror)
                      done(err);
                    else
                      done();
                }
            );
        });
    }
    RED.nodes.registerType("modbus-read", ModbusTcpIpNode);
}