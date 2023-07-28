const socketDispatch = (socket, details, data) => {
  data.id = details.id;
  data.name = details.name;
  data.clientTime = new Date();
  socket.emit(data.page, data);
};
export default socketDispatch;
