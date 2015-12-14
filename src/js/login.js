function init_login(){

	//functions
	jd.validator.login = function(){
		if($I('textbox_username_login').value === ''){
			var error = {
				'page': 'login'
				,'origin': 'u'
				,'message': 'Please enter a username'
			};
			return error;
		}
		else if($I('textbox_password_login').value === ''){
			var error = {
				'page': 'login'
				,'origin': 'pw'
				,'message': 'Please enter a password'
			};
			return error;
		}

		return false;
	};

	jd.validator.register = function(){
		if($I('textbox_username_register').value === ''){
			var error = {
				'page': 'register'
				,'origin': 'u'
				,'message': 'Please enter a username'
			};
			return error;
		}
		else if($I('textbox_email_register').value === ''){
			var error = {
				'page': 'register'
				,'origin': 'e'
				,'message': 'Please enter an email'
			};
			return error;
		}
		else if($I('textbox_password_register').value !== $I('textbox_confirmpassword_register').value){
			var error = {
				'page': 'register'
				,'origin': 'pw'
				,'message': 'Please confirm your password'
			};
			return error;
		}
		
		return false;
	}

	jd.login.changeMenu = function(speed, to, from){
		let span_loginregister = $I('span_loginregister')
			,loginregwith = document.querySelector('.loginregwith')
			,thisWidth = span_loginregister.clientWidth
			,parentWidth = span_loginregister.parentNode.clientWidth;

		$('.login-toggle.active').removeClass('active');
		$('.login-toggle[data-form=' + to + ']').addClass('active');

		if(to === 'needhelp'){//from login to needhelp
			$(span_loginregister).animate({width: 'toggle', left: (parentWidth * 0.95) - thisWidth + 'px'}, speed);
			$('#span_backToLogin').animate({width: 'toggle'}, speed);
			$('#div_loginform, #div_needhelp, #div_oauthwrapper').animate({height: 'toggle'}, speed);
		}
		else{
			if(to === 'login'){
				if(from === 'needhelp'){//from needhelp to login
					$(span_loginregister).animate({width: 'toggle', left: '5%'}, speed);
					$('#span_backToLogin').animate({width: 'toggle'}, speed);
					$('#div_loginform, #div_needhelp, #div_oauthwrapper').animate({height: 'toggle'}, speed);
				}
				else{//from reg to login 
					$(span_loginregister).animate({left: '5%'}, speed);
					$('#span_login').unwrap('<a>');
					$('#span_register').wrap('<a href="#register">');
					loginregwith.innerHTML = loginregwith.innerHTML.replace('Register using', 'Log in with');
					$('#div_loginform, #div_registerform').animate({height: 'toggle'}, speed);
				}
			}
			else{//from login to register
				$(span_loginregister).animate({left: (parentWidth * 0.95) - thisWidth + 'px'}, speed);
				$('#span_login').wrap('<a href="#login">');
				$('#span_register').unwrap('<a>');
				loginregwith.innerHTML = loginregwith.innerHTML.replace('Log in with', 'Register using');
				$('#div_loginform, #div_registerform').animate({height: 'toggle'}, speed);
			}
		}
	}

	jd.login.login = function(){
		let error = jd.validator.login();
		if(error) jd.showError(error);
		else{
			$.post('login', $(this.form).serialize()+'&'+$.param({'_csrf': jd.csrf}))
			.done(function(ret){
				jd.changeScreen(ret.html);
			})
			.fail(function(ret){
				if(typeof ret.responseJSON !== 'undefined'){
					if(typeof ret.responseJSON.error === 'object') jd.showError(ret.responseJSON.error);
				}
			});
		}
	}

	jd.login.register = function(){
		let error = jd.validator.register();
		if(error) jd.showError(error);
		else{
			$.post('register', $(this.form).serialize()+'&'+$.param({'_csrf': jd.csrf}))
			.done(function(ret){
				jd.changeScreen(ret.html);
			})
			.fail(function(ret){
				if(typeof ret.responseJSON !== 'undefined'){
					if(typeof ret.responseJSON.error === 'object') jd.showError(ret.responseJSON.error);
				}
			});
		}
	}
		
	//login/register click on load from #
	switch(window.location.hash){
		case '#register': jd.login.changeMenu(0, 'register', 'login'); break;
		case '#help': jd.login.changeMenu(0, 'needhelp', 'login'); break;
	}

	//bindings
	$('.changeMenu').on('click', function(){
		if(this.parentNode.tagName === 'A')
			jd.login.changeMenu(500, $(this).data('form'), $('.login-toggle.active').data('form'));
	});$('#button_resetpassword').on('click', function(){
		
	});
	$('#button_login').on('click', jd.login.login);
	$('#button_register').on('click', jd.login.register);

	//oauth return, show error or load app
	if(jd.error) jd.showError(jd.error);
	if(jd.action && jd.html){
		if(jd.action === 'register' || jd.action === 'login'){
			jd.changeScreen(JSON.parse(jd.html))
			jd.html = '';
			jd.action = '';
		}
	}

}