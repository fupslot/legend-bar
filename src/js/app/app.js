$(function () {
    var settings;

    
    settings = {
        names: ['John Bon Jovi', 'John Doe', 'Kelly Clarkson', 'Nataly Portman', 'Doors', 'Beatles'],
        checked: [1,2],
    };

    $('#legend').LegendBar(settings);
    $('#legend').on('select', function (e, list) {
        console.log(list);
    });

    $('#destroy').on('click', function () {
        $('#legend').LegendBar('destroy');
    });
    $('#init').on('click', function () {
        $('#legend').LegendBar(settings);
        $('#legend').on('select', function (e, list) {
            console.log(list);
        });
    });
});