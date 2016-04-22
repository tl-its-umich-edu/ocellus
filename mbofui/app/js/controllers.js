'use strict';
/* global angular, ocellus, $, L, resolveCategory, resolveIcon, moment */

ocellus.controller( 'mapController', [ '$scope', '$filter', '$timeout', '$log', 'leafletData', 'Bof', function ( $scope, $filter, $timeout, $log, leafletData, Bof ) {
  angular.extend( $scope, {
    center: {
      zoom: 16,
      autoDiscover: true
    },
    events: {},
    controls: {
      draw: {}
    },
    layers: {
      baselayers: {
        googleTerrain: {
            name: 'Google Terrain',
            layerType: 'TERRAIN',
            type: 'google'
        },
        googleHybrid: {
          name: 'Google Hybrid',
          layerType: 'HYBRID',
          type: 'google'
      },
        googleRoadmap: {
            name: 'Google Streets',
            layerType: 'ROADMAP',
            type: 'google',
            layerParams: {
              showOnSelector: true
            }
        },
        mapbox_light: {
          name: 'Mapbox Light',
          url: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
          type: 'xyz',
          layerOptions: {
            id: 'gsilver.pk8alhme',
            accessToken: 'pk.eyJ1IjoiZ3NpbHZlciIsImEiOiJjaW1xYmxianowMGZsdXJra2FjbXhpYjE4In0.LL9yfFdOwvatCyCbxBDW_A',
          },
          layerParams: {
            showOnSelector: true
          }
        },
        osm: {
          name: 'OpenStreetMap',
          url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          type: 'xyz'
        },
        terrain: {
          name: 'Terrain',
          url: 'http://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png',
          type: 'xyz',
        },
        osmh: {
          name: 'OpenStreetMap Hot',
          type: 'xyz',
          url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        },
        esriwsm: {
          name: 'Esri World StreetMap',
          type: 'xyz',
          url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
        },
        esrisatellite: {
          name: 'Esri Satellite',
          type: 'xyz',
          url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        }
      },
      overlays: {
        bofs: {
          name: "Bofs",
          type: "markercluster",
          visible: true
        },
        draw: {
          name: 'draw',
          type: 'group',
          visible: true,
          layerParams: {
            showOnSelector: false
          }
        }
      },
      awesomeMarkerIcon: {
        type: 'awesomeMarker',
        markerColor: 'blue'
      },
    }
  } );

  $scope.categories = null;
  $scope.markers = [];
  $scope.markersAll = [];


  $scope.createEventCurrentlocation = function () {
    leafletData.getMap().then( function ( map ) {
      map.locate( {
        setView: true,
        maxZoom: 16
      } );

      function onLocationFound( e ) {
        var radius = e.accuracy / 2;
        $( '#bofModal' ).attr( 'data-coords', [ e.latlng.lat, e.latlng.lng ] );
        L.popup()
          .setLatLng( e.latlng )
          .setContent( '<a href="" data-toggle="modal" data-target="#bofModal">Add an event here?</a>' )
          .openOn( map );
      }
      map.on( 'locationfound', onLocationFound );
    } );
  };

  $scope.$on( "leafletDirectiveMap.contextmenu", function ( event, args ) {
    leafletData.getMap().then( function ( map ) {
      var leafEvent = args.leafletEvent;
      $( '#bofModal' ).attr( 'data-coords', [ leafEvent.latlng.lat, leafEvent.latlng.lng ] );
      L.popup()
        .setLatLng( leafEvent.latlng )
        .setContent( '<a href="" data-toggle="modal" data-target="#bofModal">Add an event here?</a>' )
        .openOn( map );
    } );
  } );

  $( '#postBof' ).on( 'click', function () {
    var coords = $( '#bofModal' ).attr( 'data-coords' ).split( ',' );
    var url = '/api/messages/';
    var startTime = moment($scope.newStartTime).format('YYYY-MM-DDTHH:mm:ssZ');
    var endTime = moment($scope.newEndTime).format('YYYY-MM-DDTHH:mm:ssZ');
    var postingTime = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    var data = {
        "messageText" : $scope.newMessageText,
        "startTime" : startTime,
        "endTime" : endTime,
        "latitude" : coords[0],
        "longitude" : coords[1],
        "altitudeMeters" : 266.75274658203125,//this is being removed but the database still expects it
        "postingTime"  : postingTime
    };
    Bof.PostBof(url,data).then(function(result) {
      var newMarker = {
        lat: result.data.latitude,
        lng: result.data.longitude,
        category: 'cat1',
        message: result.data.messageText,
        layer: 'bofs',
        icon: {
          type: 'awesomeMarker',
          icon: 'record',
          markerColor: 'blue'
        }
      };
      $scope.markersAll.push( newMarker );
      $scope.markers.push( newMarker );
      $scope.totalBofs = $scope.totalBofs + 1;
      leafletData.getMap().then( function ( map ) {
        map.closePopup();
      } );
      $( '#messageText, #newStartTime, #newEndTime' ).val( '' );
      $( '#bofModal' ).modal( 'hide' );
    });
  } );


  $( '#categories a' ).on( 'click', function ( e ) {
    var category = $( this ).attr( 'id' );
    if ( category === 'all' ) {
      $scope.markers = $scope.markersAll;
    } else {
      $scope.markers = $scope.markersAll;
      $scope.markers = $filter( 'filter' )( $scope.markers, {
        category: category
      } );
    }
  } );

var getEvents = function(){
  var bofsUrl = '/api/messages/';
  Bof.GetBofs(bofsUrl).then(function(events) {
    //$log.info(result)
    for (var i = 0; i < events.length; i++) {
      var newMarker = {
        lat: parseFloat( events[i].lat ),
        lng: parseFloat( events[i].lng ),
        category: events[i].category,
        message: events[i].category + '<br> ' + events[i].message,
        layer: 'bofs',
        icon: events[i].icon
      };
      $scope.markersAll.push( newMarker );
      $scope.markers.push( newMarker );
		}
  });
};
  $scope.$watch( "markers", function () {
    $scope.$watch( 'markerFilter', function ( text ) {
      $scope.markersFiltered = $filter( 'filter' )( $scope.markers, {
        message: text
      } );
    } );
  }, true );

  $scope.$on( "leafletDirectiveMarker.dragend", function ( event, args ) {
    //removed Firebase save - leave this as placeholder
  } );

  getEvents();

} ] );
