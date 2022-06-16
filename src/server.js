const { createServer } = require('net');
const { EventEmitter } = require('events');

const broadcast = ({ message, from }, clients) => {
  Object.entries(clients).forEach(([name, socket]) => {
    if (name === from) {
      return;
    }
    socket.write(JSON.stringify({ from, message }));
  });
};

const notifyUsers = (message, clients) => {
  broadcast({ message, from: 'SERVER' }, clients);
};

const identify = ({ name }, clients, socket) => {
  notifyUsers(`${name} joined the room.`, clients);
  clients[name] = socket;
};

const requestHandler = (requestEvents, req, clients, socket) => {
  const request = JSON.parse(req);
  requestEvents.emit(request.type, request.payload, clients, socket);
};

const userLeftEvent = (clients, socket) => {
  const [name] = Object.entries(clients).find(([name, clientSocket]) => {
    return socket === clientSocket;
  });
  notifyUsers(`${name} left the room.`, clients);
};

const handleError = (err) => {
  console.log(err);
};

const main = () => {
  const requestEvents = new EventEmitter();
  const clients = {};
  requestEvents.on('identification', identify);
  requestEvents.on('broadcast', broadcast);

  const server = createServer(socket => {
    socket.setEncoding('utf8');
    socket.on('data',
      (request) => requestHandler(requestEvents, request, clients, socket)
    );
    socket.on('end', () => userLeftEvent(clients, socket));
    socket.on('error', handleError);
  });

  server.listen(4444);
};

main();
