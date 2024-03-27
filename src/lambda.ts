import { Handler, Context, APIGatewayEvent } from 'aws-lambda';
import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import express from 'express';
import { ValidationPipe } from '@nestjs/common';

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below
const binaryMimeTypes: string[] = [];

let cachedServer: Server;

async function bootstrap(): Promise<Server> {
  if (!cachedServer) {
    const expressApp = express();
    const expressAdapter = new ExpressAdapter(expressApp);

    const nestApp = await NestFactory.create(AppModule, expressAdapter);
    nestApp.useGlobalPipes(new ValidationPipe());

    //nestApp.useGlobalFilters(new ExceptionsLoggerFilter(expressAdapter));

    nestApp.use(eventContext());
    await nestApp.init();
    cachedServer = createServer(expressApp, undefined, binaryMimeTypes);
  }
  return cachedServer;
}

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
) => {
  cachedServer = await bootstrap();
  return proxy(cachedServer, event, context, 'PROMISE').promise;
};
