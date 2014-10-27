cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/nl.sylvain.cordova.osc/www/OSCListener.js",
        "id": "nl.sylvain.cordova.osc.OSCListener",
        "clobbers": [
            "window.OSCListener"
        ]
    },
    {
        "file": "plugins/nl.sylvain.cordova.osc/www/OSCSender.js",
        "id": "nl.sylvain.cordova.osc.OSCSender",
        "clobbers": [
            "window.OSCSender"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "nl.sylvain.cordova.osc": "0.1.0"
}
// BOTTOM OF METADATA
});