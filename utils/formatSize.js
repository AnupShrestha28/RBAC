const formatSize = (sizeInBytes) => {
  if (sizeInBytes < 1024) return `${sizeInBytes} bytes`;
  else if (sizeInBytes < 1048576)
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  else return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
};

module.exports = formatSize;
