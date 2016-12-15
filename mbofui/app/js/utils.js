/*jshint strict:false */
/* global $, _, document, webshim, moment*/

// register a vote (intent)
// TODO: rewrite the angular way and hook it up to the UI
var vote = function(e) {
    var $thisTarget = $(e.target);
    if ($thisTarget.hasClass("glyphicon")) {
        $thisTarget = $thisTarget.parent('button');
    }
    var $thisTargetContainer = $thisTarget.closest('.voteControls');

    var voteVal = $thisTarget.attr('data_vote');
    var voteValInt = parseInt(voteVal);

    var id = $thisTarget.attr('data_id');
    var data = { 'event': id, 'vote': voteVal };
    $.post("/api/votes/", data, function(result) {
        var currVoteNum = parseInt($thisTargetContainer.find('.voteNum').text());
        $thisTargetContainer.find('.voteNum').text(currVoteNum + voteValInt);
    }).fail(function() {
        // do some failure things
    }).always(function(){
        $thisTargetContainer.find('.btn-group').fadeOut('slow');
    });
};

// util to turn result of requesting event collection into leaflet attr naming scheme
var leafletize = function(data, user){
  var inTime = false;
  var now = moment();
  var leafletList = [];

  _.each(data, function(event){
    if(moment(event.endTime).isAfter(now)){
      inTime=true;
    }
    leafletList.push({
      lat: event.latitude,
      lng: event.longitude,
      category: event.category,
      title: event.title,
      address: event.address,
      message:event.eventText,
      layer: 'events',
      icon: {},
      dateBlob: processDates(event.startTime, event.endTime),
      endTime: event.endTime,
      startTime: event.startTime,
      hashTag: event.hashtag,
      votes: event.votes,
      guests:event.guests,
      definitely:event.definitely,
      maybe:event.maybe,
      owner: event.owner,
      url:event.url,
      inTime:inTime
    });
});
    return leafletList;
};


var normalizeaddressLookupResults = function(data){
  var locationList = [];
  _.each(data, function(location){
    locationList.push({
      locationName: location.display_name || location.formatted_address,
      lat:location.lat || location.geometry.location.lat,
      lng:location.lon || location.geometry.location.lng
    });
  });
  return locationList;
};



var processDates = function(startTime, endTime) {
  var m_startTime = moment(startTime);
  var m_endTime = moment(endTime);
  if (m_startTime.isSame(m_endTime, "day")) {
    return m_startTime.format('M/D') + ' ' + m_startTime.format('h:mm A') + ' - ' + m_endTime.format('h:mm A');
  } else {
    return m_startTime.format('M/D h:mA') + ' - ' + m_endTime.format('M/D h:mm A');
  }
};



// new event validation - either the dates are blank or wrong or the description is blank
var validate = function(data) {
  // data we want to validate
  var toValidate = ['eventText', 'title', 'startTime', 'endTime', 'address'];
  //init array
  var validationFailures = [];
  _.each(data, function(value, key, list){
    // if the key is in the validate array, check the value
    if(_.indexOf(toValidate, key) !== -1) {
      if(value ===undefined || value==='Invalid date' || value==='')  {
        // add to array with key (that corresponds to the id of the offending element)
        validationFailures.push(key);
      }
    }
  });
  if (validationFailures.length){
    return validationFailures;
  } else {
    //special validation
    // event needs to end after now
    if(moment(data.endTime) < moment()){
      validationFailures.push('endTime');
      validationFailures.push('endToSoon');
    }
    // event cannot end before it starts
    if (moment(data.startTime) > moment(data.endTime)) {
      validationFailures.push('backwardsTime');
      validationFailures.push('endTime');
      validationFailures.push('startTime');
    }
    return validationFailures;
  }
};

// construct a DOM element that gets added to popup invitations
// TODO: placeholder - need to use a directive with an actual template
var popupLink = document.createElement('a');
popupLink.setAttribute('data-toggle','modal');
popupLink.setAttribute('data-backdrop','static');
popupLink.setAttribute('data-target','#bofModal');
popupLink.setAttribute('href','');
popupLink.setAttribute('data-target', '#bofModal');
var linktext = document.createTextNode('Add an event here?');
popupLink.appendChild(linktext);

