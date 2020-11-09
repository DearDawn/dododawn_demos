const http = require("http");
const https = require("https");
const fs = require("fs");
const utility = require("utility");
const path = require('path');

function downloadFromUrl(url) {
    let obj = /^https/.test(url) ? https : http

    return new Promise(resolve => {
        obj.get(url, function (res) {
            let imgData = "";
            let time = Date.now() + '-' + parseInt(Math.random() * 10000);
            const extra = res.headers['content-type'].split('/')[1]
            const keepName = utility.md5(url) + '-' + time + '.' + extra
            const finalPath = path.join(__dirname, "./uploads/" + keepName)
console.log(finalPath);
            res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
            res.on("data", function (chunk) {
                imgData += chunk;
            });

            res.on("end", function () {
                fs.writeFile(finalPath, imgData, "binary", function (err) {
                    if (err) {
                        console.log("down fail");
                        return resolve(false)
                    }
                    console.log("down success");
                    return resolve({ extra, keepName, finalPath })
                });
            });
        });
    })
}

module.exports = downloadFromUrl