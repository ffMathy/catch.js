var instance = CatchJs.getInstance();
instance.addListener(function (message, url, line, col, error) {
    alert(JSON.stringify({
        message: message,
        url: url,
        line: line,
        col: col,
        error: error
    }));
});
