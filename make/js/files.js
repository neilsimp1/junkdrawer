(function(jd){
	jd.files = function(){
		
		for(var index = 0; index < this.length; index++){
			let _ctrl = this[index]
				,id = _ctrl.id
				,addText = _ctrl.getAttribute('data-addtext')? _ctrl.getAttribute('data-addtext'): 'Add Files';
			
			//Controls
			let fileDD = $('<button type="button" id="button_filemenu" class="dropdown-toggle menubtn hoverbtn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>')
			fileDD.append($('<span class="sr-only">Toggle menu</span>'));
			fileDD.append($('<span class="glyphicon glyphicon-paperclip"></span>'));

			let fileMenu = $('<ul class="mainmenu filemenu dropdown-menu"></ul>');
			fileMenu.append($('<li><a href="#" id="jqdl-add" class="hoverbtn" data-id="' + id + '"><span class="glyphicon glyphicon-plus"></span></a></li>'));
			fileMenu.append($('<li><a href="#" id="jqdl-delete" class="hoverbtn" data-id="' + id + '"><span class="glyphicon glyphicon-trash"></span></a></li>'));
			
			let div_btnGroup = $('<div class="dropup" style="display:inline;"></div>');
			div_btnGroup.append(fileDD, fileMenu);
			
			let span_label = document.createElement('span');
			span_label.setAttribute('id', 'span_display_' + id);
			span_label.setAttribute('data-toggle', 'tooltip');
			span_label.style['margin-right'] = '8px';
            span_label.style['font-size'] = '0.85em';
			span_label.style['font-style'] = 'italic';
			
			//Dom changes
			_ctrl.style.display = 'none';
			$(_ctrl).after(div_btnGroup).after(span_label);
		}
		
		//Functions
		jd.files.btnAdd_click = function(input){input.click();}
		jd.files.btnRemove_click = function(input){
            input.value = '';
            input.type = 'text'; input.type = 'file';
            jd.files.fileInput_change(input);
            $(input).trigger('blur');
		}
		jd.files.fileInput_change = function(input){
            if(!validateFiles(input)){jd.files.btnRemove_click(input); return;}

			let span_label = document.getElementById('span_display_' + input.id);
			if(input.files.length === 0){
				span_label.innerHTML = '';
				span_label.setAttribute('title', '');
                span_label.setAttribute('data-original-title', '');
			}
			else{
				let file_files = input.files.length === 1? 'file': 'files';
				span_label.innerHTML = input.files.length + ' ' + file_files;
				let fileNames = [];
				for(var i = 0; i < input.files.length; i++) fileNames.push(input.files[i].name);
                let filesNamesStr = fileNames.join('\r\n');
				span_label.setAttribute('title', filesNamesStr);
                span_label.setAttribute('data-original-title', filesNamesStr);
			}
		}
		jd.files.clearAllFiles = function(){
            $('input[type=file]').each(function(){$(this.nextElementSibling.nextElementSibling.children[1]).click();});
        }
        
		//Bindings
		$(this).change(function(){jd.files.fileInput_change(this);});
		$('#jqdl-add').on('click', function(){jd.files.btnAdd_click($I($(this).data('id')));});
		$('#jqdl-delete').on('click', function(){jd.files.btnRemove_click($I($(this).data('id')));});

		return this;
	};

	$.fn.files = jd.files;

}(jd));

$(document).ready(function(){$('input[type=file]').files();});