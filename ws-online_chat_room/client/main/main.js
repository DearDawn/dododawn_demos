const DOM = {
    myInfo: document.querySelector('#my-info'),
    message: document.querySelector('#message'),
    sendBtn: document.querySelector('#send-btn'),
    chatWindow: document.querySelector('#chat-window'),
    onlineList: document.querySelector('#left')
}

// 建立 webSocket 连接
// const ws = new WebSocket("ws://localhost:7777");
const ws = new WebSocket("wss://www.dododawn.com:7777");

// 页面关闭时自动断开连接
window.onbeforeunload = () => {
    ws.close()
}

// 连接关闭
ws.onclose = (event) => {
    toast('连接关闭，原因：' + event.reason || '未知');
}

// 连接建立
ws.onopen = () => {
    // 解析登录参数
    const qs = new URLSearchParams(window.location.search)
    const name = qs.get('name')
    const color = qs.get('color')

    // 参数缺失，重定向到登录页
    if (!name || !color) {
        window.location.href = '../login/login.html'
        return
    }

    // 登录
    login(name, color)
    console.log('连接成功');
}

// 连接出错
ws.onerror = (err) => {
    console.log('出错啦！！！');
}

// 接收消息
ws.onmessage = (res) => {
    const Res = JSON.parse(res.data)

    switch (Res.type) {
        case 'login':
            handleLogin(Res.data, Res.me)
            break;
        case 'chat':
            handleChat(Res.data, Res.me)
            break;
        case 'quit':
            handleQuit(Res.data, Res.me)
            break;
        case 'people':
            handlePeople(Res.data)
            break;
        default:
            break;
    }
}

// 登录聊天室
function login(name, color) {
    // 连接处于关闭状态，不执行
    if (ws.readyState === 3) {
        return
    }

    // 发送登录的消息
    ws.send(JSON.stringify({
        option: 'login',
        data: {
            name: name || '',
            color: color || ''
        }
    }))
}

// 发送消息
function send(message) {
    // 连接处于关闭状态，不执行
    if (ws.readyState === 3) {
        return
    }

    // 发送聊天的消息
    ws.send(JSON.stringify({
        option: 'chat',
        data: {
            message: encodeURIComponent(message) || ''
        }
    }))
}

function handleLogin(resData, isMe) {
    let card = null

    if (isMe) {
        DOM.myInfo.innerHTML = `${resData.info.name}`
        DOM.myInfo.style.backgroundColor = resData.info.color

        // 登录成功，初始化页面逻辑
        init()

        card = initTipCard('我上线了～')
        setTimeout(() => {
            DOM.chatWindow.appendChild(card)
            card.scrollIntoView({ behavior: 'smooth' })
        }, 500);
    } else {
        card = initTipCard(`${resData.info.name}上线了～`)
        DOM.chatWindow.appendChild(card)
        card.scrollIntoView({ behavior: 'smooth' })
    }
}

function handleChat(resData, isMe) {

    const date = new Date(resData.date)
    const info = resData.info
    const message = resData.message


    const dateStr = dateFormat(date,'mm-dd HH:MM:SS')

    const card = initChatCard(
        decodeURIComponent(info.name),
        decodeURIComponent(info.color),
        dateStr,
        decodeURIComponent(message))

    if (isMe) {
        // 清空输入框
        DOM.message.value = ''
        card.classList.add('mine')
        DOM.chatWindow.appendChild(card)
    } else {
        card.classList.add('other')
        DOM.chatWindow.appendChild(card)
    }

    setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth' })
    }, 300);
}

function handleQuit(resData, isMe) {
    card = initTipCard(`${resData.info.name}下线了`)
    DOM.chatWindow.appendChild(card)
    card.scrollIntoView({ behavior: 'smooth' })
}


// 在线人数状态
function handlePeople(resData) {
    const info = resData.info

    const fragment = document.createDocumentFragment()

    info.forEach(item_info => {
        const card = initInfoCard(
            decodeURIComponent(item_info.name),
            decodeURIComponent(item_info.color)
        )

        fragment.appendChild(card)
    });

    DOM.onlineList.innerHTML = '<div class="title">当前在线</div>'
    DOM.onlineList.appendChild(fragment)
}

function init() {
    DOM.message.onkeydown = (e) => {
        if (e.keyCode === 13 && e.ctrlKey) {
            handleSend()
        }
    }

    DOM.sendBtn.onclick = () => {
        handleSend()
    }
}

// 发送消息
function handleSend() {
    const message = DOM.message.value

    if (String(message).trim() === '') {
        toast('不能为空')
        return
    }

    send(message)
}

// 提示消息
function toast(message) {
    console.log(message);
    const card = initTipCard(message)
    DOM.chatWindow.appendChild(card)
    card.scrollIntoView({ behavior: 'smooth' })
}

// 初始化聊天卡片
function initChatCard(name, color, dateStr, message) {
    const card = document.createElement('div')
    card.innerHTML = `<div class="avator" style="background-color: ${color}"></div>` +
        `<div class="message-box"><div class="name-date">` +
        `<span class="name">${name}</span>` +
        `<span class="date">${dateStr}</span></div>` +
        `<div class="text">${message}</div></div>`

    return card
}

// 初始化提示卡片
function initTipCard(message) {
    const card = document.createElement('div')
    card.classList.add('tip-box')
    card.innerHTML = `<div class="tip">${message}</div>`
    return card
}

// 初始化资料卡片
function initInfoCard(name, color) {
    const card = document.createElement('div')
    card.classList.add('info-box')
    card.innerHTML = `<div class="info-avator" style="background-color:${color}"></div>` +
        `<div class="info-name">${name}</div>`
    return card
}

// 时间格式化
function dateFormat(dateStr, format) {
    const timeOBJ = new Date(Number(dateStr));
    let formatStr = format;
    let ret;
    const opt = {
        'Y+': timeOBJ.getFullYear().toString(), // 年
        'm+': (timeOBJ.getMonth() + 1).toString(), // 月
        'd+': timeOBJ.getDate().toString(), // 日
        'H+': timeOBJ.getHours().toString(), // 时
        'M+': timeOBJ.getMinutes().toString(), // 分
        'S+': timeOBJ.getSeconds().toString(), // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (const k in opt) {
        ret = new RegExp('(' + k + ')').exec(formatStr);
        if (ret) {
            const matchStr = ret[1];
            const replaceStr =
                matchStr.length === 1 ? opt[k] : opt[k].padStart(matchStr.length, '0');
            formatStr = formatStr.replace(matchStr, replaceStr);
        }
    }
    return formatStr;
};