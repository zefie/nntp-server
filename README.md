nntp-server, zefie editon
=========================

What I did
----------
- Finished implementation of LAST
- Finished implementation of NEXT
- Added implementation (albiet hacky) of POST
- Modified AUTHINFO command to accept lowercase "user" and "pass" for Thunderbird support
- Other minor customizations for my personal project

What I won't do
---------------
- Add other features that my project does not need
- Address any bugs/issues that do not directly affect my project (with the exception of any security/vulnerability issues, eg Dependabot)
- Clean up any dirty code (mine or upstream) if it works as intended
- Send a Pull Request to any repos (upstream or otherwise. You are free to cherry-pick my updates from my repo.)
- Provide help and/or support for my modifications (code is provided as-is)

Notes
-----
This repo may be rebased and/or fast-forwarded at any time. If you clone this repo, keep this in mind.

I may attempt to upload this module to the **npm** database under a different name, but only if using this github repo in my project's package.json becomes too troublesome for my project's users. If I upload it to **npm** I will update this README with the package's name.

My implementation can be found at [zefie_wtvp_minisrv dev branch includes/WTVNewsServer.js](https://github.com/zefie/zefie_wtvp_minisrv/blob/dev/zefie_wtvp_minisrv/includes/WTVNewsServer.js)

---

**Original project README (at time of fork) is as follows:**

---

[![CI](https://github.com/nodeca/nntp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/nodeca/nntp-server/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/nntp-server.svg?style=flat)](https://www.npmjs.org/package/nntp-server)
[![Coverage Status](https://coveralls.io/repos/github/nodeca/nntp-server/badge.svg?branch=master)](https://coveralls.io/github/nodeca/nntp-server?branch=master)

> NNTP server for readers.

Demo: [news://dev.nodeca.com](news://dev.nodeca.com)

This project is intended to build NNTP interface for internet forums and
similars.

- It implements all commands, required by popular
  [usenet newsreaders](https://en.wikipedia.org/wiki/List_of_Usenet_newsreaders).
- It implements commands pipelining to reduce responses latency.
- You should only add database access methods and output templates.


Install
-------

```sh
npm install nntp-server --save
```


API
---

Until better docs/examples provided, we sugget

1. Dig [nntp-server source](https://github.com/nodeca/nntp-server/blob/master/index.js).
   You should override all `._*` methods (via monkeypatching or subclassing). All data in/out described in each method header.
2. See [tests](https://github.com/nodeca/nntp-server/tree/master/test)
   for more examples.

### new nntp-server(address, options)

```js
const Server = require('nntp-server');
const nntp = new Server('nntp://localhost', { requireAuth: true });
```

Address has "standard" format to define everything in one string:
`nttp(s)://hostname:port/?option1=value1&option2=value2`. For example:

- `nntp://example.com` - listen on 119 port
- `nntps://example.com` - listen on 563 port, encrypted

options:

- `key` - tls secret key, optional.
- `cert` - tls cert, optional.
- `pfx` - tls key+cert together, optional.
- `requireAuth` (false) - set `true` if user should be authenticated.
- `secure` - "false" for `nntp://`, "true" for `nntps://`. Set `true`
  if you use `nntp://` with external SSL proxy and connection is secure.
  If connection is not secure client will be requested to upgrade via
  STARTTLS after AUTHINFO command.
- `session` - override default `Session` class if needed, optional.
- `commands` - your own configuration of supported commands, optional.
  For example you may wish to drop AUTHINFO commands, been enabled by default.


### .listen(address) -> Promise

Bind server to given addres, format is `protocol://host[:port]`:

- 'nntps://localhost' - bind to 127.0.0.1:563 via SSL/TLS
- 'nntp://localhost' - bind to 127.0.0.1:119 without encryption.

Returns Promise, resolved on success or fail.


### .close() -> Promise

Stop accepting new connections and wait until existing ones will be finished.


Bind server to given addres, format is `protocol://host[:port]`:

- 'nntps://localhost' - bind to 127.0.0.1:563 via SSL/TLS
- 'nntp://localhost' - bind to 127.0.0.1:119 without encryption.

Returns Promise, resolved on success or fail.


### exports.commands

```js
{
  'LIST OVERVIEW.FMT': ...,
  'XOVER': ...,
  ...
}
```

Object with command configurations. Use it to create your own and apply
modifications. Don't forget to clone objects prior to modify. Keep default
ones immutable.


### exports.Session

This class contains client connection logic. Probably, you will not
need to extend it.
