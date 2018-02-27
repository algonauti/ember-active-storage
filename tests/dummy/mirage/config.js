import Response from 'ember-cli-mirage/response';

export default function() {
  this.namespace = '/api';

  this.post('/attachments/upload', (_, request) => {
    const blob = JSON.parse(request.requestBody).blob;
    const respHeaders = {
      'Content-Type': 'application/json; charset=utf-8'
    };
    const respBody = {
      id: 123,
      key: 'cwUyfscVbcMNdo26Fkn9uHrW',
      filename: blob.filename,
      content_type: blob.content_type,
      metadata: {},
      byte_size: blob.byte_size,
      checksum: blob.checksum,
      created_at: new Date().toISOString(),
      signed_id: 'eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCdz09IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--d4c77635d82e4b007598f79bc3f785854eac27b9',
      direct_upload: {
        url: '/api/attachments/direct-upload',
        headers: {
          'Content-Type': blob.content_type
        }
      }
    };
    return new Response(200, respHeaders, respBody);
  });

  this.put('/attachments/direct-upload', () => {
    return new Response(204);
  });
}
