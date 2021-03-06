

var fs = require('fs');

function getExtension(filePath){
  var extension = filePath.substring(filePath.lastIndexOf("."), filePath.length);
  return extension;
}
//these are the only file types we will support for now
extensions = {
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "application/javascript",
    ".png" : "image/png",
    ".gif" : "image/gif",
    ".jpg" : "image/jpeg",
    ".svg" : "image/svg+xml",
    ".ttf" : "text/css",
    ".woff": "text/css"
};

//helper function handles file verification
function getFile(filePath,res,page404,mimeType){
    //does the requested file exist?
    console.log("Requesting: "+filePath);
    fs.exists(filePath,function(exists){
        //if it does...
        if(exists){
            console.log("File Exists");
            //read the fiule, run the anonymous function
            fs.readFile(filePath,function(err,contents){
                if(!err){
                    //if there was no error
                    //send the contents with the default 200/ok header
                    res.writeHead(200,{
                        "Content-type" : mimeType,
                        "Content-Length" : contents.length
                    });
                    res.end(contents);
                } else {
                    //for our own troubleshooting
            
                };
            });
        } else {
            //if the requested file was not found
            //serve-up our custom 404 page
            fs.readFile(page404,function(err,contents){
                //if there was no error
                if(!err){
                    //send the contents with a 404/not found header 
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(contents);
                } else {
                    //for our own troubleshooting
                    
                };
            });
        };
    });
};

//a helper function to handle HTTP requests
function requestHandler(req, res) {
    console.log("\n -----------------------------");
    console.log("URL Request: " + req.url);
    //fileName = path.basename(req.url) || 'home.html',
    if (req.url == "/") {
      var fileName = '/home.html';
    }else{
      var fileName = req.url;
    }
    var ext = getExtension(fileName);
    var localFolder = ".",
    page404 = localFolder + '/404.html';

    //do we support the requested file type?
    if(!extensions[ext]){
        //for now just send a 404 and a short message
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end("<html><head></head><body>The requested file type is not supported</body></html>");
    };
 
    //call our helper function
    //pass in the path to the file we want,
    //the response object, and the 404 page path
    //in case the requestd file is not found
    getFile((localFolder + fileName),res,page404,extensions[ext]);
};
var http = require('http');
var server = http.createServer(requestHandler).listen(8127, "142.4.210.12");
        console.log('Server running at http:142.4.210.12:8127/');
var io = require('socket.io');
var socket = io.listen(server);
var Room = require('./js/room.js');
var Player = require('./js/player.js');
var LobbyCommunication = require('./js/LobbyCommunication.js');
var lobby = new LobbyCommunication();

// Get size of an object (used for players object)
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};



/************************************************************************************************************************************************
*************************************************************************************************************************************************
****************************************************************Socket Connections **************************************************************
*************************************************************************************************************************************************
************************************************************************************************************************************************/

