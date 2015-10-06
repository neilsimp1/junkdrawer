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


function clearInput(){document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML = '';}

function changeScreen(html){
	var wrapper = document.getElementById('wrapper');
	$($(wrapper).wrapInner('<div style="position:relative;">')[0].children).animate({top: '-5000px'}, 500 
		,function(){this.innerHTML = '';}
	);
	var div = $('<div style="position:relative;top:5000px;">').html(html)[0];
	wrapper.appendChild(div);
	$(div).animate({top: '0'}, 500
		,function(){
			init();
			$(this).replaceWith(function(){return $(this.children, this);});
		}
	);

	window.location.hash = '';
}

function getUser(){return JSON.parse(document.getElementById('user').value);}

function getCsrf(){return document.getElementById('_csrf').value;}

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