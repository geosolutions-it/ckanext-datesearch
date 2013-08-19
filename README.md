How to implement a temporal search widget for CKAN
==================================================

Create extension and plugin
---------------------------

First create a CKAN extension `ckanext-datesearch` containing a plugin
`datesearch`. The plugin doesn't need to do anything yet.
See <http://docs.ckan.org/en/943-writing-extensions-tutorial/writing-extensions.html>.


Add template directory and Fanstatic library
--------------------------------------------

The plugin needs to implement `IConfigurable` and add register a template
directory and a Fanstatic library directory with CKAN.
[ckanext/datesearch/plugin.py](ckanext/datesearch/plugin.py):

    import ckan.plugins as plugins
    import ckan.plugins.toolkit as toolkit


    class DateSearchPlugin(plugins.SingletonPlugin):
        plugins.implements(plugins.IConfigurer)

        def update_config(self, config):
            toolkit.add_template_directory(config, 'templates')
            toolkit.add_resource('fanstatic', 'ckanext-datesearch')

Also create the directories
[ckanext/datesearch/templates/](ckanext/datesearch/templates/) and
[ckanext/datesearch/fanstatic/](ckanext/datesearch/fanstatic/).

`templates` is a directory where we can put custom templates that will override
the CKAN core ones.

`fanstatic` is a [Fanstatic](ckanext/datesearch/fanstatic/) resource directory.
CKAN uses Fanstatic to serve static files like CSS, JavaScript or image files,
because Fanstatic provides features like bundling, minifying, caching, etc.


Add static files for the date-range picker widget
-------------------------------------------------

[fanstatic/daterangepicker-bs3.css](ckanext/datesearch/fanstatic/daterangepicker-bs3.css),
[fanstatic/daterangepicker.js](ckanext/datesearch/fanstatic/daterangepicker.js),
and [fanstatic/moment.js](ckanext/datesearch/fanstatic/moment.js)
are some static CSS and JavaScript files that we're
using to get a GUI date-range picker widget. We're using Dan Grossman's
[bootstrap-daterangepicker](https://github.com/dangrossman/bootstrap-daterangepicker).

Adding the files into the `fanstatic` directory in our extension just means
that those files will be available when we need them in our templates later.


Customize the dataset search page template
------------------------------------------

Create the directory [ckanext/datesearch/templates/package/](ckanext/datesearch/templates/package/),
and open the file [ckanext/datesearch/templates/package/search.html](ckanext/datesearch/templates/package/search.html):

    {% ckan_extends %}

    {% block secondary_content %}
      {% resource 'ckanext-datesearch/moment.js' %}
      {% resource 'ckanext-datesearch/daterangepicker.js' %}
      {% resource 'ckanext-datesearch/daterangepicker-bs3.css' %}
      {% resource 'ckanext-datesearch/daterangepicker-module.js' %}

      <section class="module module-narrow module-shallow">
        <h2 class="module-heading">
          <i class="icon-medium icon-filter"></i>
            Date
            <a href="" class="action">Clear</a>
          </h2>
          <fieldset class="module-content">
            <div class="control-group">
              <label class="control-label" for="daterange">Date modified</label>
              <div class="controls">
                <div class="input-prepend">
                  <span class="add-on"><i class="icon-calendar"></i></span>
                  <input type="text" style="width: 150px" name="daterange"
                        id="daterange" data-module="daterangepicker-module" />
                </div>
              </div>
            </div>
          </fieldset>
        </section>

      {{ super() }}
    {% endblock %}

This is Jinja templates that overrides the [templates/package/search.html](https://github.com/okfn/ckan/blob/release-v2.0.2/ckan/templates/package/search.html)
template in CKAN core:

* `{% ckan_extends %}` means this template inherits from the corresponding
  core template

* Look in the core template file to see what Jinja blocks are available, in
  this case we're overriding the `{% block secondary_content %}`.

* `{% resource 'ckanext-datesearch/moment.js' %}` tells Fanstatic to load the
  `moment.js` file from our `fanstatic` directory into this page. We load a
  number of custom resource files in our template:

        {% resource 'ckanext-datesearch/moment.js' %}
        {% resource 'ckanext-datesearch/daterangepicker.js' %}
        {% resource 'ckanext-datesearch/daterangepicker-bs3.css' %}
        {% resource 'ckanext-datesearch/daterangepicker-module.js' %}

* `{{ super() }}` means to insert the contents of the block from the core
  template.

* The rest of the stuff inside `{% block secondary_content %}` is the custom
  stuff that we're adding to the top of the sidebar. Most of the code is just
  to make it fit into the CKAN theme. The important bit is:

        <input type="text" style="width: 150px" name="daterange"
               id="daterange" data-module="daterangepicker-module" />

  Adding a `data-module="daterangepicker-module"` attribute to an HTML element
  tells CKAN to find the `daterangepicker-module` JavaScript module and load
  it into the page after this element is rendered.


Implement the `daterangepicker-module` JavaScript module
--------------------------------------------------------

CKAN uses _JavaScript modules_ to load snippers of JavaScript into the page.
When we added the `data-module="daterangepicker-module"` attribute to our
`<input>` tag in our template earlier, we told CKAN to include the
`daterangepicker-module` JavaScript module into our page. We now need to
provide that module. [fanstatic/daterangepicker-module.js](ckanext/datesearch/fanstatic/daterangepicker-module.js):

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

CKAN will call the `initialize` function when the page loads. This function
uses jQuery and bootstrap-daterangepicker to add a JavaScript date-range picker
widget to the `<input>` tag with `id="daterange"`:

    $('input[id="daterange"]').daterangepicker({
        showDropdowns: true,
        timePicker: true
    },

Finally, bootstrap-daterangepicker supports a *callback function* that will
be called after the user selects two dates. We use the callback function to add
the two dates into the dataset search box, using the right Solr search syntax:

    function(start, end) {
        var q = 'metadata_modified:[';
        q = q + start.format('YYYY-MM-DDTHH:mm:ss');
        q = q + 'Z TO ';
        q = q + end.format('YYYY-MM-DDTHH:mm:ss');
        q = q + 'Z]';
        $('input[class="search"]')[0].value = q;
    });
