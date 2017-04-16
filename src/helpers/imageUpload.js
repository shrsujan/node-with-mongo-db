import fs from 'fs'
import path from 'path'
import md5 from 'md5'
const appRoot = path.resolve()

export default (images, destFolder) => {
  return new Promise((resolve, reject) => {
    if (images.length) {
      let uploadedImages = []
      images.forEach((image, index, images) => {
        fs.readFile(image.path, (err, data) => {
          if (err) {
            reject(err)
          }
          let uploadDir = appRoot + '/src/public/images/' + destFolder + '/'
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir)
          }
          let filename = md5(image.path + '|' + JSON.stringify(image.lastModifiedDate) + image.name + '|' + Date.now()) + path.extname(image.name)
          let filePath = uploadDir + filename
          fs.writeFile(filePath, data, (err) => {
            if (err) {
              reject(err)
            } else {
              // might wanna read filenames array and delete all the images from uploadDir that have been already uploaded
              uploadedImages.push(filename)
              if (index === images.length - 1) {
                resolve(uploadedImages)
              }
            }
          })
        })
      })
    } else {
      fs.readFile(images.path, (err, data) => {
        if (err) {
          reject(err)
        }
        let uploadDir = appRoot + '/src/public/images/' + destFolder + '/'
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir)
        }
        let filename = md5(images.path + '|' + JSON.stringify(images.lastModifiedDate) + images.name + '|' + Date.now()) + path.extname(images.name)
        let filePath = uploadDir + filename
        fs.writeFile(filePath, data, (err) => {
          if (err) {
            reject(err)
          } else {
            // might wanna read filenames array and delete all the images from uploadDir that have been already uploaded
            resolve(filename)
          }
        })
      })
    }
  })
}
