# Commercial Real Estate

## Using the ArcGIS Platform GeoEnrichment Service for Commercial Real Estate Site Selection


### Demo Web Application

> Check out the demo [here](https://apl.bd.esri.com/CommercialRealEstate/index.html).


### Details

This demo focuses on a simple site selection use-case for commercial real estate. Users can select from a pre-defined list of commercial
real estate types such as retail, office, industrial or mixed-use. For each type a different list of sites is presented for the user to
select from. When a site is selected the preview map will zoom to that site to provide context about the location. Selecting the action
button for the site will start the geoenrichment process for that site. A new panel is added showing details about the site, a map of 
the site, and various details retrieved from the geoenrichment service. The search area is based on the type of site and varies from 
simple distances to walk and drive travel times. 


### GeoEnrichment

> This demo application uses the [GeoEnrichment Service](https://developers.arcgis.com/documentation/mapping-apis-and-services/demographics/services/geoenrichment-service/) from [ArcGIS Platform](https://developers.arcgis.com/documentation/mapping-apis-and-services/arcgis-platform/).

GeoEnrichment is the process of enhancing existing data with additional location-based information about the people and places in a specific area.
The additional information can drive better understanding, analysis, and decision making. For example, you can submit a point or polygon to the 
GeoEnrichment service and retrieve demographics and other facts associated with the location and surrounding area.

The GeoEnrichment service uses a sophisticated data apportionment methodology to aggregate demographic information for rings and other polygons.
For example, in the U.S. and Canada, data apportionment relies mostly on census block points. Block points are centroids derived from census block
boundaries, the most detailed level of census tabulation available. They contain attributes for the actual count of people and households living in
the associated block. For most other countries and regions settlement points are used for data apportionment. Settlement points are modeled by Esri
and provide an estimate of the likelihood of human settlement.

> Developers can see how the GeoEnrichment Service is used in this demo [here](https://github.com/jgrayson-apl/CommercialRealEstate/blob/master/js/GeoenrichmentUtils.js#L70) using the [ArcGIS REST JS](https://developers.arcgis.com/arcgis-rest-js/) API.

> Learn more about [GeoEnrichment](https://www.esri.com/en-us/arcgis/products/arcgis-platform/services/geoenrichment), [Tapestry Segmentation](https://storymaps.arcgis.com/stories/1ff4e014a1b3444b871dc4c3d906d946), and [Real Estate](https://www.esri.com/en-us/industries/real-estate/overview) solution at Esri.


### Contact

For questions about the demo web application:

> John Grayson | Prototype Specialist | Geo Experience Center\
> Esri | 380 New York St | Redlands, CA 92373 | USA\
> T 909 793 2853 x1609 | [jgrayson@esri.com](mailto:jgrayson@esri.com?subject=Commercial%20Real%20Estate%20Demo&body=Hi%20John,%0A%20%20I%20have%20a%20quesiton%20about%20the%20Commercial%20Real%20Estate%20demo.) | [apl.esri.com](https://apl.esri.com) | [esri.com](https://www.esri.com)


