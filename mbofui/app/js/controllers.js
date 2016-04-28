'use strict';
/* global mbofuiApp, moment */

mbofuiApp.controller('mbofuiAppController', ['$scope', 'Bof', '$log', '$window', '$compile', function($scope, Bof, $log, $window, $compile) {


    var pos = $window.navigator.geolocation.getCurrentPosition(posSuccess, posError);
    

    function posSuccess(pos) {
        var latlng = new google.maps.LatLng(pos.coords.latitude,
            pos.coords.longitude);
        var options = {
            zoom: 18,
            center: latlng,
            mapTypeControl: true,
            mapTypeId: google.maps.MapTypeId.HYBRID
        };
        window.map = new google.maps.Map(document.getElementById('map'), options);

        var marker = new google.maps.Marker({
            position: latlng,
            map: window.map
        });
        getBofs(map);
    }

    function posError(map) {
        getBofs(map);
    }

    function getBofs(map) {
        var bofsUrl = '/api/events/'
        Bof.GetBofs(bofsUrl).then(function(result) {
            // FIXME: Add support for Django REST pagination, if it's enabled.
            var bofResults = result.data.results || result.data; // with or without REST pagination
            $scope.totalBofs = bofResults.length;
            angular.forEach(bofResults, function(bof) {
                var marker = new google.maps.Marker({
                    position: { lat: bof.latitude, lng: bof.longitude },
                    map: window.map
                });
                var iconFile = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'; 
                marker.setIcon(iconFile);
                var $markerContent = ('<div class="voteControls"><br><div class="pull-left">Votes: <span class="voteNum">' + bof.votes + '</span></div><div class="pull-right btn-group"><button class="btn btn-primary btn-xs up" data_vote="-1" data_id="' + bof.url + '" onclick="vote(event)"><span class="glyphicon glyphicon-thumbs-down"></span></button>&nbsp;<button class="btn btn-primary btn-xs" data_vote="+1" data_id="' + bof.url + '"onclick="vote(event)"><span class="glyphicon glyphicon-thumbs-up"></span></button></div></div>');
                google.maps.event.addListener(marker, 'click', function() {
                    var infowindow = new google.maps.InfoWindow({
                        content: bof.eventText + $markerContent
                    });
                    
                    infowindow.open(map, marker);
                });



            });

        });
     }

// placeholder for angular impl

/*     $scope.vote = function(which){
        alert(which)
        $log.info(which)
     }
*/    
    $scope.postBof = function(map) {
        var pos = $window.navigator.geolocation.getCurrentPosition(posSuccess, posError);

        function posSuccess(pos, map) {
            $scope.coords = pos.coords;
            // serialize the inputs to create a URL
            var url = '/api/events/';
            //2016-02-22T23:39:29Z
            var startTime = moment($scope.newStartTime).format('YYYY-MM-DDTHH:mm:ssZ');
            var endTime = moment($scope.newEndTime).format('YYYY-MM-DDTHH:mm:ssZ');
            var postingTime = moment().format('YYYY-MM-DDTHH:mm:ssZ')
            var data = {
                "eventText" : $scope.newEventText,
                "startTime" : startTime,
                "endTime" : endTime,
                "latitude" : $scope.coords.latitude,
                "longitude" : $scope.coords.longitude,
                "altitudeMeters" : $scope.coords.accuracy,
                "postingTime"  : postingTime
            }
            Bof.PostBof(url,data).then(function(result) {
                var marker = new google.maps.Marker({
                    position: { lat: result.data.latitude, lng: result.data.longitude },
                    map: window.map,
                    zIndex: 10000
                });

                google.maps.event.addListener(marker, 'click', function() {
                    var infowindow = new google.maps.InfoWindow({
                        content: result.data.eventText
                    });
                    infowindow.open(window.map, marker);
                });
                $scope.totalBofs = $scope.totalBofs + 1;

                var iconFile = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'; 
                marker.setIcon(iconFile); 
            });
        }

        function posError(err) {
            $log.info('ERROR(' + err.code + '): ' + err.message);
        }
    };
}]);
