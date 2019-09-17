/*
 * MIT License
 *
 * Copyright (c) 2019 Frank Hellwig
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

module.exports = function(session) {
  const Store = session.Store;

  class SessionStore extends Store {
    constructor(db, options = {}) {
      super(options);
      if (typeof db.getState !== 'function') {
        throw new Error('The first argument must be a lowdb instance.');
      }
      this.db = new Sessions(db, options.ttl, options.namespace);
      setInterval(() => {
        this.db.purge();
      }, 60000);
    }

    all(callback) {
      callback(null, this.db.all());
    }

    clear(callback) {
      this.db.clear();
      callback(null);
    }

    destroy(sid, callback) {
      this.db.destroy(sid);
      callback(null);
    }

    get(sid, callback) {
      callback(null, this.db.get(sid));
    }

    length(callback) {
      callback(null, this.db.length());
    }

    set(sid, session, callback) {
      this.db.set(sid, session);
      callback(null);
    }

    touch(sid, session, callback) {
      this.set(sid, session, callback);
    }
  }

  return SessionStore;
};

class Sessions {
  constructor(db, ttl, namespace) {
    if (namespace !== null) {
      namespace = namespace || 'sessions';
    }
    if (namespace) {
      db.defaults({ [namespace]: {} }).write();
    }
    this.db = db;
    this.ttl = ttl || 86400;
    this.namespace = namespace;
  }

  get data() {
    return this.namespace ? this.db.get(this.namespace) : this.db;
  }

  get(sid) {
    const obj = this.data
      .get(sid)
      .cloneDeep()
      .value();
    return obj ? obj.session : null;
  }

  all() {
    return this.data
      .values()
      .cloneDeep()
      .map(obj => obj.session)
      .value();
  }

  length() {
    return this.data.size().value();
  }

  set(sid, session) {
    const expires = Date.now() + this.ttl * 1000;
    this.data.set(sid, { session, expires }).write();
  }

  destroy(sid) {
    this.data.unset(sid).write();
  }

  clear() {
    this._replace({});
  }

  purge() {
    const now = Date.now();
    this._replace(this.data.omitBy(obj => now > obj.expires).value());
  }

  _replace(data) {
    if (this.namespace) {
      this.db.set(this.namespace, data).write();
    } else {
      this.db.setState(data).write();
    }
  }
}
