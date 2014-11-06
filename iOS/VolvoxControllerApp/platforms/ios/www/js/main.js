/* Your code starts here */

var app = app || {};

app.main = (function() {
    var channel = 1;
    var init = function() {
        // app starts running here
        // attach fastClick
        FastClick.attach(document.body);
        // re-route
        window.location.hash = '/locations';
        hashListener();
    };

    var hashListener = function() {
        routie({
            // all locations
            '/locations': function() {
                console.log('Page: locations');
                render(channel, {
                    tpl: 'tpl-locations',
                    header: 'Location'
                });
            },
            '/locations/:place': function(place) {
                console.log('Page: locations/' + place);
                render(channel, {
                    tpl: 'tpl-place',
                    header: place,
                    place: place,
                    back: true
                });
            },
            '/locations/:place/:resort': function(place, resort) {
                console.log('Page: locations/' + place + '/' + resort);
                render(channel, {
                    tpl: 'tpl-resort',
                    header: resort,
                    place: place,
                    resort: resort,
                    back: true
                });
            },
            '/share': function() {

            }
        });
    };

    var render = function(n, obj) {
        //
        var template = $('#' + obj.tpl).html(),
            compiled = _.template(template, {
                header_title: obj.header
            });
        //
        $.ajax({
            url: 'http://apon.local:3000/getLocation',
            data: {
                place: obj.place || null,
                resort: obj.resort || null
            },
            success: function() {
                $('#view').html(compiled);
            },
            error: function() {
                $('#view').html(compiled);
                // alert('ajax error');
            }
        });
        //
        attachEvents();
    };

    var attachEvents = function() {
        console.log('attaching events');
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
        init: init
    };
})();

// Initiate
if($.os.ios) {
    $(document).on('deviceready', app.main.init);
} else {
    app.main.init();
}
