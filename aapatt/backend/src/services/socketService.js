export function initSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join:request', (requestId) => {
      socket.join(`request:${requestId}`);
    });
    socket.on('join:provider', (providerId) => {
      socket.join(`provider:${providerId}`);
    });
  });
}

export function emitToRequest(io, requestId, event, payload) {
  io.to(`request:${requestId}`).emit(event, payload);
}

export function emitToProvider(io, providerId, event, payload) {
  io.to(`provider:${providerId}`).emit(event, payload);
}
