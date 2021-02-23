function uploadResponse(requestBody, options = {}) {
  const id = options.id || 123;
  const key = options.key || 'cwUyfscVbcMNdo26Fkn9uHrW';
  const signedId =
    options.signedId ||
    'eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCdz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d4c77635d82e4b007598f79bc3f785854eac27b9';
  const directUploadURL =
    options.directUploadURL || '/api/attachments/direct-upload';

  const blob = JSON.parse(requestBody).blob;

  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
  };

  const body = {
    id: id,
    key: key,
    filename: blob.filename,
    content_type: blob.content_type,
    metadata: {},
    byte_size: blob.byte_size,
    checksum: blob.checksum,
    created_at: new Date().toISOString(),
    signed_id: signedId,
    direct_upload: {
      url: directUploadURL,
      headers: {
        'Content-Type': blob.content_type,
      },
    },
  };

  return { headers, body };
}

export { uploadResponse };
