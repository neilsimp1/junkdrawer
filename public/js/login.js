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
		case 'login':
			$I('span_login').click();break;
		case 'register':
			$I('span_register').click();break;
	}

	//Form handling
	$('#button_resetpassword').on('click', function () {});
	$('#button_login').on('click', function () {
		$.post('login', $(this.form).serialize() + '&' + $.param({ '_csrf': csrf() })).done(function (ret) {
			changeScreen(ret.html);
		}).fail(function (ret) {
			var asd = 123;
		});
	});
	$('#button_register').on('click', function () {
		$.post('register', $(this.form).serialize() + '&' + $.param({ '_csrf': csrf() })).done(function (ret) {
			changeScreen(ret.html);
		}).fail(function (ret) {
			var asd = 123;
		});
	});
}
