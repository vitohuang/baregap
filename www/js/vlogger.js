// A simple logger - todo: organise better
(function() {

}).call(this);

var vLogger = function(display, storage) {
    this.display = display;
    this.storage = storage;
    this.data = [];
}
vLogger.prototype.add = function(msg) {
    var d = new Date();
    this.data.push(d+": "+msg);
    
    this.updateDisplay();
    
    this.storeData();
};

vLogger.prototype.updateDisplay = function() {
    if (this.display && this.data) {
        // Html
        var content = '<ul>';
        this.data.forEach(function(entry) {
           content += '<li>'+entry+'</li>';
        });
        content += '</ul>';
        this.display.html(content);
    }
};

vLogger.prototype.storeData = function() {
    if (this.storage) {
        alert("going to store log data");
    }
}
