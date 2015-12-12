function init_login(){

	//login/register toggle
	$('.loginreg').on('click', function(){
		if(this.parentNode.tagName !== 'A') return;
		let to = 'register';
		if(this.id === 'span_login') to = 'login';
		loginRegisterToggle(to, 500);
	});

	//login/need help toggle
	$('.loginhelp').on('click', function(){//TODO: put this in a toggle function
		var span_loginregister = $I('span_loginregister');
		var thisWidth = span_loginregister.clientWidth;
		var parentWidth = span_loginregister.parentNode.clientWidth;
		if(this.id === 'a_needhelp'){
			$(span_loginregister).animate({width: 'toggle', left: (parentWidth * 0.95) - thisWidth + 'px'}, 500);
			$('#span_backToLogin').animate({width: 'toggle'}, 500);
			$('#div_loginform').animate({height: 'toggle'}, 500);
			$('#div_needhelp').animate({height: 'toggle'}, 500);
		}
		else{
			$(span_loginregister).animate({width: 'toggle', left: '5%'}, 500);
			$('#span_backToLogin').animate({width: 'toggle'}, 500);
			$('#div_loginform').animate({height: 'toggle'}, 500);
			$('#div_needhelp').animate({height: 'toggle'}, 500);
		}
	});
	
	//login/register click on load from #
	switch(window.location.hash){
		//case '#login': $('#span_login').click(); break;
		//case '#register': $('#span_register').click(); break;
		//case '#help': $('#a_needhelp').click(); break;
		case '#register': loginRegisterToggle('register', 0); break;
		case '#help': $('#a_needhelp').click(); break;
	}

	//form handling
	$('#button_resetpassword').on('click', function(){
		
	});
	$('#button_login').on('click', function(){
		let error = validateLogin();
		if(error) jd.showError(error);
		else{
			$.post('login', $(this.form).serialize()+'&'+$.param({'_csrf': jd.csrf}))
			.done(function(ret){
				jd.changeScreen(ret.html);
			})
			.fail(function(ret){
				if(typeof ret.responseJSON !== 'undefined'){
					if(typeof ret.responseJSON.error === 'object'){
						jd.showError(ret.responseJSON.error);
					}
				}
			});
		}
	});
	$('#button_register').on('click', function(){
		let error = validateRegister();
		if(error) jd.showError(error);
		else{
			$.post('register', $(this.form).serialize()+'&'+$.param({'_csrf': jd.csrf}))
			.done(function(ret){
				jd.changeScreen(ret.html);
			})
			.fail(function(ret){
				if(typeof ret.responseJSON !== 'undefined'){
					if(typeof ret.responseJSON.error === 'object'){
						jd.showError(ret.responseJSON.error);
					}
				}
			});
		}
	});

	//oauth return
	if(jd.error){
		jd.showError(jd.error);
	}
	if(jd.action && jd.html){
		if(jd.action === 'register' || jd.action === 'login'){
			jd.changeScreen(JSON.parse(jd.html))
			jd.html = '';
			jd.action = '';
		}
	}

	function loginRegisterToggle(to, speed){
		var span_loginregister = $I('span_loginregister');
		var thisWidth = span_loginregister.clientWidth;
		var parentWidth = span_loginregister.parentNode.clientWidth;
		if(to === 'login'){
			$(span_loginregister).animate({left: '5%'}, speed);
			$('#span_login').unwrap('<a>');
			$('#span_register').wrap('<a href="#register">');
			$('#div_loginform').animate({height: 'toggle'}, speed);
			$('#div_registerform').animate({height: 'toggle'}, speed);
		}
		else{
			$(span_loginregister).animate({left: (parentWidth * 0.95) - thisWidth + 'px'}, speed);
			$('#span_login').wrap('<a href="#login">');
			$('#span_register').unwrap('<a>');
			$('#div_loginform').animate({height: 'toggle'}, speed);
			$('#div_registerform').animate({height: 'toggle'}, speed);
		}
	}
	
	function validateLogin(){
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
	}

	function validateRegister(){
		return false;
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

	function changeMenu(){

	}

}