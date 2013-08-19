this.ckan.module('daterangepicker-module', function($, _) {
    return {
        initialize: function() {
            $('input[id="daterange"]').daterangepicker({
                showDropdowns: true,
                timePicker: true
            },
            function(start, end) {
                var q = 'metadata_modified:[';
                q = q + start.format('YYYY-MM-DDTHH:mm:ss');
                q = q + 'Z TO ';
                q = q + end.format('YYYY-MM-DDTHH:mm:ss');
                q = q + 'Z]';
                $('input[class="search"]')[0].value = q;
            });
        }
    }
});
