function _fetchFile(filePath) {
  return fetch(filePath)
    .then((response) => {
      return response.blob();
    })
    .then((blob) => {
      const fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
      return new File([blob], fileName, { type: blob.type });
    });
}

export default async function fetchFile(filePath) {
  window.pretenderFetch = window.fetch;
  window.fetch = window.server.pretender._nativefetch;
  var res = await _fetchFile(filePath);
  window.fetch = window.pretenderFetch
  return res;
}
