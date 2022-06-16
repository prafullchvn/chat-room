const net = require('net');

const messageFromServer = (responseAsString) => {
  const response = JSON.parse(responseAsString);
  console.log(`${response.from} : ${response.message}`);
}

const createClient = (socket, name) => {
  socket.setEncoding('utf8');
  socket.on('data', messageFromServer);

  const identification = { type: 'identification', payload: { name: name } };
  socket.write(JSON.stringify(identification));

  return socket;
};

const broadcast = (socket, name, message) => {
  const request = { type: 'broadcast', payload: { from: name, message } };
  socket.write(JSON.stringify(request));
};

const main = (name) => {
  const socket = net.createConnection(4444, () => console.log('connected'));
  const client = createClient(socket, name);
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', (chunk) => {
    broadcast(client, name, chunk.trim());
  });
  client.on('end', () => console.log('Server has closed.'))
};

main(...process.argv.slice(2));
