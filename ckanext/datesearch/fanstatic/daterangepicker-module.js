this.ckan.module('daterangepicker-module', function($, _) {
    return {
        initialize: function() {

            // Add hidden <input> tags #ext_startdate and #ext_enddate,
            // if they don't already exist.
            var form = $("#dataset-search");
            if ($("#ext_startdate").length === 0) {
                $('<input type="hidden" id="ext_startdate" name="ext_startdate" />').appendTo(form);
            }
            if ($("#ext_enddate").length === 0) {
                $('<input type="hidden" id="ext_enddate" name="ext_enddate" />').appendTo(form);
            }

            // Add a date-range picker widget to the <input> with id #daterange
            $('input[id="daterange"]').daterangepicker({
                ranges: {
                   'Today': [moment().startOf('day'), moment().endOf('day')],
                   'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                   'Last 7 Days': [moment().subtract('days', 6), moment()],
                   'Last 30 Days': [moment().subtract('days', 29), moment()],
                   'This Month': [moment().startOf('month'), moment().endOf('month')],
                   'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                },
                startDate: moment().subtract('days', 29),
                endDate: moment(),
                showDropdowns: true,
                timePicker: true
            },
            function(start, end) {

                // Bootstrap-daterangepicker calls this function after the user
                // picks a start and end date.

                // Format the start and end dates into strings in a date format
                // that Solr understands.
                start = start.format('YYYY-MM-DDTHH:mm:ss') + 'Z';
                end = end.format('YYYY-MM-DDTHH:mm:ss') + 'Z';

                // Set the value of the hidden <input id="ext_startdate"> to
                // the chosen start date.
                $('#ext_startdate').val(start);

                // Set the value of the hidden <input id="ext_enddate"> to
                // the chosen end date.
                $('#ext_enddate').val(end);

                // Submit the <form id="dataset-search">.
                $("#dataset-search").submit();
            });
        }
    }
});
