# test-cloudflare-access-auth

The objective of this repo is to test:
- [x] Coolify support for Bun using Nixpacks instead of dockerfile.
    - Resp: No, as of writing Nixpacks doesn't seem to _really_ support bun. Definitely not worth using it over a simple dockerfile... I don't need all the obscure \*magic* that actually just doesn't work, and the builds are significantly slower.
- [x] Hono's built in JWK middleware.
    - Resp: It's weak, lacks flexibility in where to get the JWT from, typing and error handling.
- [ ] Cloudflare Access config+management workflow.
