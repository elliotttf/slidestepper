var pass = 'unasfe'; // TODO
var io = require('socket.io').listen(3000);

io.sockets.on('connection', function(socket) {
  socket.emit('connected');
  console.log('yo dawg!');

  socket.on('authenticate', function(auth) {
    if (auth === pass) {
      socket.emit('authenticated', ':)');

      socket.on('navigateTo', function(command) {
        socket.broadcast.emit('navigateTo', command);
      });
    }
  });
});
