$(document).ready(function(){init();});

function init(){
	app = {};
	app.changeScreen = changeScreen;
    app.mainContainers = document.querySelectorAll('.main-container');
	if(app.mainContainers.length === 0) return;
    app.resizers = document.querySelectorAll('.resize a');
    app.resizers.state = 2;
    setDraggerIcons();
    window.onresize = function(){setDraggerIcons(); resize('default');};
    $('#input').bind('dragover drop', function(e){e.preventDefault(); return false;});

	var editor = new wysihtml5.Editor('input', {
        toolbar: 'wysihtml5-toolbar'
        ,parserRules:  wysihtml5ParserRules
        ,stylesheets: ['css/wysihtml5.css']
    });

	$('#post').on('click', post);
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

function clearInput(){document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML = '';}

function changeScreen(html){
	//document.getElementById('wrapper').innerHTML = html;
	
	var asd = $($('#wrapper').wrapInner('<div>')[0].children);
	//asd.animate({left: '50%'}, 1000, 
	//	function(){
	//		//$(this).remove();
	//	});

	init();
	window.location.hash = '';
}

function post(){
	var text = document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML
		,files = document.getElementById('fileinput').files
		,user = JSON.parse(document.getElementById('user').value);

	var asd = 123;
	//$.post('/post', {
	//		id: user._id
	//	})
}

//BELOW, not needed, but keeping for possible future reference
//insertTextAtCursor is from SO, but passing in iframeDoc to show how to get that element in JS

//function insertLink(button){
//	var iframeDoc = document.querySelector('.wysihtml5-sandbox').contentDocument;
//	insertTextAtCursor('[link](url)', iframeDoc);
//	$(iframeDoc.body).on('keyup', function(){
//		var text = this.textContent;
//		var validRegEx = /\[(.*?)\]\(((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)\)/;
//		var missingRegEx = /\[(.*?)\]\((.*?)\)/;

//		toolbarEnableDisable(button);

//		if(validRegEx.test(text)){
//			//replace [link](url) w/ <a href>
//			var substr_startOfSquare = text.substring(validRegEx.search(text), text.length - 1);

//			toolbarEnableDisable(button, true);
//			$(this).off('keyup');
//		}
//		else if(missingRegEx.test(text)){
//			toolbarEnableDisable(button, true);
//			$(this).off('keyup');
//		}
//	});
//	var aaaaa = $('#inputcontainer');
//}

//function toolbarEnableDisable(button, enable){
//	if(enable){
//		button.classList.remove('wysihtml5-command-active');
//		button.removeAttribute('unselectable');
//		button.disabled = false;
//	}
//	else{
//		button.classList.add('wysihtml5-command-active');
//		button.setAttribute('unselectable', 'on');
//		button.disabled = true;
//	}
//}

//function insertTextAtCursor(text, iframeDoc){
//    var sel, range, html;
//    if(window.getSelection){
//        sel = iframeDoc.getSelection();
//        if(sel.getRangeAt && sel.rangeCount){
//            range = sel.getRangeAt(0);
//            range.deleteContents();
//            range.insertNode(document.createTextNode(text));
//        }
//    }
//	else if(document.selection && document.selection.createRange){
//        document.selection.createRange().text = text;
//    }
//}



//temp bullshit
function validateFiles(){return true;}