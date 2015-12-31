'use strict';

let express = require('express');

let models = require('../models')
	,utils = require('../utils');

let router = express.Router();

//POST /post
router.post('/post', function(req, res){
	let post = new models.Post({
		userid: req.user._id
		,folderid: req.body.folderid
		,datetime: new Date()
		,text: req.body.text
	});
	
	let insertPost = new Promise(function(resolve, reject){
		post.save(function(err, post){
			if(err){//error
				var error = new utils.Error('post', 'sp', 'Error saving post');
				reject(error);
			}
			else resolve(post);
		});
	});
	
	insertPost.then(function(post){
		let updateFoldersPosts = new Promise(function(resolve, reject){
			models.Folder.findOneAndUpdate({_id: post.folderid}, {$push: {posts: post._id}}, function(err){
				if(err){//error
					var error = new utils.Error('post', 'uf', 'Error updating folder with post id');
					reject(error);
				}
				else resolve();
			});
		});
		
		updateFoldersPosts.then(function(){
			let ret = {id: post._id, csrf: req._csrf}
			res.status(200).json(ret).end();
		})
		.catch(function(error){
			res.status(500).json({error: error}).end();
		});
	})
	.catch(function(error){
		res.status(500).json({error: error}).end();
	});
	
	
	//below: all old stuff made up at work, some may be useable
	//utils.getFiles(req.files).forEach(function(file, index){
	//	file.save(function(err){
	
	//	});
	//});
	
	////files, if any, saved
	//models.Folder.findOne({username: req.body.folderid}, '_id', function(err, folder){//get folder
	//	if(!folder){//error username
	//		var error = new utils.Error('post', 'folder', 'Invalid folder id');
	//		res.render('index.ejs', {csrfToken: req.csrfToken(), error: error});
	//	}
	//	else{//show folder
	//		res.render('templates/folder.ejs', {isLoggedIn: true, csrfToken: req.csrfToken(), folder: folder},
	//			function(err, html){
	//				var ret = {
	//					html: html
	//				}

	//				res.setHeader('Content-Type', 'application/json');
	//				res.status(200).send(ret);
	//			}
	//		);
	//	}
	//});
});

module.exports = router;