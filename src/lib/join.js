// @flow
import { parseText, parseList } from "./parse"

const MATCH_HTML_STRING = /<(\/\w*|\w*)>/g

const getList = async (body) => {
  let items = await []

  await Promise.all(
    await body.split("```").map(async (text, index) => {
      if (index % 2 === 1) {
        items = await [
          ...items,
          {
            type: "code",
            value: text
          }
        ]
        return
      }

      const tags = (await body.match(MATCH_HTML_STRING)) || []

      if (tags.length > 0) {
        const strat = await body.indexOf(tags[0])
        const end = await body.lastIndexOf(tags[tags.length - 1] + tags[tags.length - 1].length)
        const html = await body.slice(strat, end)

        items = await [
          ...items,
          {
            type: "markdown",
            value: await body.slice(0, strat),
            parse: await parseText(body.slice(0, strat))
          },
          {
            type: "html",
            value: html
          },
          {
            type: "markdown",
            value: await body.slice(end, body.length),
            parse: await parseText(body.slice(end, body.length))
          }
        ]
        return
      }

      const list = await parseList(body)
      if (list !== null) {
        items = [...items, ...list]
        return
      }

      items = await [
        ...items,
        {
          type: "markdown",
          value: text,
          parse: await parseText(text)
        }
      ]
    })
  )

  return items
}

export default async (items, order) => {
  const result = await Promise.all(
    await order.map(async (key) => {
      const item = await items[key]
      const body = await item.body.join("\n")
      const parse = await getList(body)

      return {
        head: item.head,
        markdown: body,
        parse
      }
    })
  )

  return result
}
