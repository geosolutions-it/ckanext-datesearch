import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import logging

log = logging.getLogger(__name__)

class DateSearchPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IPackageController, inherit=True)

    def update_config(self, config):
        toolkit.add_template_directory(config, 'templates')
        toolkit.add_resource('fanstatic', 'ckanext-datesearch')

    def before_search(self, search_params):
        extras = search_params.get('extras')
        if not extras:
            # There are no extras in the search params, so do nothing.
            return search_params
        start_date = extras.get('ext_startdate')
        end_date = extras.get('ext_enddate')
        if not start_date or not end_date:
            # The user didn't select a start and end date, so do nothing.
            return search_params

        # Add a date-range query with the selected start and end dates into the
        # Solr facet queries.
        fq = search_params['fq']
        fq = '{fq} +(extras_temporal_extent_begin:[{start_date} TO {end_date}] OR extras_temporal_extent_end:[{start_date} TO {end_date}] OR extras_temporal_extent_instant:[{start_date} TO {end_date}])'.format(
            fq=fq, start_date=start_date, end_date=end_date)
        search_params['fq'] = fq
		
	    #log.info('search_params: %r', fq)
		
        return search_params
        
    def before_index(self, pkg_dict):
        # include the temporal extras in the main namespace
        extras = pkg_dict.get('extras', [])
        for extra in extras:
            key, value = extra['key'], extra['value']

            if key == 'temporal-extent-instant':
                log.debug('...Creating index for temporal field: %s ', key)
                pkg_dict['extras_' + 'temporal_extent_instant'] = value
            elif key == 'temporal-extent-begin':
                log.debug('...Creating index for temporal field: %s', key)
                pkg_dict['extras_' + 'temporal-extent-begin'] = value
            elif key == 'temporal-extent-end':
                log.debug('...Creating index for temporal field: %s', key)
                pkg_dict['extras_' + 'temporal-extent-end'] = value

        return pkg_dict
