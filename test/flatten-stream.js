'use strict';

const assert    = require('assert');
const from2     = require('from2');
const Readable  = require('stream').Readable;
const Writable  = require('stream').Writable;
const flatten   = require('../lib/flatten-stream');
const asline    = require('./helpers').asline;


describe('flatten-stream', function () {
  it('should concatenate strings', function () {
    let stream = flatten();

    from2.obj([ 'qwe', 'rty', '.' ])
      .pipe(stream);

    return asline(stream).expect('.', 'qwe\r\nrty\r\n.');
  });


  it('should flatten arrays', function () {
    let stream = flatten();

    from2.obj([ 'qwe', [ 'foo', 'bar', [ 1, 2, 3 ] ], 'rty', '.' ])
      .pipe(stream);

    return asline(stream).expect('.', 'qwe\r\nfoo\r\nbar\r\n1\r\n2\r\n3\r\nrty\r\n.');
  });


  it('should support nested streams', function () {
    let stream = flatten();

    from2.obj([ 1, 2, from2.obj([ 'a', 'b' ]), 3, 4, from2.obj([ 'c', 'd' ]), '.' ])
      .pipe(stream);
  });


  it('should start reading from next stream when previous is finished', function () {
    let stream = flatten();

    // stream that writes 'foo', 'bar' and never ends
    let src1 = new Readable({
      read() {
        if (!this._called) {
          this.push('foo');
          this.push('bar');
          this._called = true;
        }
      },
      objectMode: true
    });

    let src2 = new Readable({
      read() {
        throw new Error('it should never read from here');
      },
      objectMode: true
    });

    from2.obj([ src1, 'str', src2 ])
      .pipe(stream);

    return asline(stream).end('foo\r\nbar');
  });


  it('should end stream when null is sent', function (next) {
    let stream = flatten();

    let guard = new Readable({
      read() {
        throw new Error('it should never read from here');
      },
      objectMode: true
    });

    assert.equal(stream.writable, true);

    // using nested array because from2([ null ]) will just close input stream
    from2.obj([ [ 'foo', null, 'bar', guard ] ])
      .pipe(stream);

    let buffer = [];

    stream.on('data', d => buffer.push(d));
    stream.on('end', function () {
      assert.equal(buffer.length, 1);
      assert.equal(buffer.toString(), 'foo\r\n');
      next();
    });
  });


  it('should destroy all input streams when stream is destroyed', async function () {
    let stream = flatten();

    let src1 = new Readable({
      read() { this.push('123'); this.push(null); },
      objectMode: true
    });

    let src2_ended = false;
    let src2 = new Readable({
      read() {
        if (!this.read_called) {
          this.push('456');
          stream.destroy();
          this.read_called = true;
        }
      },
      objectMode: true
    });
    src2.destroy = () => { src2_ended = true; };

    let src3_ended = false;
    let src3 = new Readable({
      read() { throw new Error('should never be called'); },
      objectMode: true
    });
    src3.destroy = () => { src3_ended = true; };

    stream.write([ src1, src2, src3 ]);

    let buffer = [];

    return new Promise(resolve => {
      stream.on('data', d => buffer.push(d));
      stream.on('end', function () {
        assert.equal(buffer.length, 1);
        assert.equal(buffer.toString(), '123\r\n');
        assert(src2_ended, 'src2 ended');
        assert(src3_ended, 'src3 ended');
        resolve();
      });
    });
  });


  it('should pause when recipient stream overflows', function (next) {
    let stream = flatten({ highWaterMark: 0 });

    let count = 0;

    let src1 = new Readable({
      read() {
        this.push('qwe');

        count++;
        if (count === 2) next();
        if (count >= 3) next(new Error('reading too much data'));
      },
      objectMode: true,
      highWaterMark: 0
    });

    let src3 = new Readable({
      read() { throw new Error('should never be called'); },
      objectMode: true
    });

    let dst = new Writable({
      write() {},
      highWaterMark: 0
    });

    stream.pipe(dst);

    stream.write([ src1, src3 ]);
  });
});
