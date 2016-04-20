'use strict';
/* global $ */

var vote = function(e) {
    var $thisTarget = $(e.target);
    if ($thisTarget.hasClass("glyphicon")) {
        $thisTarget = $thisTarget.parent('button');
    }
    var $thisTargetContainer = $thisTarget.closest('.voteControls');

    var voteVal = $thisTarget.attr('data_vote');
    var voteValInt = parseInt(voteVal);

    var id = $thisTarget.attr('data_id');
    var data = { 'message': id, 'vote': voteVal };
    $.post("/api/votes/", data, function(result) {
        var currVoteNum = parseInt($thisTargetContainer.find('.voteNum').text());
        $thisTargetContainer.find('.voteNum').text(currVoteNum + voteValInt);
    }).fail(function() {
        // do some failure things
    }).always(function(){
        $thisTargetContainer.find('.btn-group').fadeOut('slow');
    });
};




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
