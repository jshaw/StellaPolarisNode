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

const DEBUG = false;

var _ = require('lodash');
const WebSocket = require('ws');
const async = require('async');
const noble = require('noble');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
const setIntervalPromise = util.promisify(setInterval);
const clearPeriferalLastSeenPromise = util.promisify(clearPeriferalLastSeen);

const allowDuplicates = true;

let serviceUUIDs;

if(DEBUG == true){
  serviceUUIDs = ["1800"];
} else {
  serviceUUIDs = [];
}

var timeoutID;
var save_cache = true;
var sendID;
var send_discoveries = false;
var globalCounter = 0;

var deviceCount = 0;

var ble_cache = [];
var discoveries = [];

// WebSocket Code
// const wss = new WebSocket.Server({ path: 'john', port: 8080 });
// const wss = new WebSocket.Server({ host: 'ws://localhost', path: 'john', port: 8080 });
const wss = new WebSocket.Server({path: '/stella', port: 8080 });
var _ws = null;
let wsConnection = false;

// init Noble BLE 
initNoble();

console.log(wss.address());

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

delayedAlert();

function delayedAlert() {

  // 10000
  // 
  // update back to 15000
  timeoutID = setTimeoutPromise(5000, 'foobar').then((value) => {

    save_cache = false;
    clearAlert();
    sendDiscoveriesTimer();

    console.log("ble_cache");
    console.log("====================");
    console.log(ble_cache);
    console.log("====================");


  })
  .catch((error) => {
    // Handle the error.
    console.log("delayedAlert ERROR");
  });
}

function sendDiscoveriesTimer(){

  console.log("WE EVER GET HERE?????");

  // sendID = setIntervalPromise(5000, 'foobar').then((value) => {
  sendID = setTimeoutPromise(500, 'foo').then((value2) => {

    console.log("setIntervalPromise: ", value2);
    console.log("discoveries: ", discoveries);

    clearPeriferalLastSeenPromise(discoveries).then((active_value) => {
      console.log("Arguments", arguments);
      console.log("active_value", active_value);
      // console.log("====================");
      // console.log("RETURNED FILTER", tmp_obj_v2);
      console.log("====================");
      console.log("====================");

      if(DEBUG == false){
        if(wsConnection == true){
          // _ws.send(active_value);
          _ws.send(JSON.stringify(active_value));
        }
      } else {

      }

    })
    .catch((error) => {
      // Handle the error.
      console.log("sendDiscoveriesTimer ERROR");
    });

    // Clear and re-set the timeout counter
    clearTimeout(sendID);
    sendDiscoveriesTimer();

  })
  .catch((error) => {
    // Handle the error.
    console.log("setIntervalPromise ERROR");
  });

}

// function clearPeriferalLastSeen(_discoveries, callback){
//   _.each(_discoveries, function(val, index){

//     // if last seen was 30 seconds ago
//     // set it as inactive
//     // maybe we'll remove this from the object
//     // unsure at the moment
//     if(globalCounter - val.lastSeen > 30000){
//       val.active = false;
//     }

//   });

//   let tmp_objects = _.cloneDeep(discoveries);

//   // _.filter(tmp_objects, function(o) { 
//   //   return !o.active; 
//   // });

//   let tmp_obj_v2 = _.every(tmp_objects, ['active', true]);
  
//   return tmp_obj_v2;

// }

function clearPeriferalLastSeen(_discoveries, callback){
  // console.log("arguments", arguments);
  console.log("clearPeriferalLastSeen _discoveries", _discoveries);

  _.each(_discoveries, function(val, key){

    // if last seen was 30 seconds ago
    // set it as inactive
    // maybe we'll remove this from the object
    // unsure at the moment
    if(globalCounter - val.lastSeen > 30000){
      val.active = false;
    }

  });

  // let tmp_objects = _.cloneDeep(_discoveries);
  // console.log("tmp_objects: ", tmp_objects);

  // let tmp_obj_v2 = _.filter(tmp_objects, function(val){ return val.active});
  let tmp_obj_v2 = _.filter(_discoveries, function(val){ return val.active});
  console.log("tmp_obj_v2: ", tmp_obj_v2);

  callback(null, tmp_obj_v2);
};

function clearAlert() {
  clearTimeout(timeoutID);
}
 
wss.on('connection', function connection(ws, req) {
  const ip = req.connection.remoteAddress;
  console.log("ip: ", ip);
  wsConnection = true;

  _ws = ws;

  // console.log("ws: ", ws);
  // console.log("_ws: ",_ws);

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

    wsConnection = false;
});


// sets script global counter
setInterval(function() {

    globalCounter += 200;

}, 200);


// function initNoble(ws){
function initNoble(){


  noble.on('discover', function(peripheral) {

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



    // TODO:
    // TODO:
    // TODO:
    // TODO:
    // TODO: There is a bug here with the discovered and last seen values and how this is scoped
    // to this area... and for the non-debug below it's a bit different.
    // it needs to be figured out in a bit better way.
    // but in the mean time dealing with the BLE devices and getting everything 
    // working with the correct data structure...
    // this is ok for now...
    var tmp_obj = {
      deviceUID: "_"+deviceCount,
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

    // sendThroughWebSocket(_ws, rssi);
    if (_ws !== null) {
      // console.log("GOOD _ws: ", _ws);

      if(DEBUG == true){
        // _ws.send(rssi);
        // _ws.send(tmp_obj);
        discoveries[0] = tmp_obj;
        _ws.send(JSON.stringify(discoveries));
        
      } else {

        // this happens in the send Discoveries interval function
        // _ws.send();
      }

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

      // Check to see if it's in the cache
      if(_.indexOf(ble_cache, mfd) == -1){
        // Checks to see if the device is in the discovery object

        var find_index = _.findIndex(discoveries, function(o) { 
          return o.mfd == mfd; 
        });

        if(find_index >= 0){

          // do update here for the current rssi values
          // update the object's rssi periferal
          // update last seen for garbage cleaning at end of script

          console.log("TO USE: HAS THIS PERIFERAL IN TO USE LIST");
          
          discoveries[find_index].rssi = rssi;
          discoveries[find_index].lastSeen = globalCounter;

          console.log("IN DISCOVER || discoveries: ", discoveries);
          console.log(" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

        } else {
          // add peripheral to the discoveries ID'd under the MFD
          deviceCount++;

          var tmp_obj = {
            deviceUID: "_"+deviceCount,
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

          discoveries.push(tmp_obj);

        }

      }

    }


    console.log();

    console.log("=================================");
    console.log("=================================");
    console.log("=================================");
    
  });

  function sendThroughWebSocket(ws, data){

    ws.send(data);

  }

}
