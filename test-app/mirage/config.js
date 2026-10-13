import { uploadResponse } from '@algonauti/ember-active-storage/utils/tests';
import { createServer, Response } from 'miragejs';

export default function (config) {
  return createServer({
    ...config,
    routes() {
      this.namespace = '/api';

      this.post('/attachments/upload', (_, request) => {
        const response = uploadResponse(request.requestBody, {
          directUploadURL: '/api/attachments/direct-upload',
        });

        return new Response(200, response.headers, response.body);
      });

      this.put(
        '/attachments/direct-upload',
        () => {
          return new Response(204);
        },
        { timing: 150 },
      );
    },
  });
}
