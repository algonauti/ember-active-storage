export default function fetchFile(filePath) {
  return fetch(filePath)
    .then((response) => {
      return response.blob();
    })
    .then((blob) => {
      const fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
      return new File([blob], fileName, { type: blob.type });
    });
}