socket.on('connection', function (client) {

    /*********************************************************************
    ********************** KARD KIT LOBBY FUNCTIONS ************************
    **********************************************************************/

    /********************************************************************
        Created By: Erik Johansson      On: 10/16/2013
        This function adds a player to the lobby page, and updates everyone in
        lobby's page to show that they joing
    ********************************************************************/  
    client.on('addPlayer', function(playerName){
        console.log("adding player -----");

        if (lobby.checkValidPlayer(playerName)){
            var player = lobby.createPlayer(playerName, client.id);
            if(player != null){
                if(lobby.addPlayerToLobby(player)){
                    console.log("******** Player (" + lobby.players[client.id].name + ") with id: (" + lobby.players[client.id].id + ") has connected. ********");
                    console.log("People in Lobby: ");
                    for(var i = 0; i < lobby.lobbyRoom.people.length; i++){
                        console.log("   " + lobby.lobbyRoom.people[i].name); 
                    }
                    client.join(lobby.lobbyRoom);
                    socket.sockets.in(lobby.lobbyRoom).emit('playerAddedToLobby',lobby.getPlayerListHTML(), lobby.players[client.id].name);
                    socket.sockets.in(lobby.lobbyRoom).emit('updatedGamesList',lobby.getGameRoomList());
                    socket.sockets.in(lobby.lobbyRoom).emit('updatePlayerListGameRoom', lobby.getCreatePlayerListHTML());
                    client.emit('succesfullyJoined');
                }else{
                    console.log("Player: " + player.name +" unable to join the lobby");
                }
            }
        }else{
            console.log("player (" + player +") already exists!! or invalid player name");
        }
    });
 
    
    /********************************************************************
        Created By: Erik Johansson      On: 10/16/2013
        Checks if username is valid 
    ********************************************************************/  
    client.on('validatePlayer', function(playerName){
        client.emit("checkValidPlayer", lobby.checkValidPlayer(playerName));
    });

    /********************************************************************
        Created By: Erik Johansson      On: 10/16/2013
        Called when user updates their status; all players in lobby see status update
    ********************************************************************/  
    client.on("updateStatus", function(status){
        lobby.players[client.id].status = status;
        socket.sockets.in(lobby.lobbyRoom).emit('updatePlayerList',lobby.getPlayerListHTML());
        socket.sockets.in(lobby.lobbyRoom).emit('updatePlayerListGameRoom', lobby.getCreatePlayerListHTML());
    });

    /********************************************************************
        Created By: Erik Johansson      On: 10/16/2013
        This function handles when players disconnect
        Called when user disconnects from server !!!!!!!!!! NOT IMPLEMENTED YET 
    ********************************************************************/  
    client.on('disconnect', function(){
        console.log("******** Player with id: (" + client.id + ") with name: ("+ lobby.players[client.id] +") has disconnected ********");
        delete lobby.players[client.id];
        for(var key in players) {
          console.log("******** Remaining players: " + key + ": " + players[key] +"********");
        }     
    });

    /********************************************* Creating Games ****************************************************** */

    /*Creates the list of available playres for game creation modal */
    /********************************************************************
        Created By: Erik Johansson      On: 10/16/2013
        - Is called when lobby client needs to see list of available players to join game
        - Creates the list of available players for game creation modal
    ********************************************************************/  
    client.on("getCreateGamePlayerListHTML", function(){
        var table = lobby.getCreatePlayerListHTML();
        socket.sockets.in(lobby.lobbyRoom).emit('updatePlayerListGameRoom', table);
    });
    
    
    /********************************************************************
        Created By: Erik Johansson      On: 10/16/2013
        - Checks if valid game name, then creates it if true 
        - This function will create a GameRoom as well as a InvitedRoom
        - The GameRoom contains all the game information, the invited room keeps a list of all invited players. 
        - This invited room makes it easier to emit to all invited playres 
    ********************************************************************/  
    client.on("validateGame", function(gameName, password, invitedPlayers){
        if(lobby.validateGame(gameName)){
            var room = lobby.createGame(gameName, password, invitedPlayers, client.id, 4);
            client.join(room.name);
            
            var invitedGameName = gameName + "_Invited";
            var invitedRoom = lobby.createInviteeRoom(invitedPlayers, invitedGameName, lobby.players[client.id]);
            if(invitedRoom.invited != null && invitedRoom.invited.length != 0){
                for(var i in invitedRoom.invited){
                    socket.sockets.socket(invitedRoom.invited[i].id).join(invitedRoom.name);
                }
                socket.sockets.in(invitedRoom.name).emit('playerInvited', lobby.players[client.id].name +" has invited you to play a game!");
            }

            var table = lobby.getGameRoomList();
            socket.sockets.in(lobby.lobbyRoom).emit('updatedGamesList', table);
            client.emit('moveToGame');
        }
    });

    
    /*********************************************************************
    ********************** JOINING GAME FUNCTIONS ************************
    **********************************************************************/


    /********************************************************************
        Created By: Erik Johansson      On: 10/30/2013
        - This function is called when a user clicks on join game.
        - It adds the player to the game room
    ********************************************************************/  
    client.on('joinGame', function(){
        console.log(lobby.players[client.id].invitedGame);
        var player = lobby.players[client.id]
        //Remove player from invited room
        client.leave(player.invitedGame);
        //Remove room if empty
        lobby.checkEmptyInviteRoom(player.invitedGame);
        //Join Created Room
        var gameName = (player.invitedGame).replace("_Invited", "");
        var room = lobby.addPlayerToGame(gameName, lobby.players[client.id]);
        if(room != null) client.join(room.name);
        console.log("about to update gameList");
        var table = lobby.getGameRoomList();
        socket.sockets.in(lobby.lobbyRoom).emit('updatedGamesList', table);
        
    });


    /*********************************************************************
    ********************** Game ROOM Functions ************************
    **********************************************************************/


    client.on("drawStuff",function(){
        var room = players[client.id].room;

    });

     /*********************************************************************
    ********************** CHAT FUNCTIONS ************************
    **********************************************************************/


    /********************************************************************
        Created By: Erik Johansson      On: 10/30/2013
        - This function is called when a user clicks sends a public message
    ********************************************************************/  
    client.on("chatSendPublicMessage", function(message){
        socket.sockets.in(lobby.lobbyRoom).emit('receiveInboxMessage', message, "message");
    });

});



