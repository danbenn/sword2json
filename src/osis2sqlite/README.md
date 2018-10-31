**NOTE**: this is NOT finished and is under active development!

Lightweight Javascript library to convert OSIS Bible XML to Sqlite schema

## Motivation

Bogged down with hairy OSIS XML, and want something more lightweight?

This is the library for you!

### Why OSIS?

Sword is the most widely used XML schema for publishing Bibles electronically.

You can read more about it [on Wikipedia](https://en.wikipedia.org/wiki/Open_Scripture_Information_Standard).

### Why osis2sqlite?

Traditionally, applications have interacted with OSIS XML through Sword modules, and the corresponding libraries for parsing those.

There are two official libraries for reading Sword modules: [Java](https://github.com/crosswire/jsword) and [C++](https://github.com/bibletime/crosswire-sword-mirror). Neither are particularly friendly to newcomers, and lack good documentation.

"Filters" within these libraries can convert XML to HTML. Which is great if you're building an old school, static HTML website, not so great if you're trying to use modern frontend tools like React, Vue, or Angular to build modern web or mobile apps.

`osis2sqlite` was created as a modern solution for building Bible apps and websites using pure Javascript.

Don't be afraid of Typescript! It compiles down to vanilla Javascript, so you can run it anywhere.

