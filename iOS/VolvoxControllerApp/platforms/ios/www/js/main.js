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
app.title = 'Douglas Elliman';

app.main = (function() {
    var dataFromServer = {};
    var _compiled;
    var _template;
    var _objData;
    var init = function() {
        // app starts running here
        app.phonegap.init();
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
            // pull from localStorage
            CLIENT = JSON.parse(localStorage['app']);
        }
    };

    var updateLS = function() {
        console.log('update LS');
        // replacing ['app'] with new CLIENT
        localStorage['app'] = JSON.stringify(CLIENT);
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
                    page: city // ex: south florida
                }, function() {
                    app.main._compiled = _.template(app.main._template, {
                        fav: CLIENT.favorites,
                        back: true,
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
                    page: property // ex: Park Grove
                }, function() {
                    app.main._compiled = _.template(app.main._template, {
                        back: true,
                        fav: getFav(CLIENT.page_id),
                        server_address: CLIENT.server_address,
                        header_title: app.main._objData.header,
                        images: app.main.dataFromServer[cityIndex].properties[propertyIndex].img,
                        info: app.main.dataFromServer[cityIndex].properties[propertyIndex].info
                    });
                    $('#view').html(app.main._compiled);
                    // start slick
                    $('.slick_carousel').slick({
                        infinite: false,
                        accessibility: true,
                        autoplay: false,
                        dots: true
                    });
                });
            },
            '/share': function() {
                console.log('Page: /share');
                render({
                    tpl: 'tpl-share',
                    header: 'Share',
                    page: 'share',
                    back: true
                }, function() {
                    app.main._compiled = _.template(app.main._template, {
                        back: true,
                        server_address: CLIENT.server_address,
                        header_title: app.main._objData.header
                    });
                    $('#view').html(app.main._compiled);
                });
            }
        });
    };

    var render = function(obj, callback) {
        // send information to server
        $.post(CLIENT.server_address + '/update', CLIENT, function(e) {
            // console.log(e);
            $(window).on('ajaxSuccess', function() {
                console.log('-----Update to server Success');
                $(this).off('ajaxSuccess');
                app.main._objData = obj;
                app.main._template = $('#' + obj.tpl).html();
                if (callback !== undefined) {
                    callback();
                    attachEvents();
                }
            });
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
        // back
        $('.backBtn').off('click').on('click', function() {
            window.history.back();
        });

        //fav
        $('.favBtn').off('click').on('click', function() {
            var that = $(this);
            if (that.hasClass('faved')) {
                // remove faved
                that.removeClass('faved');
                // remove from CLIENT.favorites
                CLIENT.favorites.splice(CLIENT.page_id, 1);
            } else {
                // add faved
                that.addClass('faved');
                CLIENT.favorites.push(CLIENT.page_id);
                CLIENT.favorites = _.unique(CLIENT.favorites);
            }
            app.main.updateLS();
        });

        // action sheet
        $('footer .left').off('click').on('click', function() {
            app.phonegap.actionSheet();
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
        _objData: _objData,
        updateLS: updateLS
    };
})();

// Initiate
if (Zepto.os.ios) {
    Zepto(document).on('deviceready', app.main.init);
    // alert('Running on iOS');
} else {
    app.main.init();
}

// PHONEGAP ////////////////////////////////////////////////////
app.phonegap = (function() {
    var init = function() {
        // replace alert
        // window.alert = function(message) {
        //     // console.log('alert');
        //     if (navigator.notification) {
        //         navigator.notification.alert(message, null, app.title, 'Dismiss');
        //     } else {
        //         alert(app.title ? (app.title + ": " + message) : message);
        //     }
        // };
    };
    var actionSheet = function() {
        //
        function screenCheck(n) {
            if (CLIENT.screen_id === n) {
                return 'SCREEN ' + n + ' (Selected)';
            } else {
                return 'SCREEN ' + n;
            }
        }
        var options = {
            title: 'Session: ' + CLIENT.session_id,
            'buttonLabels': [screenCheck(1), screenCheck(2)],
            'addCancelButtonWithLabel': 'Cancel',
            'addDestructiveButtonWithLabel': 'Restart Session'
        };
        var callback = function(buttonIndex) {
            setTimeout(function() {
                // like other Cordova plugins (prompt, confirm) the buttonIndex is 1-based (first button is index 1)
                // alert('button index clicked: ' + buttonIndex);
                if (buttonIndex === 2) {
                    // select screen 1
                    CLIENT.screen_id = 1;
                } else if (buttonIndex === 3) {
                    CLIENT.screen_id = 2;
                } else if (buttonIndex === 1) {
                    window.location.reload();
                }
            });
        };
        window.plugins.actionsheet.show(options, callback);
    };
    return {
        init: init,
        actionSheet: actionSheet
    };
})();

// helpers ////////////////////////////////////////////////////

function getFav(prop_id) {
    console.log('seeking fav', prop_id);
    var t = false;
    CLIENT.favorites.forEach(function(item) {
        if (item === prop_id) {
            t = true;
            console.log('this prop is favorited');
        }
    });
    return t;
}

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
        if (item.name === propname) {
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