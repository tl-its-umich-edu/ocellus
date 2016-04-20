var bofDataRef = new Firebase( 'https://flickering-fire-3313.firebaseio.com/bofs' );
app.controller( 'mapController', [ '$scope', '$filter', '$timeout', '$log', 'leafletData', function ( $scope, $filter, $timeout, $log, leafletData ) {
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

  $scope.bofIt = function () {
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

      /*
      leafletData.getLayers().then( function ( baselayers ) {
        var drawnItems = baselayers.overlays.draw;
        map.on( 'draw:created', function ( e ) {
          var layer = e.layer;
          drawnItems.addLayer( layer );
          console.log( JSON.stringify( layer.toGeoJSON() ) );
        } );
      } );
      */
    } );
  };

  $scope.markers = [];
  $scope.markersAll = [];

  bofDataRef.on( 'child_added', function ( snapshot ) {
    var marker = snapshot.val();
    var key = snapshot.key();
    newMarker = {
      fbid: key,
      lat: parseFloat( marker.lat ),
      lng: parseFloat( marker.long ),
      category: marker.category,
      message: resolveCategory( marker.category ) + '<div>' + marker.what + '</div>',
      layer: 'bofs',
      icon: resolveIcon( marker.category ),
      draggable: marker.draggable
    };
    $scope.markersAll.push( newMarker );
    $scope.markers.push( newMarker );
  } );


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
    if ( $( '#messageText' ).val() === '' ) {
      $( '#messageText' ).attr( 'aria-invalid', true );
      $( '#messageText' ).closest( 'div' ).addClass( 'has-error' );
      $( '#messageText' ).prev( '.req-text' ).fadeIn( 'fast' );
      return null;
    }

    var what = $( '#messageText' ).val();
    var start = $( '#newStartTime' ).val();
    var end = $( '#newEndTime' ).val();
    var coords = $( '#bofModal' ).attr( 'data-coords' ).split( ',' );

    var marker = {
      user: 'user',
      what: what,
      start: start,
      end: end,
      lat: coords[ 0 ],
      long: coords[ 1 ],
      maybe: 0,
      sure: 0,
      category: $scope.categories,
      draggable: true
    };
    bofDataRef.push( marker );
    leafletData.getMap().then( function ( map ) {
      map.closePopup();
    } );
    $( '#messageText, #newStartTime, #newEndTime' ).val( '' );
    $( '#bofModal' ).modal( 'hide' );
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


  $scope.$watch( "markers", function () {
    $scope.$watch( 'markerFilter', function ( text ) {
      $scope.markersFiltered = $filter( 'filter' )( $scope.markers, {
        message: text
      } );
    } );
  }, true );

  $scope.$on( "leafletDirectiveMarker.dragend", function ( event, args ) {
    var newlatlng = [ args.model.lat, args.model.lng ];
    // procede to update marker on firebase;
    bofDataRefItem = new Firebase( 'https://flickering-fire-3313.firebaseio.com/bofs/' + args.model.fbid );
    bofDataRefItem.update( {
      lat: args.model.lat,
      long: args.model.lng
    } );
  } );
} ] );


var resolveCategory = function ( category ) {
  if ( category ) {
    return '<strong>' + category + '</strong>';
  } else {
    return '';
  }
};

var resolveIcon = function ( category ) {
  return ( {
    'cat1': {
      type: 'awesomeMarker',
      icon: 'cutlery',
      markerColor: 'green'
    },
    'cat2': {
      type: 'awesomeMarker',
      icon: 'heart',
      markerColor: 'red'
    },
    'cat3': {
      type: 'awesomeMarker',
      icon: 'music',
      markerColor: 'orange'
    }
  }[ String( category ).toLowerCase() ] || {
    type: 'awesomeMarker',
    icon: 'record',
    markerColor: 'blue'
  } );
};
