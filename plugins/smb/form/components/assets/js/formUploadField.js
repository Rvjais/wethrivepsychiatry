;(function($) {

    var UploadField = function(element, options) {

        this.$el = $(element);
        this.inputAttributes = options.attributes;
        this.options = options || {};

        //script's config vars
        this.config = {
            fail        : '<span class="error"><i class="la-cicon-exclamation" aria-hidden="true"></i>Oops! Upload failed</span>',
            notSupported: '<span class="error"><i class="la-cicon-exclamation" aria-hidden="true"></i>File type not supported</span>',
            maxSize     : '<span class="error"><i class="la-cicon-exclamation" aria-hidden="true"></i>File exceeds max size</span>',
            fileSize    : 10485760,
            fileTypes   : options.fileTypes,
            defaultLabel: this.options.label == '' ? this.options.label : this.options.helpText
        };

        this.itemInfo = {};

        this.insertHTML(this.inputAttributes);
        this.$uploadFieldInput = this.$el.find(':file');
        this.$label = this.$el.find('.labelHolder');
        this.$close = this.$el.find('.la-cicon-close');

        this.init(this.$el);
    };

    UploadField.prototype.init = function($el) {
        var self = this;

        self.attachEvents();
    };

    UploadField.prototype.attachEvents = function(){
    	var self = this;

        self.$el.on('change', ':file', function() {
            var input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, ''),
                files = document.getElementById(input.attr('id')).files,
                file = files[0];

            if(file){
                input.trigger('fileselect', [numFiles, label,file]);
            }
        });

        self.$uploadFieldInput.on('fileselect', function(event, numFiles, label, file) {
            self.validateFiles(event, numFiles, label, file);
        });

        self.$uploadFieldInput.on('focus', function () {
            self.$uploadFieldInput.addClass('has-focus');
        }).on('blur', function () {
            self.$uploadFieldInput.removeClass('has-focus');
        });

        self.$close.on('click', function(e){
            e.preventDefault();
            self.toggleInputState('reset');
            self.uploadItems('removeLastUploaded');
            self.$uploadFieldInput.val('');
        });
    };

    UploadField.prototype.uploadItems = function(item){
        var self = this;

        if (typeof item !== 'object'){
            self.$uploadFieldInput.data('item', '');
        }else{
            self.$uploadFieldInput.data('item', JSON.stringify(item));
            self.toggleInputState('close');
        }
    };

    UploadField.prototype.toggleInputState = function(state){
        var self = this;
        if(state === 'reset'){
            state = 'upload';
            self.$label.html(self.config.defaultLabel);
        }

        this.$el.find('.la-cicon-'+ state).show();
        this.$el.find('.la-cicon-'+ state).siblings('i').hide();
        state === 'upload' ? this.$el.find('.status-label').show() : this.$el.find('.status-label').hide();
    };

    UploadField.prototype.encodeBaseSF = function(file, fileName, fn){
        var self = this, reader = new FileReader(), item = {};

        reader.readAsDataURL(file);
        reader.onload = function () {
            item.id = fileName;
            item.string =  reader.result;
            item.size = file.size;
            item.extension = self.itemInfo.extension;
            item.icon = self.itemInfo.icon;

            //we have to use callback !
            return fn(item);
        };
        reader.onerror = function (error) {
            // console.log('Error: ', error);
        };
    };

    UploadField.prototype.insertHTML = function(attributes){
        var
        hasError = this.options.required ? 'has-error' : '',
        htmlTemplate = '<label for="' + attributes.id + '">'+
                            '<span class="labelHolder">' + this.config.defaultLabel + '</span>'+
                                '<span class="btnS">'+
                                    '<span class="">' +
                                        '<i class="la-cicon-spinner icon-pulse icon-fw icon-load" style="display:none;"></i>'+
                                        '<i class="la-cicon-upload"></i>' +
                                        '<i class="la-cicon-close" style="display:none;"></i>'+
                                        '<span class="status-label"> Browse</span>'+
                                    '</span>' +
                                '</span>'+
                        '</label>'+
                        '<span class="form-input-info">Maximum file size allowed: 10MB</label>',
        field = $('<input>', attributes).addClass('fileUpload');

        this.$el.append(field).append(htmlTemplate);
    };

    UploadField.prototype.validateFiles = function(e, numFiles, label, file){
        var
        self = this,
        labelVal = self.$label.html(),
        fileName = '',
        isOkFileType = false;
        $('label', self.$el).removeClass('has-error');        
        $('.error_container', self.$el.parent().parent()).remove();
        self.itemInfo.extension = file.name.split('.').pop().toUpperCase();
        self.itemInfo.icon = 'other';

        $.each(self.options.fileTypes, function( index, value ) {
            if (value.ext === self.itemInfo.extension) {
                isOkFileType = true;
                self.itemInfo.icon = value.icon;
            }
        });

        if( e.target.value )
            fileName = e.target.value.split( '\\' ).pop();
            var fileLabel = '<span class="success"><i class="la-cicon-file-' + self.itemInfo.icon + '"></i>'+fileName+'</span>';

        if( fileName ){
            if( file.size > self.config.fileSize ){
                self.updateLabel(self.config.maxSize);
            }else if(!isOkFileType){
                self.updateLabel(self.config.notSupported);
            }else{
                self.encodeBaseSF(file, fileName, function(item){
                    self.uploadItems(item);
                    self.updateLabel(fileLabel);
                });
            }
            self.toggleInputState('close');
        }else{
            self.$label.html( labelVal );
            self.toggleInputState('load');
        }
    };

    UploadField.prototype.updateLabel = function(labelText){
        var self = this;

        if(typeof labelText !== "undefined"){
            self.$label.html(labelText);
        }
    };

    var old = $.fn.uploadField;

    $.fn.uploadField = function(options) {
        options = $.extend({}, $(this).data(), typeof options === 'object' && options);
        new UploadField(this, options);
    };

    $.fn.uploadField.Constructor = UploadField;

    $.fn.uploadField.noConflict = function() {
        $.fn.uploadField = old;
        return this;
    };

})(jQuery);
