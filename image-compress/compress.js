const images = require("images");
const path = require('path')
const fs = require('fs')

const outputPath = path.join(__dirname, '../static/img-compress/')

function compress(filePath) {
	try {
		const isFile = fs.statSync(filePath).isFile()

		if (isFile) {
			compressByFile(filePath)
		} else {
			compressByDir(filePath)
		}
	} catch (error) {
		console.log('error', error);
		return false
	}
	return true
}

function compressByFile(filePath) {
	const fileName = /\/([^\/]*)$/.exec(filePath)[1]
	const isImg = /\.(jpg|jpeg|png)$/.test(fileName)
	if (!isImg) return false

	const output = outputPath + fileName
	const source = images(filePath)
	const { width, height } = source.size()

	if (width > 1000) {
		source.resize(1000)
	}

	source.save(output, { quality: 50 });

}

function compressByDir(dirPath) {
	const fileList = fs.readdirSync(dirPath)
	const newList = fileList.filter(item => /\.(jpg|jpeg|png)$/.test(item))

	newList.forEach(fileName => {
		const input = dirPath + fileName
		const output = outputPath + fileName

		const source = images(input)
		const { width, height } = source.size()

		if (width > 1000) {
			source.resize(1000)
		}

		source.save(output, { quality: 50 });
	})
}

module.exports = compress