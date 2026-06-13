import * as colyseusTools from '@colyseus/tools';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';
import path from 'path';
import express from 'express';
import type { ConfigOptions } from '@colyseus/tools';
import type { Server } from '@colyseus/core';
import type { Request, Response, Express } from 'express';

/**
 * Import your Room files
 */
import { MyRoom } from './rooms/MyRoom';

const serverRoot = path.dirname(path.resolve(process.argv[1]));
const distPath = path.join(serverRoot, '../dist');
const configCandidate = (colyseusTools as unknown as { default?: unknown }).default;
const config = (
  typeof configCandidate === 'function'
    ? configCandidate
    : (configCandidate as { default?: unknown } | undefined)?.default
) as (options: ConfigOptions) => ConfigOptions;

export default config({
  initializeGameServer: (gameServer: Server) => {
    /**
     * Define your room handlers:
     */
    gameServer.define('my_room', MyRoom);
  },

  initializeExpress: (app: Express) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get('/', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== 'production') {
      app.use('/pg', playground);
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use('/colyseus', monitor());
    app.use(express.static(distPath));
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
