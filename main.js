var chessboard =new ChessBoard();
chessboard.parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
chessboard.fill_piece_list();
chessboard.to_fen_string();


var gamestart=false;
var ai_color=COLOR.BLACK;
var gamemode={auto:0,manuel:1};
var captured_mode={knight:0,bishop:1,rook:2,queen:3};
var capture=captured_mode.queen;
var st={state:0,from:-1,to:-1,mode:0};
var clicked=-1;


var button_list;
var inputBox=document.getElementById("fenInput");
var buttonInputBox=document.getElementById("enterInput");
var takeMoveButton=document.getElementById("takemove");
var perftButton=document.getElementById("perftTest");
var perftSlider=document.getElementById("perftDepthSlider");
var aimoveButton=document.getElementById("ai_move");

var searchtime_input=document.getElementById("search_time");
var search_depth_input=document.getElementById("search_depth");


var startgame_button=document.getElementById("start_game");
var resetboard_button=document.getElementById("reset_board");

var promotion_select=document.getElementById("promotion_select");
var ai_color_select=document.getElementById("ai_color_select");

var board_turned=false;
var board_checkbox=document.getElementById("checkbox");
var ai_color=COLOR.BLACK;
var ai_think=false;
var worker=new Worker(URL.createObjectURL(new Blob(["("+ww.toString()+")()"], {type: 'text/javascript'})));


//============================================================================
//when page loaded

function ai_move(){
    
    worker.postMessage({fen:chessboard.to_fen_string(),depth:search_depth_input.value,time:searchtime_input.value*1000});
    ai_think=true;
    /*
    if(is_moved==false){
        alert("no move");
    }else{
        printBoard();
    }
    if(is_game_ended()){
        alert("game ended");
    }
    */
} 



worker.onmessage=function(message){
    var move=message.data;
    if(move!=NOMOVE){
        chessboard.makeMove(move);
        chessboard.ply=1;
    }else{
        alert("game over");
        stop_game();
    }
  
    ai_think=false;
    boardColor();
    printBoard();
    console.log(chessboard.ply);
    console.log("complete");
    
    var end=is_game_ended();
    if(end){
        
        alert("game end")
        stop_game();
    }

    
}


window.onload = function () {
    array_of_buttons();
    
    //disable_buttons();

    console.log(promotion_select.value);
   
    takeMoveButton.addEventListener("click",function(){
        if(chessboard.hisPly>0){
            chessboard.takeMove();
            printBoard();
            console.log(chessboard.board);
            st.state=0;
        }
        //if game start double take
        if(gamestart){
            if(chessboard.hisPly>0){
                chessboard.takeMove();
                printBoard();
                console.log(chessboard.board);
                st.state=0;
            }
        }
        chessboard.ply=1;
    })


    perftButton.addEventListener("click",function(){
        chessboard.perftTest(perftSlider.value);
    })
    


    aimoveButton.addEventListener("click",function(){
        if(gamestart){
            return;
        }
        ai_move();
    })


  buttonInputBox.addEventListener("click",function(){
       //on button click event
       
       var fen=inputBox.value;
       chessboard.parseFEN(fen);
       console.log(chessboard.positionKey)
       printBoard();
   })

   startgame_button.addEventListener("click",function(){
       if(gamestart==false){
           startgame_button.innerText="stop game";
           gamestart=true;
           if(ai_color_select.value=="white"){
               ai_color=COLOR.WHITE;
           }else{
               ai_color=COLOR.BLACK;
           }
           if(ai_color==chessboard.turn){
               ai_move();

           }
       }else{
           startgame_button.innerText="start game";
           gamestart=false;
       }
   })
   resetboard_button.addEventListener("click",function(){
         chessboard.parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        chessboard.fill_piece_list();
        boardColor();
        printBoard();
   })

    board_checkbox.addEventListener("change",function(e){
        board_turned=e.target.checked;
        boardColor();
        printBoard();
    })
    boardColor();
    printBoard();
}


// HTML elements
//========================================================================


