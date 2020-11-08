const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

async function compress(filePath) {
	try {
		await imagemin([filePath], {
			destination: '../static/img-compress/',
			plugins: [
				imageminJpegtran(),
				imageminPngquant({
					quality: [0.6, 0.8]
				})
			]
		});
	} catch (error) {
		console.log('error', error);
		return false
	}
	return true
}

module.exports = compress
