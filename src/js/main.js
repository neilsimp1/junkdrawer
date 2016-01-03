function init_main(){
	jd.folder = new Folder();
	jd.post = new Post();

	//controls
	jd.controls.clear = $I('button_clear');
	jd.controls.resizers = document.querySelectorAll('.resize a');
    jd.controls.resizers.state = 2;

	//page
    jd.page.mainContainers = document.querySelectorAll('.main-container');
	if(jd.page.mainContainers.length === 0) return;

	//functions
	jd.page.setDraggerIcons = function(){
		if(JD.isMobile()){
			jd.controls.resizers[0].children[0].className = jd.controls.resizers[0].children[0].className.replace('left', 'up');
			jd.controls.resizers[1].children[0].className = jd.controls.resizers[1].children[0].className.replace('right', 'down');
		}
		else{
			jd.controls.resizers[0].children[0].className = jd.controls.resizers[0].children[0].className.replace('up', 'left');
			jd.controls.resizers[1].children[0].className = jd.controls.resizers[1].children[0].className.replace('down', 'right');
		}
	};
	
	jd.page.resize = function(e){
		let outputW, outputH, inputW, inputH;
		function setContainers(){
			switch(jd.controls.resizers.state){
				case 0: outputW = 'calc(10% - 2px)'; inputW = 'calc(90% - 2px)'; outputH = '10vh'; inputH = '80vh'; break;
				case 1: outputW = 'calc(25% - 2px)'; inputW = 'calc(75% - 2px)'; outputH = '25vh'; inputH = '65vh'; break;
				case 2: outputW = 'calc(50% - 2px)'; inputW = 'calc(50% - 2px)'; outputH = '45vh'; inputH = '45vh'; break;//
				case 3: outputW = 'calc(75% - 2px)'; inputW = 'calc(25% - 2px)'; outputH = '65vh'; inputH = '25vh'; break;
				case 4: outputW = 'calc(90% - 2px)'; inputW = 'calc(10% - 2px)'; outputH = '80vh'; inputH = '10vh';
			}
			if(JD.isMobile()){
				jd.page.mainContainers[0].style.height = outputH;
				jd.page.mainContainers[1].style.height = inputH;
			}
			else{
				jd.page.mainContainers[0].style.width = outputW;
				jd.page.mainContainers[1].style.width = inputW;
			}
		}

		switch(e.type){
			case 'focus':
				if(JD.isMobile()){
					let saveState = jd.controls.resizers.state;
					jd.controls.resizers.state = 0;

					outputH = '10vh';
					inputH = '80vh';
					jd.page.editor.on('blur', function(){
						jd.controls.resizers.state = saveState;
						jd.page.editor.off('blur');
						setContainers();
					});
					setContainers();
				}
				break;
			case 'resize':
				jd.controls.resizers.state = 2;
				if(JD.isMobile()){
					$(jd.page.mainContainers[0]).css({width: '100%', height: '45vh'});
					$(jd.page.mainContainers[1]).css({width: '100%', height: '45vh'});
				}
				else{
					$(jd.page.mainContainers[0]).css({width: 'calc(50% - 2px)', height: '92vh'});
					$(jd.page.mainContainers[1]).css({width: 'calc(50% - 2px)', height: '92vh'});
				}
				break;
			case 'click':
				let dir = $(e.currentTarget).data('dir');
				if(dir){
					if(dir === 'rd'){if(jd.controls.resizers.state < 4) jd.controls.resizers.state++;}
					else if(jd.controls.resizers.state > 0) jd.controls.resizers.state--;
				}
				setContainers();
				break;
		}
	};

	jd.date.format = function(datetime){
		let dt = new Date(datetime);
		let mm = dt.getMonth() + 1
			,dd = dt.getDate()
			,yy = dt.getFullYear()
			,h = dt.getHours() > 12? dt.getHours() - 12: dt.getHours()
			,m = dt.getMinutes() < 10? '0' + (dt.getMinutes() + 1): dt.getMinutes()
			,ap = dt.getHours() < 12? 'am': 'pm'

		return mm + '/' + dd + '/' + yy + ' ' + h + ':' + m + ' ' + ap;
	};
	
	jd.getActiveFolderID = function(){
		let folders = jd.user.folders;
		for(let i = 0; i < folders.length; i++){if(folders[i].active) return folders[i]._id;}
	};

	jd.validator.post = function(){
		return jd.page.editor.composer.element.innerHTML === '' || jd.page.editor.composer.element.innerHTML === 'Put stuff here, bro...';
	};
    
	//wysihtml
	jd.page.editor = new wysihtml5.Editor('input', {
        toolbar: 'wysihtml5-toolbar'
        ,parserRules:  wysihtml5ParserRules
        ,stylesheets: ['css/wysihtml.css']
    });

	//		bindings
	window.onresize = function(e){jd.page.setDraggerIcons(); jd.page.resize(e);};
    $('#input').bind('dragover drop', function(e){e.preventDefault(); return false;});
	$('#button_clear').on('click', jd.page.clear);
	jd.page.editor.on('focus', jd.page.resize);
	$('#button_clear').on('click', function(){jd.page.editor.composer.clear();});
	$(jd.controls.resizers).on('click', jd.page.resize);
	//post
	$('#button_post').on('click', jd.post.add);
	$('#output').on('click', '.post', function(){jd.post.toggle(this);});
	$('#output').on('click', '.post-fullscreen', function(){jd.post.fullscreen(jd.post.toJSON($(this).parents('div.post')[0]));});

	jd.page.setDraggerIcons();
	jd.folder.get();
}