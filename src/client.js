/**
 * Connection On Server Side
 *  - name
 *  - connections
 */

class Client {
  constructor(name) {
    this.name = name;
    this.connections = [];
  }

  sendResponse(response) {
    this.connections.forEach(connection => {
      connection.write(response);
    });
  }

  removeConnection(givenConnection) {
    this.connections = this.connections.filter(
      connection => connection !== givenConnection
    );
  }

  isOnline() {
    return this.connections.length !== 0;
  }
}

module.exports = { Client };
