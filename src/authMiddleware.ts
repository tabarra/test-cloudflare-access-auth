import { createMiddleware } from 'hono/factory'
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';


// Build JWKS
const cloudflareTeamDomain = new URL(`https://${process.env.CF_TEAM_DOMAIN}`);
const authConfig = {
    audience: process.env.CF_APP_AUDIENCE!,
    issuer: `https://${cloudflareTeamDomain.hostname}`,
    certsUrl: `https://${cloudflareTeamDomain.hostname}/cdn-cgi/access/certs`,
    // getIdentityUrl: `https://${cloudflareTeamDomain.hostname}/cdn-cgi/access/get-identity`,
}
const JWKS = createRemoteJWKSet(new URL(authConfig.certsUrl));


// JWT Payload Schema
// https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/application-token/#identity-based-authentication
const CloudflareJwtPayload = z.object({
    email: z.string().email().describe('The email address of the authenticated user, verified by the identity provider.'),
    exp: z.number().positive().describe('The expiration timestamp for the token (Unix time).'),
    iat: z.number().positive().describe('The issuance timestamp for the token (Unix time).'),
    sub: z.string().uuid().describe('The ID of the user. This value is unique to an email address per account. The user would get a different sub if they are removed and re-added to your Zero Trust organization, or if they log into a different organization.'),
    identity_nonce: z.string().min(1).describe('A cache key used to get the user\'s identity. Effectively a Session ID'),
    country: z.string().length(2).describe('The country where the user authenticated from.'),
});
export type CloudflareJwtPayload = z.infer<typeof CloudflareJwtPayload>;
export type AuthMiddlewareVariables = { auth: CloudflareJwtPayload };


/**
 * Middleware to authenticate requests using Cloudflare Access JWTs.
 * This middleware verifies the JWT, checks the algorithm, and validates the payload against a schema.
 */
export const authMiddleware = createMiddleware<{ Variables: AuthMiddlewareVariables }>(async (c, next) => {
    // Get the JWT from the request header
    const jwt = c.req.header('cf-access-jwt-assertion');
    if (!jwt) return c.json({ error: 'Auth header missing' }, 401);

    //Decode and verify the JWT
    let parsedPayload: CloudflareJwtPayload;
    try {
        const { payload, protectedHeader } = await jwtVerify(jwt, JWKS, {
            audience: authConfig.audience,
            issuer: authConfig.issuer,
        });
        if (protectedHeader?.alg !== 'RS256') {
            throw new Error('Invalid JWT algorithm. Expected RS256.');
        }
        parsedPayload = CloudflareJwtPayload.parse(payload);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('JWT payload validation error:', error.errors);
            return c.json({ error: 'Invalid JWT payload' }, 401);
        } else {
            console.error('JWT verification error:', error);
            return c.json({ error: 'Invalid JWT' }, 401);
        }
    }

    // Set the parsed payload in the context for later use
    c.set('auth', parsedPayload);
    console.log('Authenticated payload:', parsedPayload);
    await next();
});
