var express = require('express');

var models = require('../models')
	,utils = require('../utils');

var router = express.Router();

//POST /post
router.post('/post/', function(req, res){
	var post = new models.Post({
		folderid: req.body.folderid
		,datetime: new Date()
		,text: req.body.text
	});
	
	post.save(function(err){
		if(err){//error
			var origin = 'unknown';
			var errMess = 'Something bad happened! Please try again.';
			if(err.code === 11000){
				origin = 'post';
				message = 'Error saving post';
			}
			var error = new utils.Error('post', origin, message);

			res.render('index.ejs', {_csrf: req._csrf, error: error});
		}
		else{//post saved
			utils.getFiles(req.files).forEach(function(file, index){
				file.save(function(err){
					if(err){//error
						var origin = 'unknown';
						var message = 'Something bad happened! Please try again';
						if(err.code === 11000){
							origin = 'post';
							message = 'Error saving file';
						}
						var error = new utils.Error('post', origin, message);

						res.render('index.ejs', {_csrf: req._csrf, error: error});
					}
				});
			});
			
			//files, if any, saved
			models.Folder.findOne({username: req.body.folderid}, '_id', function(err, folder){//get folder
				if(!folder){//error username
					var error = new utils.Error('post', 'folder', 'Invalid folder id');
					res.render('index.ejs', {csrfToken: req.csrfToken(), error: error});
				}
				else{//show folder
					res.render('templates/folder.ejs', {isLoggedIn: true, csrfToken: req.csrfToken(), folder: folder},
						function(err, html){
							var ret = {
								html: html
							}

							res.setHeader('Content-Type', 'application/json');
							res.status(200).send(ret);
						}
					);
				}
			});
		}
	});
});

module.exports = router;