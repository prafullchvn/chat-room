class Server {
  constructor() {
    this.clients = {};
  }

  addConnection(name, socket) {
    this.clients[name] = new Client(fromClient, toClient);
  }

  sendResponse(name) {
    this.clients[name].sendResponse(data);
  }

  getAllClientIds() {
    return Object.keys(this.clients);
  }

  usersOnline() {
    return Object.values(this.clients).filter();
  }
}

module.exports = { Server };
