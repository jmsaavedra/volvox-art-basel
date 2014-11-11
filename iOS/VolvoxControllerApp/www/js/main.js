/* Your code starts here */

// GLOBAL FOR CLIENT =================================//
var CLIENT = {
    session_id: '',
    server_address: 'http://localhost:8080',
    page_id: '',
    img_id: '',
    img_direction: '',
    screen_id: 1,
    favorites: []
};
//====================================================//

var app = app || {};
app.title = 'Douglas Elliman';
// PHONEGAP ////////////////////////////////////////////////////
app.phonegap = (function() {
    var init = function() {
        // replace alert
        window.alert = function(message, cb) {
            // console.log('alert');
            if (navigator.notification) {
                navigator.notification.alert(message, cb(), app.title, 'OK');
            } else {
                alert(app.title ? (app.title + ": " + message) : message);
            }
        };
        // replace prompt
        window.prompt = function(message, cb, defaultText) {
            if (navigator.notification) {
                navigator.notification.prompt(message, cb, app.title, ['OK'], defaultText);
            } else {
                // prompt(app.title ? (app.title + ": " + message) : message);
            }
        };
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
            'buttonLabels': [screenCheck(1), screenCheck(2), 'Change Server Address', 'Reset App'],
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
                    alert('App restarted.', function() {
                        CLIENT.favorites = [];
                        app.main.updateLS();
                        window.location.reload();
                        // localStorage.clear();
                    });
                } else if (buttonIndex === 4) {
                    prompt('Input new server address below.', function(results) {
                        CLIENT.server_address = results.input1;
                        app.main.updateLS();
                        // save to localstorage
                    }, CLIENT.server_address);
                } else if (buttonIndex === 5) {
                    localStorage.clear();
                    alert('App reset. Cache cleared.', function() {
                        window.location.reload();
                    });
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

///// MAIN ///////

app.main = (function() {
    var dataFromServer = {};
    var _compiled;
    var _template;
    var _objData;
    var init = function() {
        console.log('APP INIT!');
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
                // alert('ok!', function() {});
                app.main.dataFromServer = d;
                $(window).trigger('getDataSuccess');
            } else {
                // alert('Could not connect to the server. Hit OK to restart.', function() {
                //     window.location.reload();
                // });
                // alert('not ok!', function() {});
                prompt('Could not connect to the server. Please correct the server address.', function(results) {
                    CLIENT.server_address = results.input1;
                    app.main.updateLS();
                    alert('App will now reload.', function() {
                        window.location.reload();
                    });
                    // save to localstorage
                }, CLIENT.server_address);
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
                    var img_init_index = 0;
                    $('.slick_carousel').slick({
                        infinite: false,
                        accessibility: true,
                        autoplay: false,
                        dots: true,
                        onAfterChange: function(i, index) {
                            // console.log(i, index);
                            if (index > img_init_index) {
                                CLIENT.img_direction = 'right';
                                console.log('right');
                            } else if (index < img_init_index) {
                                CLIENT.img_direction = 'left';
                                console.log('left');
                            }
                            $.post(CLIENT.server_address + '/update', CLIENT, function(e) {});
                            img_init_index = index;
                        }
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
                        header_title: app.main._objData.header,
                        fav_list: getFavList(CLIENT.favorites)
                    });
                    $('#view').html(app.main._compiled);
                });
            },
            '/about': function() {
                console.log('Page: /about');
                render({
                    tpl: 'tpl-about',
                    header: 'About',
                    page: 'about',
                    back: true
                }, function() {
                    app.main._compiled = _.template(app.main._template, {
                        back: true,
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
                CLIENT.favorites.splice(CLIENT.favorites.indexOf(CLIENT.page_id), 1);
            } else {
                // add faved
                that.addClass('faved');
                CLIENT.favorites.push(CLIENT.page_id);
                CLIENT.favorites = _.unique(CLIENT.favorites);
            }
            app.main.updateLS();
            // post update
            $.post(CLIENT.server_address + '/update', CLIENT, function(e) {});
        });

        // share
        $('#share_submit').off('click').on('click', function() {
            var dataToSend = {
                firstName: $('#share_first_name').val(),
                lastName: $('#share_last_name').val(),
                email: $('#share_email').val(),
                favorites: CLIENT.favorites
            };
            $.ajax({
                url: CLIENT.server_address + '/share',
                dataType: 'json',
                method: 'POST',
                data: dataToSend,
                success: function() {
                    alert('Information sent. App restarted.', function() {
                        // clear fav
                        CLIENT.favorites = [];
                        app.main.updateLS();
                        window.location.reload();
                        // localStorage.clear();
                    });
                },
                error: function() {
                    alert('Information sent. App restarted.', function() {
                        // clear fav
                        CLIENT.favorites = [];
                        app.main.updateLS();
                        window.location.reload();
                        // localStorage.clear();
                    });
                }
            });
        });

        // share fav delete
        $('.fav_delete').off('click').on('click', function() {
            var idToRemove = $(this).parent().attr('data-id');
            $(this).parent().slideUp(function() {
                $(this).remove();
                // remove from CLIENT.favorites
                CLIENT.favorites.splice(CLIENT.favorites.indexOf(idToRemove), 1);
                app.main.updateLS();
            });
        });

        // action sheet
        $('footer .left').off('click').on('click', function() {
            app.phonegap.actionSheet();
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

// helpers ////////////////////////////////////////////////////

function getFavList(list) {
    var arr = [];
    app.main.dataFromServer.forEach(function(city) {
        city.properties.forEach(function(prop, index) {
            list.forEach(function(fav) {
                if (prop.id === fav) {
                    arr.push({
                        id: prop.id,
                        name: prop.name
                    });
                }
            });
        });
    });
    console.log(arr);
    return arr;
}

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
}