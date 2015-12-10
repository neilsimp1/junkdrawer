'use strict';

function init_login() {

	//login/register toggle
	$('.loginreg').on('click', function () {
		if (this.parentNode.tagName !== 'A') return;
		var span_loginregister = $I('span_loginregister');
		var thisWidth = span_loginregister.clientWidth;
		var parentWidth = span_loginregister.parentNode.clientWidth;
		if (this.id === 'span_login') {
			$(span_loginregister).animate({ left: '5%' }, 500);
			$('#span_login').unwrap('<a>');
			$('#span_register').wrap('<a href="#register">');
			$('#div_loginform').animate({ height: 'toggle' }, 500);
			$('#div_registerform').animate({ height: 'toggle' }, 500);
		} else {
			$(span_loginregister).animate({ left: parentWidth * 0.95 - thisWidth + 'px' }, 500);
			$('#span_login').wrap('<a href="#login">');
			$('#span_register').unwrap('<a>');
			$('#div_loginform').animate({ height: 'toggle' }, 500);
			$('#div_registerform').animate({ height: 'toggle' }, 500);
		}
	});

	//login/need help toggle
	$('.loginhelp').on('click', function () {
		var span_loginregister = $I('span_loginregister');
		var thisWidth = span_loginregister.clientWidth;
		var parentWidth = span_loginregister.parentNode.clientWidth;
		if (this.id === 'a_needhelp') {
			$(span_loginregister).animate({ width: 'toggle', left: parentWidth * 0.95 - thisWidth + 'px' }, 500);
			$('#span_backToLogin').animate({ width: 'toggle' }, 500);
			$('#div_loginform').animate({ height: 'toggle' }, 500);
			$('#div_needhelp').animate({ height: 'toggle' }, 500);
		} else {
			$(span_loginregister).animate({ width: 'toggle', left: '5%' }, 500);
			$('#span_backToLogin').animate({ width: 'toggle' }, 500);
			$('#div_loginform').animate({ height: 'toggle' }, 500);
			$('#div_needhelp').animate({ height: 'toggle' }, 500);
		}
	});

	//login/register click on load from #
	switch (window.location.hash) {
		case '#login':
			$($I('span_login').click());break;
		case '#register':
			$($I('span_register')).click();break;
		case '#help':
			$($I('a_needhelp')).click();break;
	}

	//form handling
	$('#button_resetpassword').on('click', function () {});
	$('#button_login').on('click', function () {
		var error = validateLogin();
		if (error) jd.showError(error);else {
			$.post('login', $(this.form).serialize() + '&' + $.param({ '_csrf': jd.csrf })).done(function (ret) {
				jd.changeScreen(ret.html);
			}).fail(function (ret) {
				if (typeof ret.responseJSON !== 'undefined') {
					if (typeof ret.responseJSON.error === 'object') {
						jd.showError(ret.responseJSON.error);
					}
				}
			});
		}
	});
	$('#button_register').on('click', function () {
		var error = validateRegister();
		if (error) jd.showError(error);else {
			$.post('register', $(this.form).serialize() + '&' + $.param({ '_csrf': jd.csrf })).done(function (ret) {
				jd.changeScreen(ret.html);
			}).fail(function (ret) {
				if (typeof ret.responseJSON !== 'undefined') {
					if (typeof ret.responseJSON.error === 'object') {
						jd.showError(ret.responseJSON.error);
					}
				}
			});
		}
	});

	function validateLogin() {
		if ($I('textbox_username_login').value === '') {
			var error = {
				'page': 'login',
				'origin': 'u',
				'message': 'Please enter a username'
			};
			return error;
		} else if ($I('textbox_password_login').value === '') {
			var error = {
				'page': 'login',
				'origin': 'pw',
				'message': 'Please enter a password'
			};
			return error;
		}

		return false;
	}

	function validateRegister() {
		return false;
		if ($I('textbox_username_register').value === '') {
			var error = {
				'page': 'register',
				'origin': 'u',
				'message': 'Please enter a username'
			};
			return error;
		} else if ($I('textbox_email_register').value === '') {
			var error = {
				'page': 'register',
				'origin': 'e',
				'message': 'Please enter an email'
			};
			return error;
		} else if ($I('textbox_password_register').value !== $I('textbox_confirmpassword_register').value) {
			var error = {
				'page': 'register',
				'origin': 'pw',
				'message': 'Please confirm your password'
			};
			return error;
		}

		return false;
	}
}
