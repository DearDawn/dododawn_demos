const fs = require('fs')
const path = './chat-room.log'

const writeLog = (chatObj) => {

    const data = chatObj.data
    const date = new Date(data.date).toLocaleString()
    const name = decodeURIComponent(data.info.name)
    const color = decodeURIComponent(data.info.color)
    const message = decodeURIComponent(data.message)

    const contentStr = `${date} | ${name} | ${color} | ${message}\n`

    fs.open(path, 'a', function (err, fd) {
        if (err) {
            console.log(err);
        } else {
            fs.appendFile(path, contentStr, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('写入成功');
                }
            })
        }
    });
}

module.exports = writeLog