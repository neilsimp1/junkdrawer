var express = require('express');

var models = require('../models')
	,utils = require('../utils');

var router = express.Router();

//POST /post
router.post('/post', function(req, res){
	var post = new models.Post({
		userid: req.user._id
		,folderid: req.body.folderid
		,datetime: new Date()
		,text: req.body.text
	});
	
	post.save(function(err, post){
		if(err){//error
			var error = new utils.Error('post', 'sp', 'Error updating folder with post id');
			res.status(500).json({error: error}).end();
		}
		else{//post saved
			models.Folder.findOneAndUpdate({_id: post.folderid}, {$push: {posts: post._id}}, function(err){
				if(err){//error
					var error = new utils.Error('post', 'uf', 'Error updating folder with post id');
					res.status(500).json({error: error}).end();
				}
				else{
					var ret = {
						id: post._id
						,csrf: req._csrf
					}
					res.status(200).json(ret).end();
				}
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
		}
	});
});

module.exports = router;