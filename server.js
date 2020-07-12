// server.js
var express = require("express");
var socket = require("socket.io");

var app = express();

var port = 3000;

var server = app.listen(port, function () {
    console.log("Listening at http://localhost: " + port);
});

app.use(express.static("public"));

var sock = socket(server);

sock.on("connection", function (socket) {
    console.log("made connection with socket " + socket.id);
    socket.on("chat", function (data) {
        sock.sockets.emit("chat", data);
    });

    socket.on("typing", function (data) {
        // send an event to everyone but the person who emitted the typing event to the server
        socket.broadcast.emit("typing", data);
    });
});