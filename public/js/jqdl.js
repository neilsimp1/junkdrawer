(function($){
	$.fn.jqdl = function(){
		
		for(var index = 0; index < this.length; index++){
			var _ctrl = this[index];
			var id = _ctrl.id;
			var addText = _ctrl.getAttribute('data-addtext')? _ctrl.getAttribute('data-addtext'): 'Add Files';
			
			//Controls
			var btnAdd = '<button type="button" class="btn btn-sm btn-default jqdl-addFiles jqdl-addFiles-' + id + '" data-id="' + id + '">' + addText + '</button>';
			var btnRemove = '<button type="button" class="btn btn-sm btn-default jqdl-removeFiles jqdl-removeFiles-' + id + '" data-id="' + id + '"><span class="glyphicon glyphicon-trash"></span></button>';
			
			var div_btnGroup = document.createElement('div');
			div_btnGroup.className = 'btn-group';
			div_btnGroup.innerHTML = btnAdd + btnRemove;
			
			var span_label = document.createElement('span');
			span_label.setAttribute('id', 'span_display_' + id);
			span_label.setAttribute('data-toggle', 'tooltip');
            span_label.setAttribute('data-flag', '0');
			span_label.style['margin-right'] = '8px';
            span_label.style['font-size'] = '0.85em';
			span_label.style['font-style'] = 'italic';
			
			//Dom changes
			_ctrl.style.display = 'none';
			$(_ctrl).after(div_btnGroup).after(span_label);
		}
		
		//Functions
		$.fn.jqdl.btnAdd_click = function(input){input.click();}
		$.fn.jqdl.btnRemove_click = function(input){
            input.value = '';
            input.type = 'text'; input.type = 'file';
            $.fn.jqdl.fileInput_change(input);
            $(input).trigger('blur');
		}
		$.fn.jqdl.fileInput_change = function(input){
            if(!validateFiles(input)){$.fn.jqdl.btnRemove_click(input); return;}

			var span_label = document.getElementById('span_display_' + input.id);
			if(input.files.length === 0){
				span_label.style.color = '#A94442';
				span_label.innerHTML = span_label.getAttribute('data-flag') == '0'? '': 'No files';
				span_label.setAttribute('title', '');
                span_label.setAttribute('data-original-title', '');
			}
			else{
				var file_files = input.files.length === 1? 'file': 'files';
				span_label.style.color = 'initial';
				span_label.innerHTML = input.files.length + ' ' + file_files;
				var fileNames = [];
				for(var i = 0; i < input.files.length; i++) fileNames.push(input.files[i].name);
                var filesNamesStr = fileNames.join('\r\n');
				span_label.setAttribute('title', filesNamesStr);
                span_label.setAttribute('data-original-title', filesNamesStr);
                span_label.setAttribute('data-flag', '1');
			}
		}
		$.fn.jqdl.clearAllFiles = function(){
            $('input[type=file]').each(function(){this.nextElementSibling.nextElementSibling.children[1].click();});
        }
        
		//Bindings
		$(this).change(function(){$.fn.jqdl.fileInput_change(this);});
		$('.jqdl-addFiles').on('click', function(){$.fn.jqdl.btnAdd_click(document.getElementById($(this).data('id')));});
		$('.jqdl-removeFiles').on('click', function(){$.fn.jqdl.btnRemove_click(document.getElementById($(this).data('id')));});
		
		return this;
	};
}(jQuery));

$(document).ready(function(){$('input[type=file]').jqdl();});