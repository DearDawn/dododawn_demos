const nameInput = document.querySelector('#name')
const colorInput = document.querySelector('#color')
const loginBtn = document.querySelector('#login_btn')

const randomName = getRandomName()
nameInput.value = randomName

loginBtn.onclick = () => {
    const name = encodeURIComponent(nameInput.value || randomName)
    const color = encodeURIComponent(colorInput.value)
    window.location.href = `../main/main.html?name=${name}&color=${color}`
}

// 随机生成一个名字
function getRandomName() {
    const lastNames = ['小', '小小']
    const firstNames = ['明', '红', '刚', '强', '绿', '帅', '甲']

    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]

    return lastName + firstName
}