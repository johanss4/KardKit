var cardSelection = function () {
    var _public = {};
    var srcJack = "../../img/jack.png";
    var srcQueen = "../../img/queen.png";
    var srcKing = "../../img/king.png";
    var srcJackHover = "../../img/jack_h.png";
    var srcQueenHover = "../../img/queen_h.png";
    var srcKingHover = "../../img/king_h.png";
    
    /*private
    -------------------------------------------------*/
    function getPlayerIdOfSelectedCardToTake(){
        for(var i = 1; i < PLAYERS_AT_START; i++){
            if(SELECTED_CARDS[i] !== null && SELECTED_CARDS[i].length > 0){
                return i;
            }
        }
    }
    
    function getSelectedCardIndexFromPlayerId(playerId){
       return SELECTED_CARDS[playerId][0];
    }
    
    function cardIsShown(playerId, cardIndex){
        var visible = false;        
        $("#playerSpot_" + playerId + " > .hand > .card").each(function (index,el){
            if(index === cardIndex){
                if($(el).find("div.front").length > 0){
                     visible = true;   
                }
            }
        });
        return visible;
    }    
    
    function addHighlight(playerId, cardIndex){
        if(cardIsShown(playerId, cardIndex)){
            $("#playerSpot_" + playerId + " > .hand > .card:eq(" + cardIndex + ")").find("div.front").addClass("highlight");        
        }else{
            $("#playerSpot_" + playerId + " > .hand > .card:eq(" + cardIndex + ")").addClass("highlight");
        }
        //face cards
        var img = $("#playerSpot_" + playerId + " > .hand > .card:eq(" + cardIndex + ")").find("img");
        if( img.length > 0 ){
            if( img.attr("src") === srcJack ){ img.attr("src", srcJackHover);} 	   
            if( img.attr("src") === srcQueen ){ img.attr("src", srcQueenHover);} 	   
            if( img.attr("src") === srcKing ){ img.attr("src", srcKingHover);}
	}        
    }
    
    function removeHighlight(playerId, cardIndex){
        if(cardIsShown(playerId, cardIndex)){
            $("#playerSpot_" + playerId + " > .hand > .card:eq(" + cardIndex + ")").find("div.front").removeClass("highlight");        
        }else{
            $("#playerSpot_" + playerId + " > .hand > .card:eq(" + cardIndex + ")").removeClass("highlight");
        }
        //face cards
        var img = $("#playerSpot_" + playerId + " > .hand > .card:eq(" + cardIndex + ")").find("img");
        if( img.length > 0 ){
            if( img.attr("src") === srcJackHover ){ img.attr("src", srcJack);}
            if( img.attr("src") === srcQueenHover ){ img.attr("src", srcQueen);}
            if( img.attr("src") === srcKingHover ){ img.attr("src", srcKing);}
        }

    }
    
    function notAlreadySelected(playerId, cardIndex) {
        return (-1 === $.inArray(cardIndex, SELECTED_CARDS[playerId]));
    }
    
    function playerOwnsCard(playerId, cardObject) {
        var owns = false;
        $("#playerSpot_" + playerId + " > .hand > .card").each( function(i, el){
                if(cardObject === el){
                    owns = true;
                }                
        });
        return owns;
    }
    
    function getPlayerIdOwningCard(cardObject){
        var playerIdOwningCard;
        for(var playerIndex = 0; playerIndex < PLAYERS_AT_START; playerIndex++){            
            if(playerOwnsCard(playerIndex, cardObject)){
              playerIdOwningCard = playerIndex;   
            }
        }
        return playerIdOwningCard;        
    }
	
    /* public
    -------------------------------------------------*/    
    _public.select = function(cardObject){
       var playerId = getPlayerIdOwningCard(cardObject);
       var selectedCardIndex = $("#playerSpot_" + playerId + " > .hand > .card").index(cardObject);
       if(notAlreadySelected(playerId, selectedCardIndex)){
            SELECTED_CARDS[playerId].push(selectedCardIndex);
            addHighlight(playerId,selectedCardIndex);
        }else{
            var arrayIndex = SELECTED_CARDS[playerId].indexOf(selectedCardIndex);
            SELECTED_CARDS[playerId].splice(arrayIndex, 1);
            removeHighlight(playerId, selectedCardIndex);
        } 
    };
    _public.getPlayerIdOfSelectedCardToTake = function(){
       return getPlayerIdOfSelectedCardToTake();
    };
    _public.getSelectedCardIndexFromPlayerId = function(playerId){
       return getSelectedCardIndexFromPlayerId(playerId);
    };
    
    return _public;
}();
