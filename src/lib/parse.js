// @flow
import join from "./join"

const MATCH_HEADER = /^#/
const MATCH_HEADER_STRING = /^#+\s*(.+)\s*$/
const REPLACE_WORD = "DWT5xkgI"
const MATCH_IMAGES_STRING = /!\[\w*\]\(.*\)/
const MATCH_IMAGES_TEXT_STRING = /!\[\w*\]/
const MATCH_IMAGES_URL_STRING = /\(.*\)/
const MATCH_LIST_STRING = / \* /

const parseContent = async (rows) => {
  let header
  const content = {}
  let keys = []

  await Promise.all(
    rows.map(async (row) => {
      if (MATCH_HEADER.test(row)) {
        header = {
          head: row,
          body: []
        }

        let key = row.match(MATCH_HEADER_STRING)[1]

        if (keys.indexOf(key) !== -1) key += `_key-${keys.indexOf(key)}`

        keys = [...keys, key]
        content[key] = await header
      } else {
        await header.body.push(row.replace(REPLACE_WORD, "#"))
      }

      return true
    })
  )

  return content
}

const parseOrder = async (markdown) => {
  let keys = []

  return markdown.filter(row => row[0] === "#").map((row) => {
    let key = row.match(MATCH_HEADER_STRING)[1]

    if (keys.indexOf(key) !== -1) key += `_key-${keys.indexOf(key)}`
    keys = [...keys, key]

    return key
  })
}

const parseCode = async (markdown) => {
  const list = await markdown.split("```").map((text, index) => {
    if (index % 2 === 0) {
      return text
    }

    return text.replace(/#/, REPLACE_WORD)
  })

  return list.join("```")
}

export const parseImages = async (row) => {
  const image = await row.match(MATCH_IMAGES_STRING)

  if (!image) {
    return null
  }

  const imagesText = await row.match(MATCH_IMAGES_TEXT_STRING)[0]
  const imagesURL = await row.match(MATCH_IMAGES_URL_STRING)[0]

  return {
    type: "images",
    value: {
      markdown: row,
      text: imagesText.slice(2, imagesText.length - 1),
      url: imagesURL.slice(1, imagesURL.length - 1)
    }
  }
}

export const parseText = async (text) => {
  const rows = await text.split("\n\n")

  const result = await Promise.all(
    await rows.map(async (row) => {
      const images = await parseImages(row)
      if (images !== null) {
        return images
      }

      return {
        type: "other",
        value: row
      }
    })
  )

  return result
}

export const parseList = async (markdown) => {
  const isList = await markdown.match(MATCH_LIST_STRING)
  if (!isList) {
    return null
  }

  let listItem = []
  let listItemIndex = []
  await Promise.all(
    await markdown.split("\n").map(async (row, index) => {
      const match = (await row.match(MATCH_LIST_STRING)) || []
      if (match.length > 0) {
        listItem = [...listItem, row]
        listItemIndex = [...listItemIndex, index]
      }
    })
  )

  let result = []
  await Promise.all(
    await markdown.split("\n").map(async (row, index) => {
      if (listItemIndex.indexOf(index) === -1) {
        result = [
          ...result,
          {
            type: "text",
            value: await parseText(row)
          }
        ]
        return true
      }

      if (index === listItemIndex[0]) {
        result = [
          ...result,
          {
            type: "list",
            value: listItem
          }
        ]
      }

      return true
    })
  )

  return result
}

export default async (markdown) => {
  const text = await parseCode(markdown)
  const rows = await text.split("\n")
  const items = await parseContent(rows)

  const order = await parseOrder(rows)

  const result = await join(items, order)

  return result
}
