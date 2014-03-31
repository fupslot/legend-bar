;(function($, window, document, undefined) {
    'use strict';

    var pluginName = 'LegendBar'
      , defaults;

    defaults = {
        names: [],
        highlighted: [],
        checked: []
    };

    function _init () {
        var self, checkedList;

        self = this;

        if (this.el.tagName !== 'DIV') throw Error('Dropdown. Error: The root element must be an DIV element');

        this.list = this._createCollection();

        // Hide element. Privents blinking on slow machines.
        this.$el
            .addClass('dropdown-pills')
            .css('display', 'none')
            .append($('<div>')
                .addClass('dropdown-pills-container'));
        
        this._drawOptionButton();

        // Draws a legend
        checkedList = this._getCheckedList(this.list);
        this._drawLegend(checkedList);

        // Draws a dialog
        this._drawDialog();

        this._updateDialogHeader();
        // Show element
        this.$el.fadeIn();
    }

    function getColorNameByIndex (index) {
        return ['greenish', 'redish'][index] || 'yellowish';
    }

    function buttonClickEventHandler (method) {
        return function (e) {
            e.stopPropagation();
            this[method]();
        }
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

        isLimitReached: function () {
            var count = 0;
            this.list.forEach(function (item) {
                if (item.checked) count++;
            });
            return count >= 3;
        },

        open: function () {
            this._list = $.extend(true, [], this.list);
            this.$el
                .find('.dropdown-pill-dialog')
                .addClass('open');
        },

        cancel: function () {
            var self = this;

            if (!this._list) return;

            // this.list = Array.prototype.slice.call(this._list);
            this.list = $.extend(true, [], this._list);
            delete this._list;

            this.list.forEach(function (item, index) {
                self._refreshItem(item, index);
            });

            this._updateDialogHeader();
            this._unHighlightSaveButton();
            this._refreshListStatus();

            this.$el
                .find('.dropdown-pill-dialog')
                .removeClass('open');
        },

        save: function () {
            var checkedList;

            delete this._list;
            
            // Draws a legend
            checkedList = this._getCheckedList(this.list);
            this._drawLegend(checkedList);

            this.$el
                .find('.dropdown-pill-dialog')
                .removeClass('open');
            this.$el.trigger('onChanged', [checkedList]);
        },

        _createCollection: function () {
            return this.options.names.map($.proxy(function (name, i) {
                var colorIndex, checked;
                colorIndex = this.options.checked.indexOf(i);
                checked = colorIndex !== -1;
                return {index:i, name:name, checked:checked, colorIndex: colorIndex};
            },this));
        },

        _drawOptionButton: function () {
            var self, containerEl;

            self = this;
            containerEl = this.$el.find('.dropdown-pills-container');

            $('<ul>')
                .addClass('options')
                .append('<li>','<li>','<li>')
                .on('click', function (e) {
                    e.stopPropagation();
                    self.open();
                })
                .appendTo(containerEl);
            $(document).on('click', function (e) {
                e.stopPropagation();
                self.cancel();
            });
        },

        _drawLegend: function (list) {
            var self
              , containerEl
              , listEl;

            self = this;
            
            containerEl = this.$el.find('.dropdown-pills-container');
            containerEl.find('ul.legend').remove();
            
            // Always fron greenish to yellowish
            list.sort(function (a, b) {
                if (a.colorIndex < b.colorIndex) return -1;
                if (a.colorIndex > b.colorIndex) return 1;
                return 0;
            });

            // The legend
            if (list.length === 0) return;
            listEl = $('<ul>').addClass('legend');
            list.forEach(function (item, index) {
                $('<li>')
                    .addClass('pill')
                    .append($('<span>')
                        .addClass('pill-color')
                        .addClass(getColorNameByIndex(item.colorIndex)))
                    .append($('<a>')
                        .attr('href', 'javascript:void 0;')
                        .text(item.name))
                    .appendTo(listEl);
            });
            containerEl.append(listEl);
            this.$el.append(containerEl);
        },

        _drawDialog: function () {
            var self
              , dialogEl
              , bodyEl;

            self = this;

            self.$el.find('.dropdown-pill-dialog').remove();

            dialogEl = $('<div>').addClass('dropdown-pill-dialog');
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
                    return self.isLimitReached() ? 'disabled' : '';
                });
            
            self.list.forEach(function (item, i) {
                $('<li>')
                    .append($('<a>')
                        .addClass(function () {
                            return item.checked ? 'highlighted' : '';
                        })
                        .attr('href', 'javascript:void 0;')
                        .append($('<span>')
                            .addClass('pill-color')
                            .addClass(function () {
                                return item.checked ? getColorNameByIndex(item.colorIndex) : '';
                            }))
                        .append($('<span>').text(item.name))
                        .on('click', function (e) {
                            e.stopPropagation();
                            if (bodyEl.hasClass('disabled') && !$(this).hasClass('highlighted')) return;

                            self._checked(i);
                        }))
                    .appendTo(bodyEl);
            });
            dialogEl.append(bodyEl);

            // Footer
            $('<div>').addClass('dialog-group dialog-group-footer')
                .append($('<a>')
                    .attr('href', 'javascript:void 0;')
                    .addClass('button button-disabled')
                    .on('click', $.proxy(buttonClickEventHandler('save'), self))
                    .text('Save'))
                .append($('<a>')
                    .attr('href', 'javascript:void 0;')
                    .addClass('button')
                    .on('click', $.proxy(buttonClickEventHandler('cancel'), self))
                    .text('Cancel'))
                .appendTo(dialogEl);
            self.$el.append(dialogEl);
        },

        _refreshListStatus: function () {
            var bodyEl = this.$el.find('.dropdown-pill-list');
            if (this.isLimitReached()) {
                bodyEl.addClass('disabled');
            }
            else {
                bodyEl.removeClass('disabled');
            }
        },

        _checked: function (index) {
            var item;

            item = this.list[index];

            // The limit is reached
            if (!item.checked && this.isLimitReached()) return;

            if (item.checked) {
                item.colorIndex = -1;
                item.checked = false;
            }
            else {
                item.colorIndex = this.getNextColorIndex();
                item.checked = true;
            }

            this._refreshItem(item, index);

            this._updateDialogHeader();

            this._highlightSaveButton();

            this._refreshListStatus();
        },

        getNextColorIndex: function () {
            var i, l, list, indexList, index;

            indexList = [];
            list = this._getCheckedList(this.list);
            
            list.forEach(function (item) {
                indexList.push(item.colorIndex);
            });

            indexList.sort();

            i = 0;
            l = indexList.length;
            for(; i < 3; i++) {
                if (i !== indexList[i]) {
                    index = i;
                    break;
                }
            }
            return index;
        },

        _updateDialogHeader: function () {
            var list, message;
            list = this._getCheckedList(this.list);
            
            message = ['You have 3 items to choice', 'You have 2 items left to choice', 'One more item'][list.length] || 'Limit reached';
            this.$el.find('.dialog-group-title').text(message);
        },

        _refreshItem: function (item, index) {
            var linkEl;
            linkEl = this.$el.find('.dropdown-pill-list a').eq(index);
            linkEl.removeClass('highlighted')
                .find('.pill-color')
                .removeClass('greenish redish yellowish');

            linkEl
                .addClass(function () {
                    return item.checked ? 'highlighted' : '';
                })
                .find('.pill-color')
                .addClass(function () {
                    return item.checked ? getColorNameByIndex(item.colorIndex) : '';
                });
        },

        _highlightSaveButton: function () {
            this.$el
                .find('.dialog-group-footer .button')
                .first()
                .removeClass('button-disabled')
                .addClass('green');
        },

        _unHighlightSaveButton: function () {
            this.$el
                .find('.dialog-group-footer .button')
                .first()
                .addClass('button-disabled')
                .removeClass('green');
        },

        _getCheckedList: function (list) {
            return list.filter(function (item) {
                return !!item.checked;
            });
        },

        destroy: function () {
            var el, obj;

            el  = this.$el;
            obj = el.data('plugin_'+pluginName);
            if (obj !== void 0) {
                el.off('onChanged')
                  .removeData('plugin_'+pluginName)
                  .removeClass('dropdown-pills')
                  .children().remove();
            }


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