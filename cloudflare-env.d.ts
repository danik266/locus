// Optional starter database binding. The local-only prototype does not configure D1.
declare namespace Cloudflare {
  interface Env { DB?: D1Database }
}
