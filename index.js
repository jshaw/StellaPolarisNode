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

var _ = require('lodash');
const WebSocket = require('ws');
const async = require('async');
const noble = require('noble');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
const setTimeoutInterval = util.promisify(setInterval);

const allowDuplicates = true;
const serviceUUIDs = [];
// const serviceUUIDs = ["1800"];

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

var timeoutID;
var save_cache = true;
var sendID;
var send_discoveries = false;
var globalCounter = 0;

var deviceCount = 0;


delayedAlert();


// var ble_cache = {};
var ble_cache = [];
var discoveries = [];

// const setTimeoutPromise = util.promisify(setTimeout);

// clearInterval

// setTimeoutPromise(40, 'foobar').then((value) => {
//   // value === 'foobar' (passing values is optional)
//   // This is executed after about 40 milliseconds.
// });

function delayedAlert() {
  // timeoutID = setTimeout(alert, 15000, timerCallback);
  timeoutID = setTimeoutPromise(15000, 'foobar').then((value) => {


    // console.log("VALUE????", value);

    // // value === 'foobar' (passing values is optional)
    // // This is executed after about 40 milliseconds.


    save_cache = false;
    sendDiscoveriesTimer();
    clearAlert();


    console.log("ble_cache");
    console.log("ble_cache");
    console.log("ble_cache");
    console.log("====================");
    console.log(ble_cache);
    console.log("====================");
    console.log("====================");
    console.log("====================");
    console.log("====================");
    console.log("====================");


  });
}

function sendDiscoveriesTimer(){

    sendID = setIntervalPromise(5000, 'foobar').then((value) => {


    // console.log("VALUE????", value);

    // // value === 'foobar' (passing values is optional)
    // // This is executed after about 40 milliseconds.


    // save_cache = false;
    // clearAlert();


    console.log("ble_cache");
    console.log("ble_cache");
    console.log("ble_cache");
    console.log("====================");
    console.log("SEND DISCOVERIES");
    console.log(discoveries);
    console.log("====================");
    console.log("====================");
    console.log("====================");
    console.log("====================");
    console.log("====================");


  });

  clearPeriferalLastSeen();

}

function clearPeriferalLastSeen(){
  _.each(discoveries, function(val, index){

    // if last seen was 30 seconds ago
    // set it as inactive
    // maybe we'll remove this from the object
    // unsure at the moment
    if(globalCounter - val.lastSeen > 30000){
      val.active = false;
    }

  });

}

// function timerCallback(){
//   save_cache = false;
//   clearAlert();


//   console.log("ble_cache");
//   console.log("ble_cache");
//   console.log("ble_cache");
//   console.log("====================");
//   console.log(ble_cache);
//   console.log("====================");
//   console.log("====================");
//   console.log("====================");
//   console.log("====================");
//   console.log("====================");



// }

function clearAlert() {
  clearTimeout(timeoutID);
}


// init Noble BLE 
initNoble();



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


// sets script global counter
setInterval(function() {

    globalCounter += 200;

}, 200);


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

      // console.log('peripheral: ' + peripheral + ' found');
      // console.log('advertisement: ' + advertisement + ' found');
      

      var localName = advertisement.localName;
      var txPowerLevel = advertisement.txPowerLevel;
      var manufacturerData = advertisement.manufacturerData;
      var serviceData = advertisement.serviceData;
      var serviceUuids = advertisement.serviceUuids;
      var rssi = peripheral.rssi;

      var mfd;

      if (localName) {
        console.log('  Local Name        = ' + localName);
      }

      if (txPowerLevel) {
        console.log('  TX Power Level    = ' + txPowerLevel);
      }

      if (manufacturerData) {
        console.log('  Manufacturer Data = ' + manufacturerData.toString('hex'));
        mfd = manufacturerData.toString('hex');
      }

      // if (serviceData) {
      //   console.log('  Service Data      = ' + JSON.stringify(serviceData, null, 2));
      // }

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


      if(save_cache == true){

        if (mfd != undefined){

          if(_.indexOf(ble_cache, mfd) == -1){
            deviceCount++;
            ble_cache.push(mfd);
          }
        }

      } else {
        // console.log("ble_cache", ble_cache);

        // Check to see if it's in the cache
        if(_.indexOf(ble_cache, mfd) == -1){
          // Checks to see if the device is in the discovery object
          if(_.has(discoveries, mfd)){
            // do update here for the current rssi values

            console.log("TO USE: HAS THIS PERIFERAL IN TO USE LIST");

            discoveries[mfd].rssi = rssi;
            discoveries[mfd].lastSeen = globalCounter;

            console.log("discoveries: ", discoveries);
            console.log(" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
            console.log(" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
            console.log(" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
            console.log(" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
            console.log(" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

            // update the object's rssi periferal
            // update last seen for garbage cleaning at end of script

          } else {
            // add peripheral to the discoveries ID'd under the MFD
            // discoveries[mfd] = peripheral;
            deviceCount++;

            discoveries[mfd] = {
              deviceUID: "_"+device
              deviceCount: deviceCount,
              mfd: mfd,
              uuid: peripheral.uuid,
              localName: localName,
              serviceData: JSON.stringify(serviceData, null, 2),
              serviceUuids: serviceUuids,
              rssi: rssi,
              active: true,
              discovered: globalCounter,
              lastSeen: globalCounter
            };

          }

        }

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



