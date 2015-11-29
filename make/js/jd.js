class JD{

	constructor(){
		this.controls = {};
		this.page = {};
		this._user = $I('_user');
		this._error = $I('_error');
		this._csrf = $I('_csrf');
	}
	
	get user(){return JSON.parse(_user.value || null);}
	set user(user){this._user.value = JSON.stringify(user);}

	get error(){return JSON.parse(_error.value || null);}
	set error(error){this._error.value = JSON.stringify(error);}

	get csrf(){return _csrf.value || null;}
	set csrf(csrf){this._csrf.value = csrf;}

	static loadScripts(){
		let scripts = $I('_scripts').value.split(' ');
		let cnt = 0;
		for(let i = 0; i < scripts.length; i++){
			var script = document.createElement('script');
			script.src = scripts[i];
			script.setAttribute('defer', 'defer');
			script.onload = function () { cnt++; callInit(); }
			document.head.appendChild(script);
		}

		function callInit(){
			if(cnt === scripts.length) window[_scripts.getAttribute('data-init')]();
		}
	}

	changeScreen(html){
		var wrapper = $I('wrapper');
		$($(wrapper).wrapInner('<div style="position:relative;">')[0].children).animate({top: '-5000px'}
			,500, function(){this.innerHTML = '';}
		);
		var div = $('<div style="position:relative;top:5000px;">').html(html)[0];
		wrapper.appendChild(div);
		$(div).animate({top: '0'}, 500
			, function(){
				$(this).replaceWith(function () { return $(this.children, this); });
				JD.loadScripts();
			}
		);

		window.location.hash = '';
	}

}

$(document).ready(function(){
	JD.loadScripts();
	jd = new JD();
});



function $I(i){return document.getElementById(i);}

//temp bullshit
function validateFiles(){return true;}