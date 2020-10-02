const ws = new WebSocket("ws://localhost:7777");

// 页面关闭时自动断开连接
window.onbeforeunload = () => {
    ws.close()
}

// 连接关闭
ws.onclose = (event) => {
    console.log('连接关闭，原因：', event.reason || '未知');
}

// 连接建立
ws.onopen = () => {
    console.log('连接成功');
}

// 连接出错
ws.onerror = (err) => {
    console.log('出错啦！！！');
}

// 接收消息
ws.onmessage = (res) => {
    console.log('收到服务器发来的消息', res.data);
}

// 登录聊天室
function login(name) {
    // 连接处于关闭状态，不执行
    if (ws.readyState === 3) {
        return
    }

    ws.send(JSON.stringify({
        option: 'login',
        data: {
            name: name || ''
        }
    }))
}

// 发送消息
function send(message) {
    // 连接处于关闭状态，不执行
    if (ws.readyState === 3) {
        return
    }

    ws.send(JSON.stringify({
        option: 'chat',
        data: {
            message: message || ''
        }
    }))
}
