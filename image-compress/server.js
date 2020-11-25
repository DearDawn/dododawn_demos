const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const path = require('path')
const upload = require('./upload.js');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// 配置静态资源目录 整一个文件夹 通过域名能访问
app.use(express.static(path.normalize(path.join(__dirname, "../static"))))
app.use('/upload', upload)
app.listen(10, () => console.log("图片上传服务器开启，端口: 10"))