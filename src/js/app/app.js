$(function () {
    var settings;

    
    settings = {
        names: ['John Bon Jovi', 'John Doe', 'Kelly Clarkson', 'Nataly Portman', 'Doors', 'Beatles'],
        highlighted: [1,0],
        checked: [1,2],
        
    };

    $('#legend').LegendBar(settings);
    $('#legend').on('select', function (e, list) {
        console.log(list);
    });
});