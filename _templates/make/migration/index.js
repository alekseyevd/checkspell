const fs = require('fs')
const path = require('path')

module.exports = {
  prompt: ({ prompter, args }) => {
    const pathName = path.join(__dirname, '../../../src/modules')
    const modules = fs
      .readdirSync(pathName)
      .filter(dir => {
        return fs.statSync(path.join(pathName, dir)).isDirectory()
      })

    return prompter
      .prompt([
        {
          type: 'select',
          name: 'name',
          message: 'Module',
          choices: modules
        },
        {
          type: 'input',
          name: 'sql',
          message: 'sql',
        }
    ])
  }
}