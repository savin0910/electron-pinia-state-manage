import fs from 'node:fs/promises';
import path from 'node:path';

import { protocol } from 'electron';

import { APP_PROTOCOL, CONTENT_TYPES } from '@/shared/config';

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_PROTOCOL,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);

export function handleAppProtocol() {
  protocol.handle(APP_PROTOCOL, async (request) => {
    const url = new URL(request.url);
    const { host, pathname } = url;
    const extention = path.extname(pathname);
    const filePath = path.join(__dirname, '..', host, pathname);
    const contentType = CONTENT_TYPES[extention] || 'text/plain';
    let response: Response;

    try {
      const buffer = await fs.readFile(filePath);

      response = new Response(buffer, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
        },
      });
    } catch (error) {
      response = new Response(null, {
        status: 404,
        statusText: 'Not Found',
      });
    }

    return response;
  });
}
