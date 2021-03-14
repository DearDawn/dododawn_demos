var https = require('https');
var fs = require('fs');
var path = require('path');
const WebSocket = require('ws');
const writeLog = require('./write-log');

const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, "../../ssl/Nginx/2_www.dododawn.com.key")),
    cert: fs.readFileSync(path.join(__dirname, "../../ssl/Nginx/1_www.dododawn.com_bundle.crt"))
});

const wss = new WebSocket.Server({ server });

server.listen(7777)

// 连接的客户端集合
const clients = []
// 最大允许连接数量
const MAX_CONNS = 10
// ClientInfo构造函数
const ClientInfo = function () {
    this.profile = {
        name: '无名氏',
        avator: '',
        color: '#114477'
    }
    this.conn = null
}

// 最近缓存的条消息
const mesHistory = []
// 最大允许缓存消息数量
const MAX_HISTORY = 100

// 发送消息到所有的客户端
const sendToAll = (message, which) => {
    clients.forEach(client => {
        client.conn.send(JSON.stringify({ me: which === client, ...message }))
    })
}

// 客户端连接关闭
const closeConn = (client) => {
    // 从集合中删除该客户端
    clients.splice(clients.indexOf(client), 1)
    sendToAll({
        type: 'quit',
        data: {
            info: client.profile
        }
    }, client)

    sendToAll({
        type: 'people',
        data: {
            info: clients.map(c => c.profile)
        }
    }, client)
}

// 接收到客户端发来的消息
const receiveMes = (client, message) => {
    const Rec = JSON.parse(message)
    switch (Rec.option) {
        // 登录
        case 'login':
            client.profile.name = Rec.data.name || '无名氏'
            client.profile.avator = Rec.data.avator || ''
            client.profile.color = Rec.data.color || ''
            sendToAll({
                type: 'login',
                data: {
                    info: client.profile
                }
            }, client)

            sendToAll({
                type: 'people',
                data: {
                    info: clients.map(c => c.profile)
                }
            }, client)

            // 如果有历史消息，就推送给他
            if (mesHistory.length > 0) {
                mesHistory.forEach(data => {
                    client.conn.send(JSON.stringify(data))
                })
            }

            break;

        // 聊天
        case 'chat':
            const text = Rec.data.message
            const dataStr = {
                type: 'chat',
                data: {
                    message: text,
                    info: client.profile,
                    date: new Date().getTime()
                }
            }
            sendToAll(dataStr, client)

            mesHistory.push(dataStr)

            // 记录日志
            writeLog(dataStr)

            if (mesHistory.length > MAX_HISTORY) {
                mesHistory.shift()
            }
            break
        default:
            break;
    }
    // sendToAll('你说了' + message)
}

// 收到一个客户端的连接
wss.on('connection', function (ws) {
    console.log('收到连接');
    // 人数达到上限就关闭连接
    if (clients.length >= MAX_CONNS) {
        ws.close(3001, '连接爆满啦～')
        return
    }

    // 初始化一个客户端信息实例，加入集合
    const client = new ClientInfo()
    client.conn = ws
    clients.push(client)
    // console.log(`客户端已连接，当前连接总数：${clients.length}`);

    // 收到当前客户端发来的消息
    ws.on('message', (mes) => receiveMes(client, mes))

    // 当前客户端断开连接
    ws.on('close', () => closeConn(client))
});

console.log('ws服务端监听端口7777');