'use strict';

const fs = require('fs');
const os = require ('os')
const path = require('path')

const debug = require('debug')('network');

function Networker(socket, handler) {
  this.socket = socket;
  this._packet = {};
  
  this._process = false;
  this._state = 'HEADER';
  this._type = 0;
  this._action = 0;
  this._payloadLength = 0;
  this._bufferedBytes = 0;
  this.queue = [];

  this.handler = handler;
}

Networker.prototype.init = function () {
  this.socket.on('data', (data) => {
    this._bufferedBytes += data.length;
    this.queue.push(data);

    this._process = true;
    this._onData();
  });

  this.socket.on('served', this.handler);
};

Networker.prototype.handler = function (buffer) {
  switch (this._action) {
    case 0:
      this.socket.write(buffer)
      break;
    
      case 1:
        console.log(buffer.toString());
        break;

      case 2:
        fs.writeFile(path.join(os.tmpdir, `${Date.now()}`), buffer)
        break;
  
    default:
      break;
  }
}

Networker.prototype._hasEnough = function (size) {
  if (this._bufferedBytes >= size) {
    return true;
  }
  this._process = false;
  return false;
}

Networker.prototype._readBytes = function (size) {
  let result;
  this._bufferedBytes -= size;

  if (size === this.queue[0].length) {
    return this.queue.shift();
  }

  if (size < this.queue[0].length) {
    result = this.queue[0].slice(0, size);
    this.queue[0] = this.queue[0].slice(size);
    return result;
  }
  
  result = Buffer.allocUnsafe(size);
  let offset = 0;
  let length;
  
  while (size > 0) {
    length = this.queue[0].length;

    if (size >= length) {
      this.queue[0].copy(result, offset);
      offset += length;
      this.queue.shift();
    } else {
      this.queue[0].copy(result, offset, 0, size);
      this.queue[0] = this.queue[0].slice(size);
    }

    size -= length;
  }

  return result;
}

Networker.prototype._getHeader = function () {
  if (this._hasEnough(4)) {
    this._payloadLength = this._readBytes(4).readUInt16BE(0, true);
    this._state = 'TYPE';
  }
}

Networker.prototype._getType = function () {
  if (this._hasEnough(1)) {
    this._type = this._readBytes(1).readUInt16BE(0, true);
    this._state = 'ACTION';
  }
}

Networker.prototype._getAction = function () {
  if (this._hasEnough(1)) {
    this._action = this._readBytes(1).readUInt16BE(0, true);
    this._state = 'PAYLOAD';
  }
}

Networker.prototype._getPayload = function () {
  if (this._hasEnough(this._payloadLength)) {
    let received = this._readBytes(this._payloadLength);
    //to do check type
    if (this._checkType(received)) {
      this.socket.emit('served', received);
    }
    
    this._state = 'HEADER';
  }
}

Networker.prototype._checkType = function (buffer) {
  switch (this._type) {
    case 0:
      return isValidUTF8(buffer)

    case 1:
      try {
        JSON.parse(buffer.toString())
      } catch (error) {
        return false
      }
      return true
    
    case 2:
      return buffer.toString("hex", 0, 2) === "ffd8"
    
    default:
      return false;
  }


}

Networker.prototype._onData = function (data) {
  while (this._process) {
    switch (this._state) {
      case 'HEADER':
        this._getHeader();
        break;

      case 'TYPE':
        this._getType()
        break;

      case 'ACTION':
        this._getAction()
        break;

      case 'PAYLOAD':
        this._getPayload();
        break;
    }
  }
}

Networker.prototype.send = function (message) {
  let buffer = Buffer.from(message);
  this._header(buffer.length);
  this._packet.message = buffer;
  this._send();
}

Networker.prototype._header = function (messageLength) {
  this._packet.header = { length: messageLength };
};

Networker.prototype._send = function () {
  let contentLength = Buffer.allocUnsafe(4);
  contentLength.writeUInt16BE(this._packet.header.length);
  debug('Attempting to write...', this._packet);
  this.socket.write(contentLength);
  this.socket.write(this._packet.message);
  this._packet = {};
};

function isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0x00) {  // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {  // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0  // overlong
      ) {
        return false;
      }

      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {  // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80 ||  // overlong
        buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0  // surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      }

      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {  // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80 ||  // overlong
        buf[i] === 0xf4 && buf[i + 1] > 0x8f || buf[i] > 0xf4  // > U+10FFFF
      ) {
        return false;
      }

      i += 4;
    } else {
      return false;
    }
  }

  return true;
}

module.exports = Networker;