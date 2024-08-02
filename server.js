let http = require('http')
let fs = require('fs')
let path = require('path')
let mime = require('mime')
let chatServer = require('./lib/chat_server')
let cache = {}

function send404(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain' })
  response.write('Error 404: resource not found.')
  response.end()
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {
    'content-type': mime.lookup(path.basename(filePath)),
  })
  response.end(fileContents)
}

function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath])
  } else {
    if (fs.existsSync(absPath)) {
      fs.readFile(absPath, (err, data) => {
        if (err) {
          send404(response)
        } else {
          cache[absPath] = data
          sendFile(response, absPath, data)
        }
      })
    } else {
      send404(response)
    }
  }
}

const server = http.createServer((req, res) => {
  let filePath = false

  if (req.url == '/') {
    filePath = 'public/index.html'
  } else {
    filePath = 'public' + req.url
  }
  let absPath = './' + filePath
  serveStatic(res, cache, absPath)
})
chatServer.listen(server)
server.listen(3000, '127.0.0.1', () => {
  console.log('http://127.0.0.1:3000/')
})
