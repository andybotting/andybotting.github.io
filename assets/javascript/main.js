$(function() {
    // Apply Bootstrap CSS styles to plain rendered markdown
    $('.md-content table').addClass('table');
    $('.md-content img').addClass('img-fluid');
    $('.md-content img').addClass('shadow');
    $('.md-content blockquote').addClass('blockquote');

    var pages = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: baseurl + '/search.json'
    });

    $('#search-box').typeahead({
        minLength: 0,
        highlight: true
    }, {
        name: 'pages',
        display: 'title',
        source: pages
    });

    $('#search-box').bind('typeahead:select', function(ev, suggestion) {
        window.location.href = suggestion.url;
    });

});
