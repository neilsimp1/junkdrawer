var express = require('express');

var models = require('../models')
	,utils = require('../utils');

var router = express.Router();

//GET /folder/:id
router.get('/folder/:id', function(req, res, next){
	var id = req.params.id
		,userid = req.user._id;

	models.Folder.findOne({_id: id, userid: userid})
		.populate({path: 'posts', options: {sort:{'timestamp': -1}, limit: 10}})
		.exec(function(err, folder){
			if(err){//error
				var error = new utils.Error('getfolder', 'ff', 'Error finding folder');
				res.status(500).json({error: error}).end();
			}
			else if(!folder){//no folder
				var error = new utils.Error('getfolder', 'nf', 'Cannot find this folder');
				res.status(403).json({error: error}).end();
			}
			else{
				if(!folder.posts.length) res.status(204).end();//empty folder
				else{
					var ret = {
						folder: folder
						,csrf: req._csrf
					}
					res.status(200).json(ret).end();
				}
			}
		}
	);
});

module.exports = router;