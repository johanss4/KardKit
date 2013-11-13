/////////////////////////////////////////
//           chat interface .js
//        Ben is building this out as a separate interface module 
//             to encapsulate this functionality

//  this will talk directly to clientInterface.js file
/////////////////////////////////////////


    var chatInterface  = function () {
        var _public = {};
    
        //things are going out from our client, Ben handles this!
        _public.sendOutboxMessage = function(outboxMessage){
            alert('Ben takes it from here, sending to client interface which calls server');
            alert('got here with message : ' + outboxMessage);
        };
    
        //things are coming in to our client, Craig handles this!
        _public.receiveInboxMessage = function(inboxMessage) {
              guiInterface.receiveInboxMessage(inboxMessage);
        };
        _public.receivePrivateMessage = function(privateMessage){
              guiInterface.receivePrivateMessage(privateMessage);  
        };
        _public.receiveOutboxConfirmation = function(yourMessage) {
              guiInterface.receiveOutboxConfirmation(yourMessage);  
        };
    
    
        return _public; 
    
    }();
