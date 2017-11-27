#!/usr/bin/env node
// @flow
import "babel-polyfill"
import program from "commander"
import parse from "./lib/markdownParse"

program
  .usage("[options] <url> <output>")
  .version("0.0.1")
  .parse(process.argv)

const start = async () => {
  const res = await parse("#header\n\nHello, world!\n#test\naaa\nbbbb")
  await console.log(JSON.stringify(res, null, "  "))
}

start(program)
