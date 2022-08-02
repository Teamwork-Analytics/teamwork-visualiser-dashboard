const formatMessageToKey = (rawString) => {
  return rawString.replace(/\s+/g, "_").toLowerCase();
};

module.exports = { formatMessageToKey };
