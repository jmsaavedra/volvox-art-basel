/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        console.log("hit onDeviceReady");
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        setInterval(function(){
          console.log("hit sendOSC");
            // console.log("hit sendOSC");
            // // setup the remote host to which you want to send messages
            // var remote = window.plugins.osc.createRemoteLocation('192.168.0.123', 11000);
            //
            // // create an empty message with the desired address pattern
            // var msg = window.plugins.osc.createMessage('/address');
            //
            // // add values to your message
            // msg.add(123);        // [i]ntegers, ...
            // msg.add(45.67);      // [f]loats, ...
            // msg.add("foo bar");  // or [s]trings are currently supported.
            //
            // // send the message
            // window.plugins.osc.sendMessage(msg, remote, function() {
            //     console.log('Yay, the message was sent!');
            // }, function() {
            //     console.log('Oops, could not send the message.');
            // });
        }, 5000);

    }

    // sendOsc: function(){
    //
    //     console.log("hit sendOSC");
    //     // setup the remote host to which you want to send messages
    //     var remote = window.plugins.osc.createRemoteLocation('192.168.0.123', 11000);
    //
    //     // create an empty message with the desired address pattern
    //     var msg = window.plugins.osc.createMessage('/address');
    //
    //     // add values to your message
    //     msg.add(123);        // [i]ntegers, ...
    //     msg.add(45.67);      // [f]loats, ...
    //     msg.add("foo bar");  // or [s]trings are currently supported.
    //
    //     // send the message
    //     window.plugins.osc.sendMessage(msg, remote, function() {
    //         console.log('Yay, the message was sent!');
    //     }, function() {
    //         console.log('Oops, could not send the message.');
    //     });
    // }

};
