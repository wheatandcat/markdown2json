#!/usr/bin/env node
// @flow
import "babel-polyfill"
import program from "commander"
import { readFileSync } from "fs"
import parse from "./lib/parse"

program
  .usage("[options] <url> <output>")
  .version("0.0.1")
  .parse(process.argv)

const start = async () => {
  const contents = await readFileSync("./examples/qiita.md", "utf8")
  const res = await parse(contents)
  await console.log(JSON.stringify(res, null, "  "))
}

start(program)
