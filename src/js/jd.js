class JD{

	constructor(){
		this.controls = {};
		this.page = {};
		this.validator = {};
		this.login = {};
		this.date = {};
		this.post = {};
		this.folder = {};
		this._user = $I('_user');
		this._error = $I('_error');
		this._csrf = $I('_csrf');
		this._html = $I('_html');
		this._action = $I('_action');
		this._hash = window.location.hash;
	}
	
	get user(){return _user.value !== ''? JSON.parse(_user.value): null;}
	set user(user){this._user.value = JSON.stringify(user);}

	get error(){return _error.value !== ''? JSON.parse(_error.value): null;}
	set error(error){this._error.value = JSON.stringify(error);}

	get csrf(){return _csrf.value || null;}
	set csrf(csrf){this._csrf.value = csrf;}

	get html(){return _html.value || null;}
	set html(html){this._html.value = html;}

	get action(){return _action.value || null;}
	set action(action){this._action.value = action;}

	get hash(){return _hash.value || null;}
	set hash(hash){this._hash.value = hash;}

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

	static isMobile(){return window.innerWidth < 768;}

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

	showError(error){
		jd.error = JSON.stringify(error);

		switch(error.page){
			case 'login':
				var errorContainer = document.querySelector('.login-error');
				switch(error.origin){					
					case 'u': $('.error-show-login-u')[0].classList.add('has-error'); break;
					case 'pw': $('.error-show-login-pw').addClass('has-error'); break;
					case 'up': $('.error-show-login').addClass('has-error'); break;
					case 'o': errorContainer = document.querySelector('.login-error-oa'); break;
				}
				$('.error-show-login').on('click', function(){
					this.classList.remove('has-error');
					$(this).siblings('.form-group.has-error').removeClass('has-error');
					errorContainer.className = errorContainer.className.replace('max', 'min');
				});
				break;
			case 'register':
				var errorContainer = document.querySelector('.register-error');
				switch(error.origin){					
					case 'u': $('.error-show-register-ue')[0].classList.add('has-error'); break;
					case 'ue': $('.error-show-register-ue').addClass('has-error'); break;
					case 'e': $('.error-show-register-ue')[1].classList.add('has-error'); break;
					case 'pw': $('.error-show-register-pw').addClass('has-error'); break;
					case 'o': errorContainer = document.querySelector('.register-error-oa'); break;
				}
				$('.error-show-register').on('click', function(){
					this.classList.remove('has-error');
					$(this).siblings('.form-group.has-error').removeClass('has-error');
					errorContainer.className = errorContainer.className.replace('max', 'min');
				});
				break;
		}
		
		errorContainer.innerHTML = error.message;
		errorContainer.className = errorContainer.className.replace('min', 'max');
		console.log(error.message);
	}

}

$(document).ready(function(){
	JD.loadScripts();
	jd = new JD();
});
function $I(i){return document.getElementById(i);}