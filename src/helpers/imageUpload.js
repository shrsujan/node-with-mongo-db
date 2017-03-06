import fs from 'fs'
import path from 'path'
import md5 from 'md5'
const appRoot = path.resolve()

export default (image, destFolder) => {
  return new Promise((resolve, reject) => {
    fs.readFile(image.path, (err, data) => {
      if (err) {
        reject(err)
      }
      let uploadDir = appRoot + '/src/public/images/' + destFolder + '/'
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir)
      }
      let filename = md5(image.path + '|' + JSON.stringify(image.lastModifiedDate) + image.name) + path.extname(image.name)
      let filePath = uploadDir + filename
      fs.writeFile(filePath, data, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(filename)
        }
      })
    })
  })
}
