/*global Firebase*/
(function(angular) {
  'use strict';

  angular.module('skinder')
    .factory('MessageService', ['MSGURL', '$q', '$firebaseArray', MessageService]);
  function MessageService(MSGURL, $q, $firebaseArray) {
    return {
      messagesArray: function messagesArray(postId) {
        var postIdMessageURL = MSGURL.concat('/' + postId);
        var messageRef = new Firebase(postIdMessageURL);
        //todo create a query for the most recent 50 messages on the server
        console.log(postIdMessageURL);
        return $firebaseArray(messageRef);
      }
      //off: function turnMessagesOff() {
      //  fireMessage.$off();
      //}
    };
  }

})(window.angular);
