var ready = false;
var instance = CatchJs.getInstance();
instance.addListener(function (message, url, line, col, error) {
    alert(JSON.stringify({
        type: "error",
        message: message,
        url: url,
        line: line,
        col: col,
        error: error
    }));
});
function simulateClick(id) {
    alert(JSON.stringify({
        type: "click",
        targetId: id
    }));
}
