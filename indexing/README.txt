TEMPORAL FIELDS INDEXING
------------------------

In order to be able to inxed temporal fields into Solr some CKAN's core files should be 
overwritten.

1. Overwrite the schema definition (named schema-2.0.xml) located in CKAN at:

		/usr/lib/ckan/default/src/ckan/ckan/config/solr/schema-2.0.xml
   
   Using the provided one in this plugin:
   
		./config/solr/schema-2.0.xml
		
2. Overwrite the python index (named index.py) located in CKAN at:

		/usr/lib/ckan/default/src/ckan/ckan/lib/search/index.py
		
   Using the provided one in this plugin:

		./lib/search/index.py

3. Reharvest data in order to apply new names for temporal fields 

4. If you need to reindex, from the 'ckan' user run this command:

		paster --plugin=ckan search-index rebuild  -c /etc/ckan/default/production.ini