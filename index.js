// ==========
// Stella Polaris
// Raspberry Pi Node Application
//
// By Jordan Shaw
// Lib reference
// https://www.npmjs.com/package/ws#sending-and-receiving-text-data
// 
// 
// ===================

const WebSocket = require('ws');
const async = require('async');
const noble = require('noble');

const allowDuplicates = true;
// const serviceUUIDs = [];
const serviceUUIDs = ["1800"];

// Noble BLE Services
noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
      noble.startScanning(serviceUUIDs, allowDuplicates, callbackHandler);
  } else {
    noble.stopScanning();
  }
});

function callbackHandler(error){
  console.log("Error Handler", arguments);
  console.log("Error Error", error);

}


// WebSocket Code
// const wss = new WebSocket.Server({ path: 'john', port: 8080 });
// const wss = new WebSocket.Server({ host: 'ws://localhost', path: 'john', port: 8080 });
const wss = new WebSocket.Server({path: '/john', port: 8080 });

var _ws = null;

console.log(wss.address());

// var that = this;
 
wss.on('connection', function connection(ws, req) {
  const ip = req.connection.remoteAddress;
  console.log("ip: ", ip);

  _ws = ws;

  console.log("ws: ", ws);
  console.log("_ws: ",_ws);

  // this.initNoble(ws);
  // this.initNoble();

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws.send(message + " -- new message!");
  });
 
  ws.send('something');
});

wss.on('error', function connection(ws, req) {
    // check if still active connection
    //
});

wss.on('close', function connection(ws, req) {
    // need to do a reconnection
    //
});

initNoble();

// function initNoble(ws){
function initNoble(){


  noble.on('discover', function(peripheral) {
    // if (peripheral.id === peripheralIdOrAddress || peripheral.address === peripheralIdOrAddress) {
      
      // Don't only find the first item...
      // Do this constantly over and over!
      // ============
      // noble.stopScanning();

      console.log('peripheral with ID ' + peripheral.id + ' found');
      var advertisement = peripheral.advertisement;

      console.log('peripheral: ' + peripheral + ' found');
      console.log('advertisement: ' + advertisement + ' found');
      

      var localName = advertisement.localName;
      var txPowerLevel = advertisement.txPowerLevel;
      var manufacturerData = advertisement.manufacturerData;
      var serviceData = advertisement.serviceData;
      var serviceUuids = advertisement.serviceUuids;
      var rssi = peripheral.rssi;

      if (localName) {
        console.log('  Local Name        = ' + localName);
      }

      if (txPowerLevel) {
        console.log('  TX Power Level    = ' + txPowerLevel);
      }

      if (manufacturerData) {
        console.log('  Manufacturer Data = ' + manufacturerData.toString('hex'));
      }

      if (serviceData) {
        console.log('  Service Data      = ' + JSON.stringify(serviceData, null, 2));
      }

      if (serviceUuids) {
        console.log('  Service UUIDs     = ' + serviceUuids);
      }

      if (rssi) {
        console.log('  Service rssi     = ' + rssi);
      }

      // sendThroughWebSocket(_ws, rssi);
        if (_ws !== null) {
          console.log("GOOD _ws: ", _ws);
          _ws.send(rssi);
        } else {
          console.log("BAD _ws: NO CONNECTION");
        }

      console.log();

      //explore(peripheral);
      console.log("=================================");
      console.log("=================================");
      console.log("=================================");
    // }
  });

  function sendThroughWebSocket(ws, data){

    ws.send(data);

  }

}



