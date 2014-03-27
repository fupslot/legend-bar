;(function($, window, document, undefined) {
    'use strict';

    var pluginName = 'FunnelViz'
      , defaults;

    defaults = {
        compare:   true,
        breakdown: false,
        showBreakdownConversion: false,
        allowHighlight: true,
        events:    [],
        labels:    [],
        sections:  [],
        barColorName: 'blue'
    };

    function init () {
        var self
          , sections
          , bl
          , breakdownClazz;

        self = this;

        if (this.el.tagName !== 'UL') throw Error('FunnelViz. Error: The root element must be an UL element');

        if (this.isBreakdown()) {
            breakdownClazz = 'breakdown ';
            bl = this.options.breakdown.length;
            // Three is the max. From the design point of view.
            breakdownClazz += ['one', 'two'][bl - 1] || 'three';
        }
        
        // Hide element. Privents blinking on slow machines.
        this.$el
            .addClass('fun-container')
            .addClass(breakdownClazz)
            .css('display', 'none');

        sections = this.options.sections;

        // Convert settings to a convenient structure
        this._events = transformData2FunnelVizFormat(this.options);

        // console.log(this.options); // !!!
        // console.log(this._events); // !!! 
        
        // Draw an event
        this._events.forEach($.proxy(drawColumn, this));
        
        // Show element
        this.$el.fadeIn();
    }

    function drawColumn (model, index) {
        var events
          , columnEl;

        events = model.events;

        columnEl = $('<li>')
            .addClass('fun-column')
            .append($('<div>')
                .addClass('fun-event-name')
                .attr('title', model.name)
                .text(model.name));

        if (this.isBreakdown()) {
            // Draw a breakdown
            drawBreakdown.call(this, columnEl, model, index);
        }
        else {
            // Draw a bar
            drawBar.call(this, columnEl, model, index);
        }

        // Draw panels
        var panels = ['actual'];
        if (this.options.compare) panels.push('compare');
        
        panels.forEach($.proxy(function (val) {
            drawPanelValue.call(this, columnEl, model, index, val === 'compare');
        }, this));

        this.$el.append(columnEl);
    }

    function drawBreakdown (el, model, columnIndex) {
        var barEl
          , sections;
        
        barEl = $('<ul>').addClass('fun-bar');

        sections = this.options.breakdown;

        sections.forEach($.proxy(function (sectionIndex, index) {
            var el, section;
            
            section = model.sections[sectionIndex];
            if (!section) return;

            el = $('<li>');
            drawBar.call(this, el, section, columnIndex, index);
            el.appendTo(barEl);
        }), this);

        el.append(barEl);
    }

    function drawBar(el, model, columnIndex, index) {
        var self
          , labelOrientation
          , isFirst
          , onHighlightEvent;

        self    = this;
        isFirst = columnIndex === 0;

        labelOrientation = this.isBreakdown() ? 'verticaly' : 'horizontaly';

        onHighlightEvent = function (e) {
            var el;
            el = $(e.currentTarget).toggleClass('highlighted');
            
            if (el.hasClass('highlighted')) {
                // addHighlighted()
            }
            else {
                // removeHighlighted()
            }
        };

        $('<div>')
            .addClass('fun-bar-value')
            .addClass(getBarColor.call(this, index))
            .append($('<div>')
                .addClass('fun-bar-value-top')
                .attr('role', 'bar')
                .css('top', model.GHBar+'%')
                .on('click', onHighlightEvent))
            .append($('<div>')
                .addClass('fun-bar-value-bottom')
                .addClass('fun-label')
                .addClass(labelOrientation)
                .attr('role', 'bar')
                .attr('title', function(){
                    var title, conv;
                    conv  = numeral(model.conversion).format('0.0') + '%';
                    title = isFirst ? model.name : model.name + '\r\n' + model.value + ' / ' + conv;
                    return title;
                })
                .attr('data-value', model.value)
                .attr('data-conv', function() {
                    if (self.options.showBreakdownConversion) {
                        return isFirst ? '' : ' / ' + numeral(model.conversion).format('0.0') + '%';
                    }
                })
                .css('top', model.HBar+'%')
                .on('click', onHighlightEvent))
            .appendTo(el);
    }

    function drawPanelValue (el, model, columnIndex, isCompare) {
        var self
          , overallClazz
          , isOverall;

        self = this;
        isOverall = columnIndex == 0;
        
        overallClazz = isOverall ? 'overall' : '';

        $('<div>')
            .addClass('fun-panel-value')
            .addClass(overallClazz)
            .append(function () {
                var formatted
                  , value
                  , formatedValue
                  , clazz;

                value = !isCompare ? model.conversion : model.compare;
                formatted = numeral(value).format('0.0');

                if (isCompare) $(this).addClass('compare');
                
                if (!isOverall) {
                    clazz = value < 0 ? 'minus' : 'plus';
                    formatted = $('<span>').addClass(clazz).text(formatted);
                }

                return formatted
            })
            .append(function () {
                var labels, label;
                labels = self.options.labels || [];
                label  = !isOverall ? labels[columnIndex - 1] : '';
                return label || '';
            })
            .appendTo(el);
    }

    function transformData2FunnelVizFormat (options) {
        /*
        {
            name:       'Event Name',
            value:      0, // Total
            conversion: 0, // Total
            compare:    0, // Total
            sections: [
                {
                    value: 0,
                }
            ]
        }
        */
        
        var getTotalValue = function (index, timeFrame) {
            var value = 0;
            options.sections.forEach(function (section) {
                value += section[timeFrame][index];
            });
            return value;
        }

        var getCompareValue = function (curr, prev) {
            var a,b;

            a = getTotalValue(curr, 'compare');
            b = getTotalValue(prev, 'compare');

            return (b / a) * 100;
        };

        var getConversionValue = function (curr, prev) {
            var a,b;
            a = getTotalValue(curr, 'actual');
            b = getTotalValue(prev, 'actual');
            return (b / a) * 100;
        };

        var eventTotals = function (eventName, index) {
            var a,b,c, curr, prev, isFirst, HBar, GHBar;
            
            isFirst = index === 0;
            a = getTotalValue(index, 'actual');
            
            curr = index;
            // First column always have an overall values
            prev = isFirst ? options.events.length - 1 : index -1;
            
            c = getConversionValue(curr, prev);
            b = c - getCompareValue(curr, prev);

            HBar  = 100 - (a / getTotalValue(0, 'actual')) * 100;
            GHBar = isFirst ? 0 : 100 - (getTotalValue(index - 1, 'actual') / getTotalValue(0, 'actual')) * 100;

            return {
                name:       eventName,
                value:      a,
                compare:    b,
                conversion: c,
                HBar:       HBar,  // The top shift(%) for the bar
                GHBar:      GHBar  // The top shift(%) for the gray area behind the bar
            };
        };

        var eventSections = function (index) {
            var sections = [];
                        
            options.sections.forEach(function (s) {
                var section, value, conv, HBar, GHBar, isFirst;

                isFirst = index === 0;
                value   = s.actual[index];
                conv    = isFirst ? 0 : (s.actual[index] / s.actual[index - 1]) * 100;
                HBar    = 100 - (value / s.actual[0]) * 100;
                GHBar   = isFirst ? 0 : 100 - (s.actual[index - 1] / s.actual[0]) * 100;

                section   = {};                
                section.name  = s.name;
                section.value = value;
                section.conversion = conv;
                section.HBar  = HBar;
                section.GHBar = GHBar;
                sections.push(section);
            });

            return sections;
        };
        
        var transformedEvent = function (eventName, index) {
            var obj = eventTotals(eventName, index);
            obj.sections = eventSections(index);
            return obj;
        };

        var events;
        events = options.events.map(transformedEvent);
        return events;
    }

    function getBarColor(index) {
        if (index === void 0) return this.options.barColorName + 'ish';
        return (['green', 'red'][index] || 'yellow') + 'ish';
    }

    function Plugin (el, options) {
        // Save the element reference, both as a jQuery
        // reference and a normal reference
        this.el  = el;
        this.$el = $(el);

        this.options   = options;
        this._defaults = defaults;
        this._name     = pluginName;
        // Holds a list of bars that were highlighted by a user
        this.highlighted  = [];
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            init.apply(this);
        },

        isBreakdown: function () {
            return $.isArray(this.options.breakdown);
        },
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