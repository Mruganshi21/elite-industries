# -*- coding: utf-8 -*-
"""Moves an MP4's `moov` atom in front of `mdat` (the qt-faststart transform).

An MP4 written with `moov` last cannot be rendered until the whole file has
arrived, because the index that says where the frames are is at the end of it.
Relocating that index to the front lets a browser start playing while the rest
still downloads. wwwroot/video/README.md explains why both clips on this site
need it.

This rewrites containers only. The `mdat` bitstream is copied byte for byte, so
the file stays exactly the same size and nothing is re-encoded — only the chunk
offset tables (`stco`, or `co64` on files over 4 GB) are corrected for the move.

    python tools/faststart.py wwwroot/video/hero.mp4

Writes in place after checking the result parses. Already-faststart files are
left alone. ffmpeg does the same thing with `-movflags +faststart`, and is the
better tool when it is available — it is not installed on this machine.
"""
import os
import struct
import sys


def top_level_atoms(buf):
    """Yields (type, start, size) for each atom at the root of the file."""
    off = 0
    while off < len(buf) - 8:
        size = struct.unpack('>I', buf[off:off + 4])[0]
        typ = buf[off + 4:off + 8].decode('latin1')
        if size == 1:                       # 64-bit extended size
            size = struct.unpack('>Q', buf[off + 8:off + 16])[0]
        elif size == 0:                     # runs to end of file
            size = len(buf) - off
        if size < 8:
            raise ValueError('bad atom size %d for %r at %d' % (size, typ, off))
        yield typ, off, size
        off += size


def find_offset_tables(moov):
    """Locates every stco/co64 in the moov atom.

    Returns a list of (start, size, is_64bit). The tables sit at
    moov/trak/mdia/minf/stbl, so only the containers on that path are walked
    into — descending into everything risks matching bytes inside a sample
    description that merely look like an atom header.
    """
    CONTAINERS = (b'trak', b'mdia', b'minf', b'stbl', b'edts')
    found = []

    def walk(start, end):
        off = start
        while off < end - 8:
            size = struct.unpack('>I', moov[off:off + 4])[0]
            typ = moov[off + 4:off + 8]
            if size == 1:
                size = struct.unpack('>Q', moov[off + 8:off + 16])[0]
            elif size == 0:
                size = end - off
            if size < 8:
                break
            if typ in CONTAINERS:
                walk(off + 8, off + size)
            elif typ in (b'stco', b'co64'):
                found.append((off, size, typ == b'co64'))
            off += size

    walk(8, len(moov))                      # past the moov header itself
    return found


def shift_offsets(moov, delta):
    """Adds `delta` to every chunk offset in the moov atom."""
    out = bytearray(moov)
    tables = find_offset_tables(moov)
    if not tables:
        raise ValueError('no stco/co64 found — refusing to move moov blindly')

    moved = 0
    for start, size, is_64 in tables:
        # stco: 4 type + 4 size + 1 version + 3 flags + 4 count, then entries
        count = struct.unpack('>I', moov[start + 12:start + 16])[0]
        entry = 8 if is_64 else 4
        pos = start + 16
        if pos + count * entry > start + size:
            raise ValueError('offset table runs past its atom')
        for _ in range(count):
            if is_64:
                val = struct.unpack('>Q', moov[pos:pos + 8])[0]
                struct.pack_into('>Q', out, pos, val + delta)
            else:
                val = struct.unpack('>I', moov[pos:pos + 4])[0]
                if val + delta > 0xFFFFFFFF:
                    raise ValueError('offset overflows 32 bits — needs co64')
                struct.pack_into('>I', out, pos, val + delta)
            pos += entry
            moved += 1
    return bytes(out), moved


def faststart(path):
    with open(path, 'rb') as fh:
        buf = fh.read()

    atoms = list(top_level_atoms(buf))
    order = [a[0] for a in atoms]
    if 'moov' not in order or 'mdat' not in order:
        raise ValueError('not an MP4 I understand: %s' % order)
    if order.index('moov') < order.index('mdat'):
        print('%s: moov is already before mdat — nothing to do' % path)
        return False

    moov = next(a for a in atoms if a[0] == 'moov')
    moov_bytes = buf[moov[1]:moov[1] + moov[2]]

    # Everything except moov keeps its order; moov is inserted directly before
    # mdat, so the media data slides forward by exactly the size of moov.
    patched, moved = shift_offsets(moov_bytes, moov[2])

    out = bytearray()
    for typ, start, size in atoms:
        if typ == 'moov':
            continue                        # it is re-inserted, not kept in place
        if typ == 'mdat':
            out += patched
        out += buf[start:start + size]

    if len(out) != len(buf):
        raise ValueError('size changed: %d -> %d' % (len(buf), len(out)))

    # Parse what we are about to write before overwriting the original.
    check = [a[0] for a in top_level_atoms(bytes(out))]
    if check.index('moov') > check.index('mdat'):
        raise ValueError('moov did not end up first: %s' % check)

    with open(path, 'wb') as fh:
        fh.write(out)

    print('%s: moved moov (%d bytes) ahead of mdat, %d chunk offsets corrected'
          % (path, moov[2], moved))
    print('  atom order is now: %s' % ' '.join(check))
    return True


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('usage: python tools/faststart.py <file.mp4>')
    target = sys.argv[1]
    if not os.path.isfile(target):
        sys.exit('no such file: %s' % target)
    faststart(target)
