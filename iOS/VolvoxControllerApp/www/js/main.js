/* Your code starts here */

// GLOBAL FOR CLIENT =================================//
var CLIENT = {
    session_id: '',
    server_address: 'http://localhost:8080',
    page_id: '',
    screen_id: 1,
    favorites: []
};
//====================================================//

var app = app || {};

app.main = (function() {
    var dataFromServer = {};
    var _compiled;
    var _template;
    var _objData;
    var init = function() {
        // app starts running here
        // attach fastClick
        FastClick.attach(document.body);
        // init localStorage
        initLS();
        // init session id
        CLIENT.session_id = generateUUID();
        attachEvents();
        // Call server
        initServerCall();
        // re-route to default page: locations
        window.location.hash = '/cities';
        hashListener();
    };

    var initLS = function() {
        if (localStorage['app'] === undefined) { // if app is initiated for the first time
            // pull from localStorage
            localStorage['app'] = JSON.stringify(CLIENT);
        } else {

        }
    };

    var initServerCall = function() {
        $.get(CLIENT.server_address + '/init', function(d) {
            if (d.length > 0) {
                app.main.dataFromServer = d;
                $(window).trigger('getDataSuccess');
            }
        });
    };

    var hashListener = function() {
        routie({
            // all locations
            '/cities': function() {
                console.log('Page: cities');
                CLIENT.page_id = 'allLocation';
                render({
                    tpl: 'tpl-list-locations',
                    page: 'locations',
                    header: 'Locations'
                }, function() { // callback
                    // console.log(app.main.dataFromServer);
                    app.main._compiled = _.template(app.main._template, {
                        header_title: app.main._objData.header,
                        list_locations: app.main.dataFromServer
                    });
                    $('#view').html(app.main._compiled);
                });
            },
            '/cities/:city': function(city) {
                // show list of properties in that city
                console.log('Page: ' + city);
                CLIENT.page_id = app.main.dataFromServer[getIndexByName(city)].id;
                render({
                    tpl: 'tpl-list-props',
                    header: city,
                    page: city, // ex: south florida
                    back: true
                }, function() {
                    app.main._compiled = _.template(app.main._template, {
                        current_hash: window.location.hash,
                        header_title: app.main._objData.header,
                        list_properties: app.main.dataFromServer[getIndexByName(city)].properties
                    });
                    $('#view').html(app.main._compiled);
                });
            },
            '/cities/:city/:property': function(city, property) {
                // show detail page of property
                console.log('Page: ' + property);
                var cityIndex = getIndexByName(city);
                var propertyIndex = getIndexByNameProp(cityIndex, property);
                CLIENT.page_id = app.main.dataFromServer[cityIndex].properties[propertyIndex].id;
                render({
                    tpl: 'tpl-prop-detail',
                    header: property,
                    page: property, // ex: Park Grove
                    back: true
                }, function() {
                    app.main._compiled = _.template(app.main._template, {
                        header_title: app.main._objData.header,
                        img: app.main.dataFromServer[cityIndex].properties[propertyIndex].img,
                        note: ''
                    });
                    $('#view').html(app.main._compiled);
                });
            },
            '/share': function() {
                console.log('Page: /share');
                render({
                    tpl: 'tpl-share',
                    header: 'Share',
                    page: 'share',
                    back: true
                });
            }
        });
    };

    var render = function(obj, callback) {
        // send information to server
        $.post(CLIENT.server_address + '/update', CLIENT, function(e) {
            // console.log(e);
            $(window).on('ajaxSuccess', function() {
                console.log('-----ajax Success');
                $(this).off('ajaxSuccess');
                app.main._objData = obj;
                app.main._template = $('#' + obj.tpl).html();
                if (callback !== undefined) {
                    callback();
                }
            });

            attachEvents();
        });
    };

    var attachEvents = function() {
        console.log('attaching events');
        $(window).off('getDataSuccess').on('getDataSuccess', function() {
            console.log('Page: cities');
            CLIENT.page_id = 'allLocation';
            render({
                tpl: 'tpl-list-locations',
                page: 'locations',
                header: 'Locations'
            }, function() { // callback
                // console.log(app.main.dataFromServer);
                app.main._compiled = _.template(app.main._template, {
                    header_title: app.main._objData.header,
                    list_locations: app.main.dataFromServer
                });
                $('#view').html(app.main._compiled);
            });
        });
        // off().on() every time REMEMBER?
        $('.page')
            .off('webkitTransitionEnd')
            .one('webkitTransitionEnd', function() {
                $(this).addClass('end');
            });
        $('.end')
            .off('webkitTransitionEnd')
            .one('webkitTransitionEnd', function() {
                $(this).remove();
            });
    };

    return {
        init: init,
        dataFromServer: dataFromServer,
        initServerCall: initServerCall,
        _compiled: _compiled,
        _template: _template,
        _objData: _objData
    };
})();

// Initiate
if ($.os.ios) {
    $(document).on('deviceready', app.main.init);
} else {
    app.main.init();
}

// helpers

function getIndexByName(cityname) {
    // console.log(cityname);
    var i;
    app.main.dataFromServer.forEach(function(item, index) {
        if (item.name === cityname) {
            i = index;
            // console.log(i);
            // return i;
        }
    });
    return i;
}

function getIndexByNameProp(index, propname) {
    var i;
    app.main.dataFromServer[index].properties.forEach(function(item, index) {
        if(item.name === propname) {
            i = index;
        }
    });
    return i;
}

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
};