// set options for datetime polyfill
// allow browsers that talk datetime to use native controls  ('replaceUI': false)
// open widget on focus, start view on month/day view, add an up arrow to title
webshim.setOptions("forms-ext", {
  'replaceUI': false,
  'datetime-local': {
    'openOnFocus': true,
    'startView':2,
    'classes': "show-uparrow"
  }
});

var checkTimeSlice  = function(start,end,currentView) {
  if (moment(start).isAfter(   moment().add(7, 'days') )) {
    return {'type':'alert-success','message':'Event start (' + moment(start).format("dddd, MMMM Do YYYY, h:mm:ss a") + ') is more than a week away - will not be visible till start time is less than a week away.'};
  }
   else {
    if(moment(start).isAfter(moment()) && currentView ==='/api/events/current/'){
      return {'type':'alert-success','message':'Event created for the future - view in upcoming events.'};
    } else if (moment(start).isSameOrBefore(moment(),'hour') && moment(end).isSameOrAfter(moment(), 'hour')  && currentView ==='/api/events/upcoming/'){
      return {'type':'alert-success','message':'Event created for the current - view in current events.'};
    } else {
      return null;
    }
  }
};

// function to peer events and intentions - used by text only view
var intentionIncluded = function(eventsList, intentionsList) {
  _.each(eventsList, function(event){
    event.messageSearch = event.category + ' ' +event.message + ' ' + event.title;
    var correlateIntention = _.findWhere(intentionsList, {event: event.url});
    if(correlateIntention){
      event.intention=correlateIntention;
    }
  });
  return eventsList;
};

var addDistance = function(eventList, currentPosition) {
  var coords1 = [currentPosition.coords.longitude,currentPosition.coords.latitude];

  function haversineDistance(coords1, coords2, isMiles) {
    function toRad(x) {
      return x * Math.PI / 180;
    }
    var lon1 = coords1[0];
    var lat1 = coords1[1];
    var lon2 = coords2[0];
    var lat2 = coords2[1];

    var R = 6371; // km

    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    if(isMiles) d /= 1.60934;
    return d;
  }

  _.each(eventList, function(event){
    var coords2 = [event.lng, event.lat];
    event.distance = haversineDistance(coords1, coords2, true);
  });
   return eventList;
};


var reinitTimeFields = function(){
  // add current datetime to startTime and endTime inputs to be used by polyfill
  // as well as default value for start time
  var now = moment().format('YYYY-MM-DDTHH:mm');
  var later = moment().add(1,'hours').format('YYYY-MM-DDTHH:mm');
  $('#startTime').attr('min', now);
  $('#startTime').val(now);
  $('#endTime').attr('min', later);
  $('#endTime').val(later);
};
$(function(){
  webshim.polyfill('forms forms-ext');
  // close expanded nav if user clicks on category or time filter selection
  $(document).on('click','.navbar-collapse.in',function(e) {
    if( $(e.target).is('a') ) {
      $(this).collapse('hide');
    }
  });

  $(document).on('change','#startTime',function(e) {
    var newEndDate = moment($('input#startTime').val()).add(1, 'hours').format('YYYY-MM-DDTHH:mm');
    $('input#endTime').val(newEndDate);
  });

  $(document).on('change','#startTimeEdit',function(e) {
    var newEndDateEdit = moment($('input#startTimeEdit').val()).add(1, 'hours').format('YYYY-MM-DDTHH:mm');
    $('input#endTimeEdit').val(newEndDateEdit);
  });

  if( navigator.userAgent.match(/iPhone|iPad|iPod|Android/i) ) {
      $('.modal').on('show.bs.modal', function() {
          // Position modal absolute and bump it down to the scrollPosition
          $(this)
              .css({
                  position: 'absolute',
                  marginTop: $(window).scrollTop() + 'px',
                  bottom: 'auto'
              });
          // Position backdrop absolute and make it span the entire page
          //
          // Also dirty, but we need to tap into the backdrop after Boostrap
          // positions it but before transitions finish.
          //
          setTimeout( function() {
              $('.modal-backdrop').css({
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: Math.max(
                      document.body.scrollHeight, document.documentElement.scrollHeight,
                      document.body.offsetHeight, document.documentElement.offsetHeight,
                      document.body.clientHeight, document.documentElement.clientHeight
                  ) + 'px'
              });
          }, 0);
      });
  }



});
