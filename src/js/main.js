function init_main(){

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

	jd.post = function(){
		if(!jd.validator.post()){
			//let files = $I('fileinput').files;
			
			$.post('post', {
				folderid: jd.getActiveFolderID()
				,text: document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML
				//,files: files
				,_csrf: jd.csrf
			})
			.done(function(ret){
				jd.showPosts(ret);
			})
			.fail(function(ret){
				alert('what the fuck');
			});
		}
	};

	jd.getFolder = function(id){
		id = id || jd.getActiveFolderID();

		$.get('folder/' + id)
		.done(function(ret, statusText, xhr){
			if(xhr.status === 204){//empty folder
				$I('output').innerHTML = 'Empty folder mother fucker';
			}
			else{
				
				jd.showPosts();
			}
		})
		.fail(function(ret, statusText, xhr){
			console.log(ret.error.message);
		});
	};

	jd.getActiveFolderID = function(){
		let folders = jd.user.folders;
		for(let i = 0; i < folders.length; i++){if(folders[i].active) return folders[i]._id;}
	};

	jd.validator.post = function(){
		return jd.page.editor.composer.element.innerHTML === '' || jd.page.editor.composer.element.innerHTML === 'Put stuff here, bro...';
	}
    
	//wysihtml
	jd.page.editor = new wysihtml5.Editor('input', {
        toolbar: 'wysihtml5-toolbar'
        ,parserRules:  wysihtml5ParserRules
        ,stylesheets: ['css/wysihtml.css']
    });

	//bindings
	window.onresize = function(e){jd.page.setDraggerIcons(); jd.page.resize(e);};
    $('#input').bind('dragover drop', function(e){e.preventDefault(); return false;});
	$('#button_post').on('click', jd.post);
	$('#button_clear').on('click', jd.page.clear);
	jd.page.editor.on('focus', jd.page.resize);
	$('#button_clear').on('click', function(){jd.page.editor.composer.clear();});
	$(jd.controls.resizers).on('click', jd.page.resize);

	jd.page.setDraggerIcons();
	jd.getFolder();
}