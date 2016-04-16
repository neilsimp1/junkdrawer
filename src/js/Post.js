class Post{

	constructor(){

	}

	save(post){
		if(!jd.validator.post()){
			$.post('post', {
				post: post
				, _csrf: jd.csrf
			})
			.done(function(ret){
				jd.csrf = ret.csrf;
				post.id = ret.id;
				post.datetime = ret.datetime;
				jd.page.editor.composer.clear();
				jd.post.show(post);
			})
			.fail(function(ret){
				alert('what the fuck');
			});
		}
	}

	toggle(post){
		if(!post.classList.contains('post-max')){
			let asas = $(post).find('.post-text');
			let height = $(post).find('.post-text')[0].clientHeight + 20;
			post.classList.add('post-max');			
			$(post).animate({'max-height': height + 'px', 'min-height': '60px'}, 250);
			$(post).find('.post-toolbar').slideDown(250);
		}
		else{
			post.classList.remove('post-max');			
			$(post).animate({'max-height': '120px', 'min-height': '40px'}, 250);
			$(post).find('.post-toolbar').slideUp(250);
		}
	}

	show(post){
		let $template = $($I('template_post').innerHTML);
		jd.post.template($template, post);
		$('#output').prepend($template);
		$template.slideDown();
	}

	fullscreen(post){
		$('#modal_post-text').html(post.text);
		$('#modal_post').modal();
	}

	edit(post){
		jd.page.editor.composer.element.innerHTML = post.text;
		jd.controls.post_id.value = post._id;
	}

	template($template, post){
		$template[0].id = post._id;
		$template.html(function(index, html){return html.replace(':dt:', jd.date.format(post.datetime));})
		.html(function(index, html){return html.replace(':text:', post.text);});
	}

	toJSON(div){
		let post = {
			_id: div.id
			,datetime: div.children[0].innerHTML
			,text: div.children[1].innerHTML
		};

		return post;
	}

}