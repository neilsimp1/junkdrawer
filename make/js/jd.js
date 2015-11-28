$(document).ready(function(){
	loadScripts();
});

function clearInput(){document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML = '';}

function changeScreen(html){
	var wrapper = $I('wrapper');
	$($(wrapper).wrapInner('<div style="position:relative;">')[0].children).animate({top: '-5000px'}, 500 
		,function(){this.innerHTML = '';}
	);
	var div = $('<div style="position:relative;top:5000px;">').html(html)[0];
	wrapper.appendChild(div);
	$(div).animate({top: '0'}, 500
		,function(){
			$(this).replaceWith(function(){return $(this.children, this);});
			loadScripts();
		}
	);

	window.location.hash = '';
}

function getUser(){return JSON.parse($I('user').value);}

function csrf(_csrf){
	if(_csrf) $I('_csrf').value = _csrf;
	else return $I('_csrf').value;
}

function loadScripts(){
	var scripts =  $I('_scripts').value.split(' ');
	var cnt = 0;
	for(var i = 0; i < scripts.length; i++){
		var script = document.createElement('script');
		script.src = scripts[i];
		script.setAttribute('defer', 'defer');
		script.onload = function(){cnt++;callInit();}
		document.head.appendChild(script);
	}

	function callInit(){
		if(cnt === scripts.length) window[_scripts.getAttribute('data-init')]();
	}
}

function $I(i){return document.getElementById(i);}

//temp bullshit
function validateFiles(){return true;}