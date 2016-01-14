function init_main(){
	jd.folder = new Folder();
	jd.post = new Post();

	//controls
	jd.controls.clear = $I('button_clear');
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
					//let saveState = jd.controls.resizers.state;
					//jd.controls.resizers.state = 0;

					//outputH = '10vh';
					//inputH = '80vh';
					//jd.page.editor.on('blur', function(){
					//	jd.controls.resizers.state = saveState;
					//	jd.page.editor.off('blur');
					//	setContainers();
					//});
					//setContainers();
				}
				break;
			case 'resize':
				let ratio = jd.page.ratio;
				if(JD.isMobile()){
					//jd.page.$output.css('height', (ratio / 2) - (window.clientHeight * 0.1));
					//$(jd.page.$middlebar).css('top', jd.page.$output[0].clientHeight);
					//$(jd.page.mainContainers[1]).css({width: '100%', height: '45vh'});

					//TODO: this shit's all fucked
					////if(ratio > 0 && ratio <= 0.5){
					////	jd.page.$output.css('height', '10vh');
					////	jd.page.$middlebar.css('top', '10vh');
					////	jd.page.$input.css({height: '80vh', top: '12vh'});
					////}
					////else if(ratio > 0.5 && ratio <= 1){
					////	jd.page.$output.css('height', '30vh');
					////	jd.page.$middlebar.css('top', '30vh');
					////	jd.page.$input.css({height: '60vh', top: '32vh'});
					////}
					////else if(ratio > 1 && ratio <= 1.5){
					////	jd.page.$output.css('height', '60vh');
					////	jd.page.$middlebar.css('top', '60vh');
					////	jd.page.$input.css({height: '30vh', top: '62vh'});
					////}
					////else if(ratio > 1.5 && ratio <= 2){
					////	jd.page.$output.css('height', '80vh');
					////	jd.page.$middlebar.css('top', '80vh');
					////	jd.page.$input.css({height: '10vh', top: '82vh'});
					////}
				}
				else{
					$(jd.page.mainContainers[0]).css({width: 'calc(50% - 4px)', height: '92vh'});
					$(jd.page.mainContainers[1]).css({width: 'calc(50% - 4px)', height: '92vh'});
				}
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
					
					if(!jd.page.isResizing) return;
					if(!takeItToTheLimit()) return;
					let offset = window[innerWH] - e[clientXY];
					
					if(isMobile){
						let outputHeight = window.innerHeight - offset;
						jd.page.$output.css({bottom: offset, height: outputHeight});
						jd.page.$middlebar.css('top', jd.page.$output[0].clientHeight);
						jd.page.$input.css({
							top: jd.page.$output[0].clientHeight + jd.page.$middlebar[0].clientHeight
							,height: (window.innerHeight - jd.page.$bottombar[0].clientHeight) - (outputHeight + jd.page.$middlebar[0].clientHeight)
						});
						jd.page.ratio = jd.page.$output[0].clientHeight / jd.page.$input[0].clientHeight;
					}
					else{
						jd.page.$output.css('right', offset + 4);
						jd.page.$input.css('width', offset - 4);
						jd.page.$middlebar.css('left', jd.page.$output[0].clientWidth);
						jd.page.ratio = jd.page.$output[0].clientWidth / jd.page.$input[0].clientWidth;
					}
				}).on('mouseup', function(e){
					jd.page.isResizing = false;
					jd.page.editor.composer.editableArea.style.display = 'inline-block';
					jd.page.updateRatio();
				});
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

	//bindings
	window.onresize = function(e){jd.page.resize(e);};
    $('#input').bind('dragover drop', function(e){e.preventDefault(); return false;});
	$('#button_clear').on('click', jd.page.clear);
	//jd.page.editor.on('focus', jd.page.resize);
	$(jd.controls.clear).on('click', function(){jd.page.editor.composer.clear();});
	$('#button_post').on('click', jd.post.add);
	$('#output').on('click', '.post', function(){jd.post.toggle(this);});
	$('#output').on('click', '.post-fullscreen', function(){jd.post.fullscreen(jd.post.toJSON($(this).parents('div.post')[0]));});
	jd.page.$middlebar.on('mousedown', jd.page.resize);



	//jd.page.$middlebar.on('mousedown', function(e){
 //       jd.page.isResizing = true;
 //       jd.page.lastDownX = e.clientX;
	//	jd.page.editor.composer.editableArea.style.display = 'none';
	//	$(document).on('mousemove', function(e){
	//		if(!jd.page.isResizing) return;
	//		let offsetRight = jd.page.$wrapper.width() - (e.clientX - jd.page.$wrapper.offset().left);
	//		jd.page.$output.css('right', offsetRight + 4);
	//		jd.page.$input.css('width', offsetRight - 4);
	//		jd.page.$middlebar.css('left', jd.page.$output[0].clientWidth);
	//	}).on('mouseup', function(e){
	//		jd.page.isResizing = false;
	//		jd.page.editor.composer.editableArea.style.display = 'inline-block';
	//	});
 //   });
    




	jd.folder.get();
}