//create buttons in HTML file
function array_of_buttons() {
    for (var i = 0; i < 64; i++) {
        var b = document.createElement("button");
        b.classList.add("buttons");
        b.style.order = i;
        b.id = i;
        document.getElementById("button_grid").appendChild(b);
    }

    button_list = document.getElementsByClassName("buttons");
    //create input event for buttons
    for (var i = 0; i < button_list.length; i++) {
        button_list[i].addEventListener("click", onButtonClick);
    }
    

}


function enable_buttons() {
    for (var i = 0; i < button_list.length; i++) {
        button_list[i].disabled = false;
    }
}


function disable_buttons() {
    for (var i = 0; i < button_list.length; i++) {
        button_list[i].disabled = true;
    }
}


function onButtonClick(e){
    if(ai_think){
        return;
    }
    var index = parseInt(e.target.id);
    if(board_turned){
        index=board_64_turned[index];
    }
    chessboard.generateMoves();
    boardColor();
       
    var is_ai_move=false;
   
    var square= board_64_to_120[index];

    
    

    var sameTurn=false;
    var piece=chessboard.board[square];
    if(st.state==0 && piece!=PIECES.EMPTY && PieceCol[piece]==chessboard.turn){
        st.state=1;
        st.from=square;
        if(board_turned){
            button_list[board_64_turned[index]].style.background="#FFFF00"
        }else{
            button_list[index].style.background="#FFFF00"
        }
        
    }
    else if(st.state==1){
        if(PieceCol[piece]==chessboard.turn){
            boardColor();
            st.from=square;
            if(board_turned){
                button_list[board_64_turned[index]].style.background="#FFFF00"
            }else{
                button_list[index].style.background="#FFFF00"
            }
        }else{
            st.state=2;
            st.to=square;
        }
       
    }



    for(let i=0;i<chessboard.movelistSize[chessboard.ply];i++){
        var mov=chessboard.movelist[chessboard.ply][i];
        //console.log("from",FROMSQ(mov),"to",TOSQ(mov));
        if(st.state==2){
            var from=FROMSQ(mov);
            var to=TOSQ(mov);
         
            if(st.from==from && st.to==to){
                var prom=true;
                var is_promotion_move=false;
                if((mov& MFLAG_PROM )!=0){
                    is_promotion_move=true;
                    var promotion_piece=PROMOTED(mov);
                    if(promotion_piece==PIECES.WHITE_QUEEN || promotion_piece==PIECES.BLACK_QUEEN){
                        if(promotion_select.value!="queen"){
                            prom=false;
                        }
                    }else if(promotion_piece==PIECES.WHITE_ROOK || promotion_piece==PIECES.BLACK_ROOK){
                        if(promotion_select.value!="rook"){
                            prom=false;
                        }
                    }else if(promotion_piece==PIECES.WHITE_KNIGHT || promotion_piece==PIECES.BLACK_KNIGHT){
                        if(promotion_select.value!="knight"){
                            prom=false;
                        }
                    }else if(promotion_piece==PIECES.WHITE_BISHOP|| promotion_piece==PIECES.BLACK_BISHOP){
                        if(promotion_select.value!="bishop"){
                            prom=false;
                        }
                    }
                }
                if(is_promotion_move&& prom==false){
                    continue;
                }
                var moved= chessboard.makeMove(mov);
                if(moved){
                   
                    chessboard.ply=1;
                    if(gamestart){
                        var end=is_game_ended();
                        if(end){
                            alert("game end");
                            stop_game();
                        }else{
                            is_ai_move=true;
                        }
                      
                    }
                }
                boardColor();
                printBoard();
                st.state=0;
                break;
                
            }
        }else if(st.state==1){
            if(square==FROMSQ(mov)){
                if(chessboard.makeMove(mov)==false){
                    continue;
                }
                chessboard.takeMove();
                var targetSquare= board_120_to_64[TOSQ(mov)];
                if(board_turned){
                    targetSquare=board_64_turned[targetSquare];
                }
                if(chessboard.board[TOSQ(mov)]==PIECES.EMPTY){
                    
                    button_list[targetSquare].style.background="#00FF00";
                }else{
                    button_list[targetSquare].style.background="#FF0000";
                }
                  
                
            }
        }
       
    }
    if(st.state==2){
        boardColor();
        st.state=0;
    }
   
    printBoard();
    if(is_ai_move){
        ai_move();
    }
}



