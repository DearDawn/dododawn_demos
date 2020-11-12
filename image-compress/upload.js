const express = require('express');
const multer = require('multer');
const fs = require('fs')
const path = require('path');
const router = express.Router();
const compress = require('./compress')
const downloadFromUrl = require('./download.js');

multer({ dest: '../static/img/' })
multer({ dest: '../static/img-compress/' })
const upload = multer({ dest: './uploads/' })

//图片上传必须用post方法
router.post('/img', upload.array('files'), (req, res) => {
    const pathArr = { origin: [], compress: [] }
    let urlFuncs = []
    let fileFuncs = []
    if (Array.isArray(req.files) && req.files.length !== 0) {
        fileFuncs = req.files.map(file => {
            console.log(file);
            return new Promise((resolve) => fs.readFile(file.path, (err, data) => {
                //读取失败，说明没有上传成功
                if (err) { return resolve('上传失败') }
                let time = Date.now() + '-' + parseInt(Math.random() * 10000);
                let extname = file.mimetype.split('/')[1]
                let keepName = file.filename + '-' + time + '.' + extname
                const finalPath = path.join(__dirname, '../static/img/' + keepName)

                fs.writeFile(finalPath, data, (err) => {
                    if (err) { return resolve('写入失败') }
                    fs.rm(file.path, (err) => {
                        if (err) {
                            return resolve('删除失败');
                        }
                    })
                    // 压缩图片
                    compress(finalPath).then(r => {
                        if (r) {
                            pathArr.origin.push(req.headers.host + '/img/' + keepName)
                            pathArr.compress.push(req.headers.host + '/img-compress/' + keepName)
                            resolve(true)
                        }
                        resolve(false)
                    })
                });
            }))
        })
    }
    let urls = req.body.urls ? req.body.urls : []
    urls = Array.isArray(urls) ? urls : [urls]
    if (urls.length !== 0) {
        urlFuncs = urls.map(url => {
            return new Promise((resolve) => {
                downloadFromUrl(url).then(res => {
                    if (!res) { return resolve(false) }
                    const imgUrl = res.finalPath

                    fs.readFile(imgUrl, (err, data) => {
                        if (err) { return resolve('上传失败') }
                        const finalPath = path.join(__dirname, '../static/img/' + res.keepName)

                        fs.writeFile(finalPath, data, (err) => {
                            if (err) { return resolve('写入失败') }
                            fs.rm(imgUrl, (err) => {
                                if (err) {
                                    return resolve('删除失败');
                                }
                            })
                            // 压缩图片
                            compress(finalPath).then(r => {
                                if (r) {
                                    pathArr.origin.push(req.headers.host + '/img/' + res.keepName)
                                    pathArr.compress.push(req.headers.host + '/img-compress/' + res.keepName)
                                    return resolve(true)
                                }
                                resolve(false)
                            })
                        });
                    })
                })
            })
        })
    }

    if (fileFuncs.length === 0 && urlFuncs.length === 0) {
        return res.send({ status: 10, msg: `上传失败，缺少参数`, data: '' })
    }

    Promise.all(fileFuncs.concat(urlFuncs)).then(res => {
        return res.reduce((pre, cur) => {
            return pre === true && cur === true
        })
    }).then(() => {
        res.send({ status: 0, msg: `上传成功，共${pathArr.origin.length}个文件`, data: pathArr })
    })
})
module.exports = router;
