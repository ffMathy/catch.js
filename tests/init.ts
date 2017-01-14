var instance = CatchJs.getInstance();
instance.addListener(function(message, url, line, col, error) {
    alert(JSON.stringify(<ErrorModel>{
        type: "error",
        message: message,
        url: url,
        line: line,
        col: col,
        error: error
    }));
});

function simulateClick(id: string) {
    alert(JSON.stringify(<AlertResponse>{
        type: "click",
        targetId: id
    }));
}