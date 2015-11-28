function init_main(){
	app = {};
	app.changeScreen = changeScreen;
    app.mainContainers = document.querySelectorAll('.main-container');
	if(app.mainContainers.length === 0) return;
    app.resizers = document.querySelectorAll('.resize a');
    app.resizers.state = 2;
    setDraggerIcons();
    window.onresize = function(){setDraggerIcons(); resize('default');};
    $('#input').bind('dragover drop', function(e){e.preventDefault(); return false;});

	app.editor = new wysihtml5.Editor('input', {
        toolbar: 'wysihtml5-toolbar'
        ,parserRules:  wysihtml5ParserRules
        ,stylesheets: ['css/wysihtml5.css']
    });

	$('#post').on('click', post);
}

function post(){
	var text = document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML
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
}


function resize(dir){
	var outputW, outputH, inputW, inputH;
	if(dir){
		if(dir === 'rd'){if(app.resizers.state < 4) app.resizers.state++;}
		else if(app.resizers.state > 0) app.resizers.state--;
	}
	if(dir === 'default'){
		if(window.innerWidth > 767){
			$(app.mainContainers[0]).css({width: 'calc(50% - 2px)', height: '94vh'});
			$(app.mainContainers[1]).css({width: 'calc(50% - 2px)', height: '94vh'});
		}
		else{
			$(app.mainContainers[0]).css({width: '100%', height: '46vh'});
			$(app.mainContainers[1]).css({width: '100%', height: '46vh'});
		}
	}
	else if(window.innerWidth > 767){
		switch(app.resizers.state){
			case 0: outputW = 'calc(10% - 2px)'; inputW = 'calc(90% - 2px)'; break;
			case 1: outputW = 'calc(25% - 2px)'; inputW = 'calc(75% - 2px)'; break;
			case 2: outputW = 'calc(50% - 2px)'; inputW = 'calc(50% - 2px)'; break;
			case 3: outputW = 'calc(75% - 2px)'; inputW = 'calc(25% - 2px)'; break;
			case 4: outputW = 'calc(90% - 2px)'; inputW = 'calc(10% - 2px)';
		}
		app.mainContainers[0].style.width = outputW;
		app.mainContainers[1].style.width = inputW;
	}
    else{
		switch(app.resizers.state){
			case 0: outputH = '12vh'; inputH = '80vh'; break;
			case 1: outputH = '23vh'; inputH = '69vh'; break;
			case 2: outputH = '46vh'; inputH = '46vh'; break;
			case 3: outputH = '69vh'; inputH = '23vh'; break;
			case 4: outputH = '80vh'; inputH = '12vh';
		}
		app.mainContainers[0].style.height = outputH;
		app.mainContainers[1].style.height = inputH;
	}
}

function setDraggerIcons(){
    if(window.innerWidth > 767){
        app.resizers[0].children[0].className = app.resizers[0].children[0].className.replace('up', 'left');
        app.resizers[1].children[0].className = app.resizers[1].children[0].className.replace('down', 'right');
    }
    else{
        app.resizers[0].children[0].className = app.resizers[0].children[0].className.replace('left', 'up');
        app.resizers[1].children[0].className = app.resizers[1].children[0].className.replace('right', 'down');
    }
}