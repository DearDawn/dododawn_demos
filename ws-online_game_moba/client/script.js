let DOM = {}

const INSTANCE = {
    timers: {
        hero: 0,
        place: 0,
    },
    counter: 0,
    fps: 2,
}

function getModels() {
    return {
        myHero: {
            dom: document.querySelector('.hero'),
            data: {
                beforeX: 0,
                beforeY: 0,
                width: 50,
                height: 50,
                center: [25, 25],
                left: 0,
                top: 0,
                speed: 8,
            }
        },
        main: {
            dom: document.querySelector('.main'),
            data: {
                width: 900,
                height: 600,
                left: 100,
                height: 100,
            }
        },
        tip: {
            dom: document.querySelector('.tip'),
            data: {
                beforeX: 0,
                beforeY: 0,
                width: 50,
                height: 50,
                center: [25, 25],
                left: 0,
                top: 0,
                speed: 10,
            }
        }
    }
}

function init() {
    const { clientWidth: cw2, clientHeight: ch2, offsetTop: offTop2, offsetLeft: offLeft2 } = DOM.main.dom
    DOM.main.data.width = cw2
    DOM.main.data.height = ch2
    DOM.main.data.left = offLeft2
    DOM.main.data.top = offTop2

    const { clientWidth: cw1, clientHeight: ch1 } = DOM.myHero.dom

    DOM.myHero.data.width = cw1
    DOM.myHero.data.height = ch1
    DOM.myHero.data.center = [cw1 / 2, ch1 / 2]

    const [widthCenter, heightCenter] = DOM.myHero.data.center
    DOM.myHero.data.left = DOM.main.data.left + 10 + widthCenter
    DOM.myHero.data.top = DOM.main.data.top + 10 + heightCenter

    const { clientWidth: cw3, clientHeight: ch3 } = DOM.tip.dom
    DOM.tip.dom.classList.add('hide')
    DOM.tip.data.width = cw3
    DOM.tip.data.height = ch3
    DOM.tip.data.center = [cw3 / 2, ch3 / 2]
    const [wc3, hc3] = DOM.tip.data.center
    DOM.tip.data.left = DOM.main.data.left + 10 + wc3
    DOM.tip.data.top = DOM.main.data.top + 10 + hc3

}

function showPlace(pageX, pageY) {
    const tipDom = DOM.tip
    window.clearTimeout(INSTANCE.timers.place)
    tipDom.dom.classList.remove('hide')
    const x = pageX - tipDom.data.left
    const y = pageY - tipDom.data.top
    tipDom.dom.style.top = `${y}px`
    tipDom.dom.style.left = `${x}px`
    INSTANCE.timers.place = window.setTimeout(() => {
        tipDom.dom.classList.add('hide')
    }, 300);
}

function moveTo(hero, pageX, pageY) {
    INSTANCE.counter = 0
    window.clearInterval(INSTANCE.timers.hero)
    const offX = pageX - hero.data.left
    const offY = pageY - hero.data.top

    const spanX = offX - hero.data.beforeX
    const spanY = offY - hero.data.beforeY
    const pieceX = spanX / INSTANCE.fps
    const pieceY = spanY / INSTANCE.fps
    const pX = Math.abs(pieceX)
    const pY = Math.abs(pieceY)
    const pMax = pX > pY ? pX : pY
    const addX = spanX / pMax
    const addY = spanY / pMax

    INSTANCE.timers.hero = window.setInterval(() => {
        INSTANCE.counter += 1
        if (INSTANCE.counter > pMax + 1) {
            window.clearInterval(INSTANCE.timers.hero)
            INSTANCE.counter = 0
            return
        }

        hero.dom.style.top = `${Math.floor(hero.data.beforeY + addY)}px`
        hero.dom.style.left = `${Math.floor(hero.data.beforeX + addX)}px`
        hero.data.beforeY += addY
        hero.data.beforeX += addX

    }, hero.data.speed);

}

function addEvent() {
    DOM.main.dom.addEventListener('contextmenu', (e) => {
        // 禁止默认事件
        e.preventDefault()
        const { pageX, pageY } = e
        // 位置图标
        showPlace(pageX, pageY)
        // 英雄移动
        moveTo(DOM.myHero, pageX, pageY)
    }, true)
}

window.onload = () => {
    DOM = getModels()
    init()
    addEvent()
    console.log(DOM);
}

window.onunload = () => {
    console.log('dead');
}

window.onbeforeunload = () => {
    console.log('deading');
}