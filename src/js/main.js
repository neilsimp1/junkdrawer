﻿function init_main(){
	jd.folder = new Folder();
	jd.post = new Post();

	//controls
	jd.controls.clear = $I('button_clear');
	jd.controls.post_id = $I('post_id');
	jd.page.$wrapper = $('#wrapper');
    jd.page.$output = jd.page.$wrapper.children().eq(0);
    jd.page.$middlebar = jd.page.$wrapper.children().eq(1);
    jd.page.$input = jd.page.$wrapper.children().eq(2);
	jd.page.$bottombar = jd.page.$wrapper.children().eq(3);
	
	//functions
	jd.page.resize = function(e){
		switch(e.type){
			case 'focus':
				if(JD.isMobile()){
					let outputH = jd.page.$output[0].clientHeight, inputH = jd.page.$input[0].clientHeight;

					jd.page.$output.css('height', window.innerHeight * 0.1);
					jd.page.$middlebar.css('top', jd.page.$output[0].clientHeight);
					jd.page.$input.css({
						height: (window.innerHeight - jd.page.$bottombar[0].clientHeight) - (jd.page.$output[0].clientHeight + jd.page.$middlebar[0].clientHeight)
						, top: jd.page.$output[0].clientHeight + jd.page.$middlebar[0].clientHeight
					});
					
					jd.page.editor.on('blur', function(){
						jd.page.$output.css('height', outputH);
						jd.page.$middlebar.css('top', jd.page.$output[0].clientHeight);
						jd.page.$input.css({height: inputH, top: jd.page.$output[0].clientHeight + jd.page.$middlebar[0].clientHeight});
						jd.page.editor.off('blur');
					});
				}
				break;
			case 'resize':
				let ratio = jd.page.ratio;
				if(JD.isMobile()){
					let outputH = (window.innerHeight - jd.page.$bottombar[0].clientHeight) * ratio;
					$(jd.page.$output).css({
						width: '100%'
						, height: outputH
						, left: 0
					});
					$(jd.page.$middlebar).css({top: outputH, left: 0});
					$(jd.page.$input).css({
						width: '100%'
						, height: window.innerHeight - outputH - jd.page.$middlebar[0].clientHeight - jd.page.$bottombar[0].clientHeight
						, top: outputH + jd.page.$middlebar[0].clientHeight
					});
					jd.page.updateRatio(true);
				}
				else{
					let outputW = (window.innerWidth - jd.page.$middlebar[0].clientWidth) * ratio;
					$(jd.page.$output).css({
						width: outputW
						, height: '92vh'
						, bottom: jd.page.$bottombar[0].clientHeight
					});
					$(jd.page.$middlebar).css({top: 0, left: jd.page.$output[0].clientWidth});
					$(jd.page.$input).css({
						width: window.innerWidth - outputW - jd.page.$middlebar[0].clientWidth
						, height: '92vh'
						, top: 0
					});
					jd.page.updateRatio(false);
				}

				//if(JD.isMobile()){
				//	$(jd.page.$output).css({
				//		width: '100%'
				//		, height: '45vh'
				//		, left: 0
				//	});
				//	$(jd.page.$middlebar).css({top: '45vh', left: 0});
				//	$(jd.page.$input).css({
				//		width: '100%'
				//		, height: '45vh'
				//		, top: '47vh'
				//	});
				//	jd.page.updateRatio(true);
				//}
				//else{
				//	$(jd.page.$output).css({
				//		width: 'calc(50% - 4px)'
				//		, height: '92vh'
				//		, bottom: jd.page.$bottombar[0].clientHeight
				//	});
				//	$(jd.page.$middlebar).css({top: 0, left: jd.page.$output[0].clientWidth});
				//	$(jd.page.$input).css({
				//		width: 'calc(50% - 4px)'
				//		, height: '92vh'
				//		, top: 0
				//	});
				//	jd.page.updateRatio(false);
				//}
				break;
			case 'mousedown':
				let clientXY, innerWH;
				let isMobile = JD.isMobile();
				if(isMobile){
					clientXY = 'clientY';
					innerWH = 'innerHeight';
				}
				else{
					clientXY = 'clientX';
					innerWH = 'innerWidth';
				}

				jd.page.isResizing = true;
				jd.page.editor.composer.editableArea.style.display = 'none';
				$(document).on('mousemove', function(e){
					function takeItToTheLimit(){
						if(isMobile){
							let minH = window.innerHeight * 0.1;
							return e.clientY >= minH && e.clientY < (window.innerHeight - (minH * 1.7))
						}
						else return e.clientX >= window.innerWidth * 0.1 && e.clientX < window.innerWidth * 0.9
					}
										
					isMobile = JD.isMobile();
					if(!jd.page.isResizing) return;
					if(!takeItToTheLimit()) return;
					let offset = window[innerWH] - e[clientXY];
					
					if(isMobile){
						let outputHeight = window.innerHeight - offset;
						jd.page.$output.css({bottom: offset, height: outputHeight});
						jd.page.$middlebar.css('top', jd.page.$output[0].clientHeight);
						jd.page.$input.css({
							top: jd.page.$output[0].clientHeight + jd.page.$middlebar[0].clientHeight
							, height: (window.innerHeight - jd.page.$bottombar[0].clientHeight) - (outputHeight + jd.page.$middlebar[0].clientHeight)
						});
					}
					else{
						jd.page.$output.css({width: 'initial', right: offset + 4});
						jd.page.$input.css('width', offset - 4);
						jd.page.$middlebar.css('left', jd.page.$output[0].clientWidth);
					}
				}).on('mouseup', function(e){
					jd.page.isResizing = false;
					jd.page.editor.composer.editableArea.style.display = 'inline-block';
					jd.page.updateRatio(isMobile);
				});
				break;
		}
	};

	jd.date.format = function(datetime){
		let dt = new Date(datetime);
		let mm = dt.getMonth() + 1
			, dd = dt.getDate()
			, yy = dt.getFullYear()
			, h = dt.getHours() > 12? dt.getHours() - 12: dt.getHours()
			, m = dt.getMinutes() < 10? '0' + (dt.getMinutes() + 1): dt.getMinutes()
			, ap = dt.getHours() < 12? 'am': 'pm'

		return mm + '/' + dd + '/' + yy + ' ' + h + ':' + m + ap;
	};
	
	jd.getActiveFolderID = function(){
		let folders = jd.user.folders;
		for(let i = 0; i < folders.length; i++){if(folders[i].active) return folders[i]._id;}
	};
	jd.getActivePostID = function(){
		if(jd.page.editor.isEmpty()){
			jd.controls.post_id.value = '';
		}
		return jd.controls.post_id.value;
	};

	jd.validator.post = function(){
		return jd.page.editor.isEmpty();
	};

	jd.page.updateRatio = function(isMobile){
		if(typeof isMobile === 'undefined') isMobile = JD.isMobile();
		let ratio = isMobile? jd.page.$output[0].clientHeight / jd.page.$input[0].clientHeight: jd.page.ratio = jd.page.$output[0].clientWidth / jd.page.$input[0].clientWidth;
		//let ratio = isMobile?
		//	(window.innerHeight - jd.page.$bottombar[0].clientHeight) / (jd.page.$output[0].clientHeight + jd.page.$middlebar[0].clientHeight / 2):
		//	(window.inner - jd.page.$middlebar[0].clientWidth) / jd.page.$output[0].clientWidth;
		jd.page.ratio = (Math.floor(ratio) * 50) / 100;
	};
    
	//wysihtml
	jd.page.editor = new wysihtml5.Editor('input', {
        toolbar: 'wysihtml5-toolbar'
        , parserRules:  wysihtml5ParserRules
        , stylesheets: ['css/wysihtml.css']
    });
	jd.page.editor.isEmpty = function(){
		return jd.page.editor.composer.element.innerHTML === '' || jd.page.editor.composer.element.innerHTML === 'Put stuff here, bro...';
	};

	//bindings
	window.onresize = function(e){jd.page.resize(e);};
    $('#input').bind('dragover drop', function(e){e.preventDefault(); return false;});
	$('#button_clear').on('click', jd.page.clear);
	jd.page.editor.on('focus', jd.page.resize);
	$(jd.controls.clear).on('click', function(){jd.page.editor.composer.clear();});
	$('#button_post').on('click', function(){
        //let files = $I('fileinput').files;
		let post = {
			_id: jd.getActivePostID()
			, folderid: jd.getActiveFolderID()
			, text: jd.page.editor.composer.getValue()
			//, files: files
		};
        
        if(post._id){
            //$('.edit-post-confirm, #button_post, #button_filemenu').animate({width: 'toggle'});
            $('.edit-post-confirm').animate({width: 'toggle'}, 250).css('display', 'inline-block');
            
            return;
        }
        
        jd.post.save();
        jd.controls.post_id.value = '';
    });
	$('#output').on('click', '.post', function(e){
		if(e.target.className.indexOf('post-btn') !== -1) return false;
		if(getSelection().toString()) return false;
		if(e.target.tagName.toUpperCase() !== 'A') jd.post.toggle(this);
	});
	$('#output').on('click', '.post-fullscreen', function(){jd.post.fullscreen(jd.post.toJSON($(this).parents('div.post')[0]));});
	$('#output').on('click', '.post-edit', function(){jd.post.edit(jd.post.toJSON($(this).parents('div.post')[0]));});
	jd.page.$middlebar.on('mousedown', jd.page.resize);
	
	jd.folder.get();
}