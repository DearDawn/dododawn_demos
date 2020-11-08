const express = require('express');
const multer = require('multer');
const fs = require('fs')
const path = require('path');
const utility = require("utility");
const router = express.Router();
const compress = require('./compress')

multer({ dest: '../static/img/' })
multer({ dest: '../static/img-compress/' })
const upload = multer({ dest: './uploads/' })

//图片上传必须用post方法
router.post('/img', upload.array('test'), (req, res) => {
    const pathArr = {origin: [], compress: []}
    const funcs = req.files.map(file => {
        console.log(file);
        return new Promise((resolve) => fs.readFile(file.path, (err, data) => {
            //读取失败，说明没有上传成功
            if (err) { return resolve('上传失败') }
            //如果读取成功
            //声明图片名字为时间戳和随机数拼接成的，尽量确保唯一性
            let time = Date.now() + '-' + parseInt(Math.random() * 10000);
            //拓展名
            let extname = file.mimetype.split('/')[1]
            //拼接成图片名，自动重命名
            let keepname = file.filename + '-' + time + '.' + extname
            const finalPath = path.join(__dirname, '../static/img/' + keepname)
            //三个参数
            //1.图片的绝对路径
            //2.写入的内容
            //3.回调函数
            fs.writeFile(finalPath, data, (err) => {
                if (err) { return resolve('写入失败') }
                fs.rm(file.path, (err) => {
                    if (err) { return resolve('删除失败');
                    }
                })
                // 压缩图片
                compress(finalPath).then(r => {
                    if(r) {
                        pathArr.origin.push(req.headers.host + '/img/' + keepname)
                        pathArr.compress.push(req.headers.host + '/img-compress/' + keepname)
                        resolve(true)
                    }
                    resolve(false)
                })

            });
        }))
    })
    Promise.all(funcs).then(res => {
        return res.reduce((pre, cur) => {
            return pre === true && cur === true
        })
    }).then(() => {
        res.send({ err: 0, msg: `上传成功，共${pathArr.origin.length}个文件`, data: pathArr })
    })
})
module.exports = router;
