/*!
 * The UTF-8/RFC 3986 encoder in this file is adapted from qs 6.16.0 (lib/utils.js).
 * That code was originally written by Brian White (mscdex) for the io.js core
 * querystring library and adapted by qs for stricter adherence to RFC 3986.
 *
 * @license BSD-3-Clause
 *
 * Copyright (c) 2014, Nathan LaFreniere and other contributors
 * (https://github.com/ljharb/qs/graphs/contributors)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const hex = Array.from({ length: 256 }, (_, c) =>
  `%${c.toString(16).padStart(2, '0')}`.toUpperCase(),
);
const toISO = Date.prototype.toISOString;

function encode(value) {
  if (value.length === 0) return value;
  const string =
    typeof value === 'symbol'
      ? Symbol.prototype.toString.call(value)
      : String(value);
  let out = '';
  for (let j = 0; j < string.length; j += 1024) {
    let segment = string.slice(j, j + 1024);
    if (j + 1024 < string.length) {
      const last = segment.charCodeAt(segment.length - 1);
      if (last >= 0xd800 && last <= 0xdbff) {
        segment = segment.slice(0, -1);
        j -= 1;
      }
    }
    for (let i = 0; i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (
        c === 0x2d ||
        c === 0x2e ||
        c === 0x5f ||
        c === 0x7e ||
        (c >= 0x30 && c <= 0x39) ||
        (c >= 0x41 && c <= 0x5a) ||
        (c >= 0x61 && c <= 0x7a)
      ) {
        out += segment.charAt(i);
      } else if (c < 0x80) {
        out += hex[c];
      } else if (c < 0x800) {
        out += hex[0xc0 | (c >> 6)] + hex[0x80 | (c & 0x3f)];
      } else if (c < 0xd800 || c >= 0xe000) {
        out +=
          hex[0xe0 | (c >> 12)] +
          hex[0x80 | ((c >> 6) & 0x3f)] +
          hex[0x80 | (c & 0x3f)];
      } else {
        i += 1;
        c = 0x10000 + (((c & 0x3ff) << 10) | (segment.charCodeAt(i) & 0x3ff));
        out +=
          hex[0xf0 | (c >> 18)] +
          hex[0x80 | ((c >> 12) & 0x3f)] +
          hex[0x80 | ((c >> 6) & 0x3f)] +
          hex[0x80 | (c & 0x3f)];
      }
    }
  }
  return out;
}

export default function stringifyQuery(obj) {
  if (typeof obj !== 'object' || obj === null) return '';
  const parts = [];
  const ancestors = new Set();
  function walk(value, prefix) {
    if (value === undefined) return;
    if (value instanceof Date) value = toISO.call(value);
    if (value === null) value = '';
    const isObject = typeof value === 'object';
    const isBuffer =
      isObject &&
      value.constructor &&
      value.constructor.isBuffer &&
      value.constructor.isBuffer(value);
    if ((!isObject && typeof value !== 'function') || isBuffer) {
      parts.push(`${encode(prefix)}=${encode(value)}`);
      return;
    }
    if (ancestors.has(value)) throw new RangeError('Cyclic object value');
    ancestors.add(value);
    for (const key of Object.keys(value)) walk(value[key], `${prefix}[${key}]`);
    ancestors.delete(value);
  }
  for (const key of Object.keys(obj)) walk(obj[key], key);
  return parts.join('&');
}
