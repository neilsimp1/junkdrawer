﻿function init_main(){
	
    jd.page.mainContainers = document.querySelectorAll('.main-container');
	if(jd.page.mainContainers.length === 0) return;
    jd.controls.resizers = document.querySelectorAll('.resize a');
    jd.controls.resizers.state = 2;

	jd.page.setDraggerIcons = function(){
		if(window.innerWidth > 767){
			jd.controls.resizers[0].children[0].className = jd.controls.resizers[0].children[0].className.replace('up', 'left');
			jd.controls.resizers[1].children[0].className = jd.controls.resizers[1].children[0].className.replace('down', 'right');
		}
		else{
			jd.controls.resizers[0].children[0].className = jd.controls.resizers[0].children[0].className.replace('left', 'up');
			jd.controls.resizers[1].children[0].className = jd.controls.resizers[1].children[0].className.replace('right', 'down');
		}
	};

	jd.page.resize = function(e){
		let dir = $(e.currentTarget).data('dir');
		let outputW, outputH, inputW, inputH;
		if(dir){
			if(dir === 'rd'){if(jd.controls.resizers.state < 4) jd.controls.resizers.state++;}
			else if(jd.controls.resizers.state > 0) jd.controls.resizers.state--;
		}
		if(dir === 'default'){
			if(window.innerWidth > 767){
				$(jd.page.mainContainers[0]).css({width: 'calc(50% - 2px)', height: '94vh'});
				$(jd.page.mainContainers[1]).css({width: 'calc(50% - 2px)', height: '94vh'});
			}
			else{
				$(jd.page.mainContainers[0]).css({width: '100%', height: '46vh'});
				$(jd.page.mainContainers[1]).css({width: '100%', height: '46vh'});
			}
		}
		else if(window.innerWidth > 767){
			switch(jd.controls.resizers.state){
				case 0: outputW = 'calc(10% - 2px)'; inputW = 'calc(90% - 2px)'; break;
				case 1: outputW = 'calc(25% - 2px)'; inputW = 'calc(75% - 2px)'; break;
				case 2: outputW = 'calc(50% - 2px)'; inputW = 'calc(50% - 2px)'; break;
				case 3: outputW = 'calc(75% - 2px)'; inputW = 'calc(25% - 2px)'; break;
				case 4: outputW = 'calc(90% - 2px)'; inputW = 'calc(10% - 2px)';
			}
			jd.page.mainContainers[0].style.width = outputW;
			jd.page.mainContainers[1].style.width = inputW;
		}
		else{
			switch(jd.controls.resizers.state){
				case 0: outputH = '12vh'; inputH = '80vh'; break;
				case 1: outputH = '23vh'; inputH = '69vh'; break;
				case 2: outputH = '46vh'; inputH = '46vh'; break;
				case 3: outputH = '69vh'; inputH = '23vh'; break;
				case 4: outputH = '80vh'; inputH = '12vh';
			}
			jd.page.mainContainers[0].style.height = outputH;
			jd.page.mainContainers[1].style.height = inputH;
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
	
    jd.page.setDraggerIcons();
    window.onresize = function(){jd.page.setDraggerIcons(); jd.page.resize('default');};
	
	//bindings
    $('#input').bind('dragover drop', function(e){e.preventDefault(); return false;});
	$('#post').on('click', jd.page.post);
	$(jd.controls.resizers).on('click', jd.page.resize);

	//wysihtml
	jd.page.editor = new wysihtml5.Editor('input', {
        toolbar: 'wysihtml5-toolbar'
        ,parserRules:  wysihtml5ParserRules
        ,stylesheets: ['css/wysihtml.css']
    });
	jd.page.editor.clearInput = function(){document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML = '';};

}