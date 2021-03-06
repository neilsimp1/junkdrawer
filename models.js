'use strict';

let mongoose = require('mongoose');

let Schema = mongoose.Schema
	,ObjectId = Schema.ObjectId;

module.exports.User = mongoose.model('User'
	,new Schema({
		id: ObjectId
		,oauthID: {type: Number, unique: true}
		,username: {type: String, required: '{PATH} is required.', unique: true}
		,email: {type: String, unique: true}
		,password: {type: String}
		,settings: {type: [Schema.Types.Mixed], required: '{PATH} is required.'}
	})
	,'user'
);

module.exports.Folder = mongoose.model('Folder'
	,new Schema({
		id: ObjectId
		,userid: {type: ObjectId, required: '{PATH} is required.', ref: 'User'}
		,name: {type: String, required: '{PATH} is required.'}
		,active: {type: Boolean, required: '{PATH} is required.', default: true}
		,posts: [{type: ObjectId, ref: 'Post'}]
	})
	,'folder'
);

module.exports.Post = mongoose.model('Post'
	,new Schema({
		id: ObjectId
		,userid: {type: ObjectId, required: '{PATH} is required.', ref: 'User'}
		,folderid: {type: ObjectId, required: '{PATH} is required.', ref: 'Folder'}
		,datetime: {type: Date, required: '{PATH} is required.'}
		,text: {type: String, required: '{PATH} is required.'}
	})
	,'post'
);

module.exports.File = mongoose.model('File'
	,new Schema({
		id: ObjectId
		,postid: {type: ObjectId, required: '{PATH} is required.', ref: 'User'}
		,ext: {type: Date, required: '{PATH} is required.'}
		,type: {type: String, required: '{PATH} is required.'}
		,content: {type: String, required: '{PATH} is required.'}
	})
	,'file'
);