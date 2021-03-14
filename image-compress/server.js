const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const path = require('path')
const upload = require('./upload.js');
const https = require('https');
const fs = require('fs');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// 配置静态资源目录 整一个文件夹 通过域名能访问
app.use(express.static(path.normalize(path.join(__dirname, "../static"))))
app.use('/upload', upload)

https.createServer({
  key: fs.readFileSync(path.join(__dirname, "../ssl/Nginx/2_www.dododawn.com.key")),
  cert: fs.readFileSync(path.join(__dirname, "../ssl/Nginx/1_www.dododawn.com_bundle.crt"))
}, app).listen(10, () => {
  console.log("图片上传服务器开启，端口: 10")
});
