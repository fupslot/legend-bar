;(function($, window, document, undefined) {
    'use strict';

    var pluginName = 'DropdownPills'
      , defaults;

    defaults = {
        names: [],
        highlighted: []
    };

    function _init () {
        var self;

        self = this;

        if (this.el.tagName !== 'DIV') throw Error('Dropdown. Error: The root element must be an DIV element');

        // Hide element. Privents blinking on slow machines.
        this.$el
            .addClass('dropdown-pills')
            .css('display', 'none');

        // Draws a legend
        _drawLegend.call(self, self.options.highlighted);
        // Draws a dialog
        _drawDialog.call(self);

        _updateDialogHeader.call(self);
        // Show element
        this.$el.fadeIn();
    }

    function getColorNameByIndex (index) {
        return ['greenish', 'redish'][index] || 'yellowish';
    }

    function _drawLegend (indexes) {
        var self
          , containerEl
          , ulEl;

        self = this;
        containerEl = $('<div>')
            .addClass('dropdown-pills-container');
        
        if (indexes.length > 0) {
            ulEl = $('<ul>');
            indexes.forEach(function (idx, i) {
                $('<li>')
                    .addClass('pill')
                    .append($('<span>')
                        .addClass('pill-color')
                        .addClass(getColorNameByIndex(i)))
                    .append($('<a>')
                        .attr('href', 'javascript:void 0;')
                        .text(self.options.names[idx]))
                    .appendTo(ulEl);
            });
            containerEl.append(ulEl);
        }
        $('<ul>')
            .addClass('options')
            .append('<li>','<li>','<li>')
            .appendTo(containerEl)
            .on('click', function (e) {
                e.stopPropagation();
                self.open();
            });
        $(document).on('click', function () {
            self.cancel();
        });
        this.$el.append(containerEl);
    }

    function _drawDialog () {
        var self
          , dialogEl
          , bodyEl;

        self = this;
        dialogEl   = $('<div>').addClass('dropdown-pill-dialog');
        dialogEl.append($('<div>').addClass('arrow-top-bg'))
        dialogEl.append($('<div>').addClass('arrow-top'))

        // Header
        dialogEl.append($('<div>')
            .addClass('dialog-group')
            .addClass('dialog-group-title'));
        
        // Body
        bodyEl = $('<ul>')
            .addClass('dropdown-pill-list')
            .addClass(function () {
                return self.options.highlighted.length === 3 ? 'disabled' : '';
            });
        self.options.names.forEach(function (name, i) {
            $('<li>')
                .append($('<a>')
                    .addClass(function () {
                        return self.isHighlighted(i) ? 'highlighted' : '';
                    })
                    .attr('href', 'javascript:void 0;')
                    .append($('<span>')
                        .addClass('pill-color')
                        .addClass(function () {
                            var colorIndex = self.options.highlighted.indexOf(i);
                            return self.isHighlighted(i) ? getColorNameByIndex(colorIndex) : '';
                        }))
                    .append($('<span>').text(name))
                    .on('click', function (e) {
                        e.stopPropagation();
                        if (bodyEl.hasClass('disabled') && !$(this).hasClass('highlighted')) return;

                        _highlight.call(self, i);
                    }))
                .appendTo(bodyEl);
        });
        dialogEl.append(bodyEl);

        // Footer
        $('<div>').addClass('dialog-group dialog-group-footer')
            .append($('<a>')
                .attr('href', 'javascript:void 0;')
                .addClass('button button-disabled')
                .text('Save'))
            .append($('<a>')
                .attr('href', 'javascript:void 0;')
                .addClass('button')
                .on('click', $.proxy(function () {
                    this.cancel();
                }, this))
                .text('Cancel'))
            .appendTo(dialogEl);
        self.$el.append(dialogEl);
    }

    function _highlight (index) {
        var slice
          , bodyEl
          , aEl
          , colorIndex
          , colorName;
        
        bodyEl = this.$el.find('.dropdown-pill-list');

        colorIndex = this._highlighted.indexOf(index);

        // The limit is reached
        if (colorIndex == -1 && _cannotHighlight.call(this)) return;

        if (bodyEl.hasClass('disabled')) bodyEl.removeClass('disabled');
        
        aEl = this.$el.find('.dropdown-pill-list a').eq(index);

        // An item is highlighted already
        if (colorIndex !== -1) {
            this._highlighted[colorIndex] = -1;
            
            _unHighlightItem.call(this, index);
        }
        else {
            colorIndex = this._highlighted.indexOf(-1) !== -1 ? this._highlighted.indexOf(-1) : this._highlighted.length;
            this._highlighted[colorIndex] = index;
            colorName = getColorNameByIndex(colorIndex);

            _highlightItem.call(this, index, colorName);
        }

        _updateDialogHeader.call(this);

        if (_isChangeMade.call(this)) {
            _highlightSaveButton.call(this);
        }
        else {
            _unHighlightSaveButton.call(this);
        }

        if (_cannotHighlight.call(this)) {
            bodyEl.addClass('disabled');
        }
    }

    function _updateDialogHeader() {
        var source, message, count;
        source = this._highlighted || this.options.highlighted;
        
        count = 0;
        source.forEach(function (i) {
            count += i !== -1 ? 1 : 0;
        });
        
        message = ['You have 3 items to choice', 'You have 2 items left to choice', 'One more item'][count] || 'Limit reached';
        this.$el.find('.dialog-group-title').text(message);
    }

    function _unHighlightItem (index) {
        this.$el
            .find('.dropdown-pill-list a')
            .eq(index)
            .removeClass('highlighted')
            .find('.pill-color')
            .removeClass('greenish redish yellowish');
    }

    function _highlightItem (index, colorName) {
        this.$el
            .find('.dropdown-pill-list a')
            .eq(index)
            .addClass('highlighted')
            .find('.pill-color')
            .addClass(colorName);
    }

    function _highlightSaveButton () {
        this.$el
            .find('.dialog-group-footer .button')
            .first()
            .removeClass('button-disabled')
            .addClass('green');
    }

    function _unHighlightSaveButton () {
        this.$el
            .find('.dialog-group-footer .button')
            .first()
            .addClass('button-disabled')
            .removeClass('green');
    }

    function _cannotHighlight () {
        return this._highlighted.length === 3 && this._highlighted.indexOf(-1) === -1;
    }

    function _isChangeMade () {
        var self, result;
        self = this;
        return !this.options.highlighted.every(function (a,i) {
            return self._highlighted && self._highlighted[i] === a;
        });
    }

    function Plugin (el, options) {
        // Save the element reference, both as a jQuery
        // reference and a normal reference
        this.el  = el;
        this.$el = $(el);

        this.options   = options;
        this._defaults = defaults;
        this._name     = pluginName;

        this.init();
    }

    Plugin.prototype = {
        init: function () {
            _init.apply(this);
        },

        isHighlighted: function (i) {
            return this.options.highlighted.indexOf(i) !== -1;
        },

        open: function () {
            var slice = Array.prototype.slice;
            if (!this._highlighted) this._highlighted = slice.call(this.options.highlighted);
            this.$el
                .find('.dropdown-pill-dialog')
                .addClass('open');
        },

        cancel: function () {
            var slice = Array.prototype.slice;
            this._highlighted = slice.call(this.options.highlighted);

            this.options.names.forEach($.proxy(function (n, index) {
                if (this._highlighted.indexOf(index) !== -1) {
                    _highlight.call(this, index);
                } 
                else {
                    _unHighlightItem.call(this, index);
                }
            }, this));
            
            delete this._highlighted;

            this.$el
                .find('.dropdown-pill-dialog')
                .removeClass('open');
        }
    };

    $.fn[pluginName] = function (method) {
        var args = arguments;
        return this.each(function () {
            var $this = $(this)
                , data = $this.data('plugin_'+pluginName)
                , options = $.extend({}, defaults, $.isPlainObject(method) && method);

            if (!data) $this.data('plugin_'+pluginName, (data = new Plugin(this, options)));
            if (typeof method == 'string') data[method].apply(data, Array.prototype.slice.call(args, 1));
        });
    };
})(jQuery, window, document);