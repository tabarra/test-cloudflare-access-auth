import { Hono } from 'hono';
import { authMiddleware, type AuthMiddlewareVariables } from './authMiddleware';


type AuthedRouterEnv = {
    Variables: {} & AuthMiddlewareVariables;
}

const app = new Hono<AuthedRouterEnv>()
    .use(authMiddleware)
    .get('/', (c) => {
        const payload = c.get('auth')
        return c.json(payload)
    });

export default app;
