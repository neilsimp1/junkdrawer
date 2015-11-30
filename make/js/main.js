function init_main(){

	//controls
	jd.controls.clear = $I('button_clear');
	jd.controls.resizers = document.querySelectorAll('.resize a');
    jd.controls.resizers.state = 2;

	//page
    jd.page.mainContainers = document.querySelectorAll('.main-container');
	if(jd.page.mainContainers.length === 0) return;
    
	//functions
	(jd.page.setDraggerIcons = function(){
		if(JD.isMobile()){
			jd.controls.resizers[0].children[0].className = jd.controls.resizers[0].children[0].className.replace('left', 'up');
			jd.controls.resizers[1].children[0].className = jd.controls.resizers[1].children[0].className.replace('right', 'down');
		}
		else{
			jd.controls.resizers[0].children[0].className = jd.controls.resizers[0].children[0].className.replace('up', 'left');
			jd.controls.resizers[1].children[0].className = jd.controls.resizers[1].children[0].className.replace('down', 'right');
		}
	})();
	
	jd.page.resize = function(e){
		let outputW, outputH, inputW, inputH;
		function setContainers(){
			switch(jd.controls.resizers.state){
				case 0: outputW = 'calc(10% - 2px)'; inputW = 'calc(90% - 2px)'; outputH = '12vh'; inputH = '80vh'; break;
				case 1: outputW = 'calc(25% - 2px)'; inputW = 'calc(75% - 2px)'; outputH = '23vh'; inputH = '69vh'; break;
				case 2: outputW = 'calc(50% - 2px)'; inputW = 'calc(50% - 2px)'; outputH = '46vh'; inputH = '46vh'; break;
				case 3: outputW = 'calc(75% - 2px)'; inputW = 'calc(25% - 2px)'; outputH = '69vh'; inputH = '23vh'; break;
				case 4: outputW = 'calc(90% - 2px)'; inputW = 'calc(10% - 2px)'; outputH = '80vh'; inputH = '12vh';
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

				outputH = '12vh';
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
					$(jd.page.mainContainers[0]).css({width: '100%', height: '46vh'});
					$(jd.page.mainContainers[1]).css({width: '100%', height: '46vh'});
				}
				else{
					$(jd.page.mainContainers[0]).css({width: 'calc(50% - 2px)', height: '94vh'});
					$(jd.page.mainContainers[1]).css({width: 'calc(50% - 2px)', height: '94vh'});
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

	jd.page.post = function(){
		let text = document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML
			,files = $I('fileinput').files
			,user = getUser();

		$.post('/post', {
				id: user._id
				,text: text
				,files: files
			}
			,function(ret){
				console.log(ret);
			}
		).fail(function(){
			alert('what the fuck');
		});
	};
	
	//wysihtml
	jd.page.editor = new wysihtml5.Editor('input', {
        toolbar: 'wysihtml5-toolbar'
        ,parserRules:  wysihtml5ParserRules
        ,stylesheets: ['css/wysihtml.css']
    });

	//bindings
	window.onresize = function(e){jd.page.setDraggerIcons(); jd.page.resize(e);};
    $('#input').bind('dragover drop', function(e){e.preventDefault(); return false;});
	$('#post').on('click', jd.page.post);
	$('#button_clear').on('click', jd.page.clear);
	jd.page.editor.on('focus', jd.page.resize);
	$('#button_clear').on('click', function(){jd.page.editor.composer.clear();});
	$(jd.controls.resizers).on('click', jd.page.resize);

}