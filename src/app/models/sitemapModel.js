/**
 * HABmin - Home Automation User and Administration Interface
 * Designed for openHAB (www.openhab.com)
 *
 * This software is copywrite of Chris Jackson under the GPL license.
 * Note that this licence may be changed at a later date.
 *
 * (c) 2014 Chris Jackson (chris@cd-jackson.com)
 */
angular.module('HABmin.Sitemap', [
    'ngResource'
])

    .factory("SitemapModel", function ($resource) {
        return $resource('/rest/sitemaps',
            {
  //              bookId: '@bookId'
            },
            {
                query: {
                    method: 'GET',
//                    params: { bookId: '@bookI  d' },
                    isArray: false//,
//                    headers: { 'auth-token': 'C3PO R2D2' }
                }
            }
        );
    });