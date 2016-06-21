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
var leafletize = function(data){
  var leafletList = [];
  _.each(data, function(event){
    leafletList.push({
      lat: event.latitude,
      lng: event.longitude,
      category: event.category,
      message:event.eventText,
      layer: 'events',
      icon: {},
      dateBlob: processDates(event.startTime, event.endTime),
      endTime: event.endTime,
      startTime: event.startTime,
      hashTag: event.hashtag,
      votes: event.votes,
      owner: event.owner
    });
});
    return leafletList;
};

var processDates = function(startTime, endTime) {
  var m_startTime = moment(startTime);
  var m_endTime = moment(endTime);
  if (m_startTime.isSame(m_endTime, "day")) {
    return m_startTime.format('M/D') + ' ' + m_startTime.format('h:mA') + ' - ' + m_endTime.format('h:mA');
  } else {
    return m_startTime.format('M/D h:mA') + ' - ' + m_endTime.format('M/D h:mA');
  }
};



// new event validation - either the dates are blank or wrong or the description is blank
var validate = function(data) {
  //init array
  var validationFailures = [];
  _.each(data, function(value, key, list){
    if(value ===undefined || value==='Invalid date') {
      // add to array with key (that corresponds to the id of the offending element)
      validationFailures.push(key);
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
// force all browsers to use widget
// open widget on focus, start view on month/day view, add an up arrow to title
webshim.setOptions("forms-ext", {
  'replaceUI': true,
  'datetime-local': {
    'openOnFocus': true,
    'startView':2,
    'classes': "show-uparrow"
  }
});

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
});
