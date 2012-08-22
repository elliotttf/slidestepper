var flatiron = require('flatiron');
var path = require('path');
var app = flatiron.app;

app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

var io = require('socket.io').listen(3000);

io.sockets.on('connection', function(socket) {
  socket.emit('connected');

  socket.on('authenticate', function(auth) {
    if (auth === app.config.get('pass')) {
      socket.emit('authenticated', ':)');

      socket.on('navigateTo', function(command) {
        socket.broadcast.emit('navigateTo', command);
      });
    }
  });
});
