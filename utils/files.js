var app = require('express');
var _ = require('lodash');
var fs = require('fs');
var request = require('request');

var file_unlink = (data) =>{
	// fs.unlink(data.filename, (err) => {
	// 	if (err) throw err;
	// 		console.log('successfully deleted '+ data.filename);
	// });
	try {
		fs.unlinkSync(data.filename);
		// console.log('successfully deleted '+ data.filename);
	} catch (err) {
		console.log('file_unlink: file not found');
	}
};


module.exports = {file_unlink};