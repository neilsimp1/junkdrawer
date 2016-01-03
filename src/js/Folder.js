class Folder{

	constructor(){
		
	}

	get(id){
		id = id || jd.getActiveFolderID();

		$.get('folder/' + id)
		.done(function(ret, statusText, xhr){
			if(xhr.status === 204){//empty folder
				$I('output').innerHTML = 'Empty folder mother fucker';
			}
			else jd.folder.show(ret.folder);
		})
		.fail(function(ret, statusText, xhr){
			console.log(ret.error.message);
		});
	}

	add(){
		
	}

	show(folder){
		$I('span_foldername').innerHTML = folder.name;
		folder.posts.reverse();
		for(let i = 0; i < folder.posts.length; i++) jd.post.show(folder.posts[i]);
	}

}