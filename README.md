# lowdb-session-store

Express session store using lowdb

# Installation

```
$ npm install lowdb-session-store
```

# Usage

This store implements all methods specified by the `express-session` store interface.

```javascript
const session = require('express-session');
const LowdbStore = require('lowdb-session-store')(session);
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// The default value must be an array.
const adapter = new FileSync(pathname, { defaultValue: [] });
const db = lowdb(adapter);
...

app.use(session({
  secret: '12345',
  resave: false,
  saveUninitialized: false,
  store: new LowdbStore(db, {
    ttl: 86400
  })
}))
```

## Parameters

A new lowdb session store instance is created by instantiating the class returned by this module. The constructor takes one or two parameters:

- `db` - The first parameter must be a `lowdb` instance.

- `options` - An optional options object.

### Options

- `ttl` - The expiration time for a session in seconds. A interval timer runs every ten minutes to purge expired sessions. The default value is `86400` (one day).
- `disablePurge` - Set to true to disable the ten-minute session purge timer (useful for testing).

## Session Storage Type

The value of the database **must** be an array as the sessions are stored as a collection.

If you want to store the sessions as a property of a larger object, you can do that provided that the property value is an array.

```javascript
const session = require('express-session');
const LowdbStore = require('lowdb-session-store')(session);
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// The sessions property must be an array.
const adapter = new FileSync(pathname, { defaultValue: { sessions: [] }});
const db = lowdb(adapter);
...

// We must get the sessions object before passing it to the session store.
app.use(session({
  secret: '12345',
  resave: false,
  saveUninitialized: false,
  store: new LowdbStore(db.get('sessions'), {
    ttl: 86400
  })
}))
```

In this example, the sessions array is a property of an object. To make this work, you must get that structure and pass it as the database parameter to the session store.

# License

MIT License

Copyright (c) 2019 Frank Hellwig

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
