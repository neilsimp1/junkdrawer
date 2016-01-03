class Post{

	constructor(){
		
	}

	add(){
		if(!jd.validator.post()){
			//let files = $I('fileinput').files;

			let post = {
				folderid: jd.getActiveFolderID()
				,text: document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML
				//,files: files
			};
			
			$.post('post', {
				post: post
				,_csrf: jd.csrf
			})
			.done(function(ret){
				jd.csrf = ret.csrf;
				post.id = ret.id;
				post.datetime = ret.datetime;
				document.querySelector('.wysihtml5-sandbox').contentDocument.body.innerHTML = '';
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

	template($template, post){
		$template.html(function(index, html){return html.replace(':id:', post.id);})
		.html(function(index, html){return html.replace(':dt:', jd.date.format(post.datetime));})
		.html(function(index, html){return html.replace(':text:', post.text);});
	}

}