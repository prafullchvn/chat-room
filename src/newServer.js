// const { Client } = require('./client.js');
// const { Server } = require('./server.js');
const { createServer } = require('net');
const { EventEmitter } = require('events');

const sendMessageToUser = (recipient, from, message) => {
  recipient.write(JSON.stringify({ from, message }));
};

const broadcast = ({ message, from }, clients) => {
  Object.entries(clients).forEach(([name, socket]) => {
    if (name === from) {
      return;
    }
    sendMessageToUser(socket, from, message);
  });
};

const notifyUsers = (message, clients) => {
  broadcast({ message, from: 'SERVER' }, clients);
};

const identify = ({ name }, clients, socket) => {
  notifyUsers(`${name} joined the room.`, clients);
  clients[name] = socket;
};

const userLeftEvent = (clients, socket) => {
  const [name] = Object.entries(clients).find(([name, clientSocket]) => {
    return socket === clientSocket;
  });
  notifyUsers(`${name} left the room.`, clients);
};

const requestHandler = (requestEvents, req, clients, socket) => {
  const request = JSON.parse(req);
  requestEvents.emit(request.type, request.payload, clients, socket);
};

const handleError = (err) => {
  console.log(err);
};

const getClientName = (client, clients) => {
  let [name] = Object.entries(clients).find(
    ([name, socket]) => socket === client
  );

  return name;
}

const messageUsers = ({ recipients, message }, clients, senderClient) => {

  console.log('req received to send messages to', recipients, message)
  const senderName = getClientName(senderClient, clients);
  Object.entries(clients).forEach(([clientName, clientSocket]) => {
    if (recipients.includes(clientName)) {
      sendMessageToUser(clientSocket, senderName, message);
    }
  });
};

const main = () => {
  const requestEvents = new EventEmitter();
  const clients = {};
  requestEvents.on('identification', identify);
  requestEvents.on('broadcast', broadcast);
  requestEvents.on('message', messageUsers);

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
