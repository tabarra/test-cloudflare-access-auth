# test-cloudflare-access-auth

> [!WARNING]
> This repo is archived because I have no plans to keep improving it.  
> This is only a public repo so others can copypaste my homework.

The objective of this repo is to test and document the integrations described below:

### Coolify support for Bun using Nixpacks instead of dockerfile.
**No.**  
As of writing, Nixpacks doesn't seem to _really_ support bun. Definitely not worth using it over a [simple Dockerfile](./Dockerfile)...  
I don't need all the obscure \*magic* that actually just doesn't work, and the builds are significantly slower.  
Furthermore, the builds in my host went down from 1m50s to 20s after switching back to Dockerfile.

### Hono's built in JWK middleware.
**It's weak.**
It lacks flexibility in where to get the JWT from, typing, and error handling.  
But it was easy enough to implement a secure alternative using `jose`, as defined in [./src/authMiddleware.ts](./src/authMiddleware.ts).

### Cloudflare Access config + management workflow.
**Seems fine.**  
This definitely improved since I last checked years ago.  
Note to future self:  
- You don't add users, you need to allow them to login via a policy, and when they login they get a "seat" automatically.
- Every app needs to have a policy attached
    - If you select "everyone" in the policy, _literally everyone_ will be able to login.
    - What you are likely looking for is a "email list" conditional.
    - You can configure the lists in **My Team > Lists**.
    - A policy based on if the user is part of a github org is another good alternative.
- The management can be done via API calls.
    - https://developers.cloudflare.com/api/resources/zero_trust/
- User-triggered logouts can be done via `https://<your-application-domain>/cdn-cgi/access/logout`.
    - Ref: https://developers.cloudflare.com/cloudflare-one/identity/users/session-management/#revoke-user-sessions
