// @flow
const MATCH_HEADER = /^#/
const MATCH_HEADER_STRING = /^#+\s*(.+)\s*$/

const parseContent = async (rows) => {
  let header
  const content = {}
  // const stringifyBody = body => body.join("\n").trim()

  await Promise.all(
    rows.map(async (row) => {
      if (MATCH_HEADER.test(row)) {
        // if (header) header.body = await stringifyBody(header.body)
        // create the new headerObj

        header = {
          head: row,
          body: []
        }

        const key = row.match(MATCH_HEADER_STRING)[1]

        content[key] = await header
      } else {
        await header.body.push(row)
      }

      return true
    })
  )

  // header.body = await stringifyBody(header.body)

  return content
}

export default async (markdown) => {
  const rows = await markdown.split("\n")
  const items = await parseContent(rows)

  return items
}
