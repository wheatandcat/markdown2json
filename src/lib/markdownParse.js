// @flow
const MATCH_HEADER = /^#/
const MATCH_HEADER_STRING = /^#+\s*(.+)\s*$/
const REPLACE_WORD = "DWT5xkgI"

const parseContent = async (rows) => {
  let header
  const content = {}
  // const stringifyBody = body => body.join("\n").trim()

  await Promise.all(
    rows.map(async (row) => {
      if (MATCH_HEADER.test(row)) {
        header = {
          head: row,
          body: []
        }

        const key = row.match(MATCH_HEADER_STRING)[1]

        content[key] = await header
      } else {
        await header.body.push(row.replace(REPLACE_WORD, "#"))
      }

      return true
    })
  )

  return content
}

const parseCode = async (markdown) => {
  const list = await markdown.split("```").map((text, index) => {
    if (index % 2 === 0) {
      return text
    }

    return text.replace("#", REPLACE_WORD)
  })

  return list.join("```")
}

export default async (markdown) => {
  const text = await parseCode(markdown)
  const rows = await text.split("\n")
  const items = await parseContent(rows)

  return items
}
