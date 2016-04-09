'use strict';

let express = require('express');

let models = require('../models')
	,utils = require('../utils');

let router = express.Router();

//GET /folder/:id
router.get('/folder/:id', function(req, res, next){
	let id = req.params.id, userid = req.user._id;
	
	let getFolder = new Promise(function(resolve, reject){
		models.Folder.findOne({_id: id, userid: userid})
		.populate({path: 'posts', options: {limit: 10, sort: '-datetime'}})
		.exec(function(err, folder){
			if(err){//error
				let error = new utils.Error('getfolder', 'ff', 'Error finding folder');
				error.status = 500;
				reject(error);
			}
			else if(!folder){//no folder
				let error = new utils.Error('getfolder', 'nf', 'Cannot find this folder');
				error.status = 403;
				reject(error);
			}
			else resolve(folder);
		});
	});
	
	getFolder.then(function(folder){
		if(!folder.posts.length) res.status(204).end();//empty folder
		else{
			let ret = {
				folder: folder
				,csrf: req.csrf
			}
			res.status(200).json(ret).end();
		}
	})
	.catch(function(error){
		res.status(error.status).json({error: error}).end();
	});
});

module.exports = router;