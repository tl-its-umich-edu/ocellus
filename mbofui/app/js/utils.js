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
  var mine = false;
  var inTime = false;
  var now = moment();
  var leafletList = [];

  _.each(data, function(event){
    if(user.data.results[0].url ===event.owner) {
      mine = true;
    }
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
      owner: event.owner,
      url:event.url,
      mine: mine,
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
      if(value ===undefined || value==='Invalid date')  {
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
  if(moment(start).isAfter(moment()) && currentView ==='/api/events/current/'){
    return {'type':'alert-success','message':'Event created for the future - view in upcoming events.'};
  } else if (moment(start).isSameOrBefore(moment(),'hour') && moment(end).isSameOrAfter(moment(), 'hour')  && currentView ==='/api/events/upcoming/'){
    return {'type':'alert-success','message':'Event created for the current - view in current events.'};
  } else {
    return null;
  }
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
