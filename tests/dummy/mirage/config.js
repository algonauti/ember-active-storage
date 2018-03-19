import Response from 'ember-cli-mirage/response';
import { uploadResponse } from 'ember-active-storage/utils/tests';

export default function() {
  this.namespace = '/api';

  this.post('/attachments/upload', (_, request) => {
    const response = uploadResponse(request.requestBody, {
      directUploadURL: '/api/attachments/direct-upload'
    });
    return new Response(200, response.headers, response.body);
  });

  this.put('/attachments/direct-upload', () => {
    return new Response(204);
  }, { timing: 150 });
}
