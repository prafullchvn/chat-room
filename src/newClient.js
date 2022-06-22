
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

const sendMessage = (client, recipients, message) => {
  const request = {
    type: 'message',
    payload: {
      recipients,
      message
    }
  };

  client.write(JSON.stringify(request));
};

const extractRecipients = (chunk) => {
  const messageInfo = chunk.match(/^@([^ ]+) ?(.*)/)?.slice(1, 3);
  if (messageInfo) {
    const recipients = messageInfo[0];
    const message = messageInfo[1] || '';
    return [recipients, message];
  }
  return [];
};

const main = (name) => {
  const socket = net.createConnection(4444, () => console.log('connected'));
  const client = createClient(socket, name);
  process.stdin.setEncoding('utf-8');

  process.stdin.on('data', (data) => {
    const [recipients, message] = extractRecipients(data);

    if (recipients) {
      sendMessage(client, recipients, message);
      return;
    }

    broadcast(client, name, data.trim());
  });

  client.on('end', () => console.log('Server has closed.'))
};

main(...process.argv.slice(2));