function AddGUIPiece(button,piece) {

    var imageStr;
    switch(piece){
        case PIECES.WHITE_PAWN:
            imageStr= " url(images/white_pawn.png)";
            break;
        case PIECES.WHITE_BISHOP:
            imageStr= " url(images/white_bishop.png)";
            break;  
        case PIECES.WHITE_KNIGHT:
            imageStr= " url(images/white_knight.png)";
            break;    
        case PIECES.WHITE_ROOK:
            imageStr= " url(images/white_rook.png)";
            break; 
        case PIECES.WHITE_QUEEN:
            imageStr= " url(images/white_queen.png)";
            break;      
        case PIECES.WHITE_KING:
            imageStr= " url(images/white_king.png)";
            break;   
        case PIECES.BLACK_PAWN:
            imageStr= " url(images/black_pawn.png)";
            break;
        case PIECES.BLACK_BISHOP:
            imageStr= " url(images/black_bishop.png)";
            break;  
        case PIECES.BLACK_KNIGHT:
            imageStr= " url(images/black_knight.png)";
            break;    
        case PIECES.BLACK_ROOK:
            imageStr= " url(images/black_rook.png)";
            break; 
        case PIECES.BLACK_QUEEN:
            imageStr= " url(images/black_queen.png)";
            break;      
        case PIECES.BLACK_KING:
            imageStr= " url(images/black_king.png)";
            break;  
         default:
             imageStr="";  
             break;                      
            
    }
	
	//var	imageString = "<image src=\"" +"images/black_pawn.png"+ "\" class=\"Piece "+ "\"/>";
	button.style.backgroundImage = imageStr;
    button.style.backgroundSize = '100%';
}


function reset_gui(){
    boardColor();
    printBoard();
}



function boardColor(){
    for(let i=0;i<64;i++){
        if(boardBackGround[i]==0){
            button_list[i].style.background="#CCCCCC"
        }else{
            button_list[i].style.background="#555555"
        }
    }
}


function printBoard(){
    
    for(let i=0;i<64;i++){
        
        var piece;
        if(board_turned){
            piece=chessboard.board[board_64_to_120[board_64_turned[i]]];
        }else{
            piece=chessboard.board[board_64_to_120[i]];
        }
       
        AddGUIPiece( button_list[i],piece);
    }
    this.inputBox.value=chessboard.to_fen_string();
}

var boardBackGround=[0,1,0,1,0,1,0,1,
                     1,0,1,0,1,0,1,0,
                     0,1,0,1,0,1,0,1,
                     1,0,1,0,1,0,1,0,
                     0,1,0,1,0,1,0,1,
                     1,0,1,0,1,0,1,0,
                     0,1,0,1,0,1,0,1,
                     1,0,1,0,1,0,1,0];


function is_game_ended(){
    if(chessboard.fiftyMove>=100){
        return true;
    }
    chessboard.generateMoves();
    var legalmove=0;
    var size=chessboard.movelistSize[chessboard.ply];
    for(let i=0;i<size;i++){
        var move=chessboard.movelist[chessboard.ply][i];
        if(chessboard.makeMove(move)==false){
            continue;
        }
        legalmove+=1;
        chessboard.takeMove();
    }
    if(legalmove==0){
        return true;
    }
   
}

function stop_game(){
    gamestart=false;
    startgame_button.innerText="start game";
    
}

function start_game(){
    gamestart=true;
    startgame_button.innerText="stop game";
   
    
}

var board_64_turned=[63,62,61,60,59,58,57,56,
                     55,54,53,52,51,50,49,48,
                     47,46,45,44,43,42,41,40,
                     39,38,37,36,35,34,33,32,
                     31,30,29,28,27,26,25,24,
                     23,22,21,20,19,18,17,16,
                     15,14,13,12,11,10, 9, 8,
                      7, 6, 5, 4, 3, 2, 1, 0,
                     ]
