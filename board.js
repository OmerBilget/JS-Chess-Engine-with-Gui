class ChessBoard{
    board;
    turn;
    fiftyMove;
    hisPly;
    history;
    ply;
    castlePerm; // 1000 bq 0100 bk 0010 wq 0001 bq
    material;
    pieceNumber;
    pieceList;
    enPassantSquare;
    positionKey;
    movelist;
    moveScores;
    movelistSize;

    searchStopped;
    searchStart;
    searchEnd;
    searchNodes=0;
    searchFhf=0;
    searchFh=0;
    pvTable=[];
    pvArray=new Array(MAXDEPTH);
    searchHistory=new Array(14*120);
    searchKillers= new Array(3*MAXDEPTH);

    constructor(){
        this.board=new Array(BOARD_SIZE);
        this.turn=COLOR.WHITE;
        this.fiftyMove=0;
        this.hisPly=0;
        this.ply=0; 
        this.castlePerm=0;
        this.material=new Array(2);
        this.pieceNumber=new Array(13); //piece array
        this.pieceList=new Array(14); 
        this.enPassantSquare=-1;
        this.positionKey=0;
        this.movelist=new Array(MAXDEPTH);
        //every depth has own movelist
        this.moveScores=new Array(MAXDEPTH);
        this.movelistSize=new Array(MAXDEPTH);
        for(let i=0;i<this.movelist.length;i++){
            this.movelist[i]=new Array(MAXPOSITIONMOVES);
        }
        for(let i=0;i<this.moveScores.length;i++){
            this.moveScores[i]=new Array(MAXPOSITIONMOVES);
        }
        this.history=[];
        this.searchStopped=false;
        this.init_board();
    }

    init_pv_table(){
        for(let i=0;i<PV_SIZE;i++){
            this.pvTable.push(
                {move:NOMOVE,positionKey:0}
            );
        }
    }
    init_history(){
        for(let i=0;i<MAXGAMEMOVES;i++){
            this.history.push(
                {move:NOMOVE,castlePerm:0,enPassantSquare:0,fiftyMove:0,positionKey:0}
            );
        }
    }
    init_board(){

        for(let i=0;i<BOARD_SIZE;i++){
            this.board[i]=empty_board[i];
        }
        
        for(let i=0;i<this.pieceNumber.length;i++){
            this.pieceNumber[i]=0;
        }
        for(let i=0;i<this.pieceList.length;i++){
            this.pieceList[i]=new Array(10);
            for(let j=0;j<10;j++){
                this.pieceList[i][j]=i;
            }
        }
        initHashKey();
        InitMvvLva();
        this.init_history();
        this.init_pv_table();
        
        
    }

    reset_board(){
        for(let i=0;i<BOARD_SIZE;i++){
            this.board[i]=empty_board[i];
        }

        for(let i=0;i<this.pieceNumber.length;i++){
            this.pieceNumber[i]=0;
        }
        for(let i=0;i<this.pieceList.length;i++){
            for(let j=0;j<10;j++){
                this.pieceList[i][j]=PIECES.EMPTY;
            }
        }
        this.material[0]=0;
        this.material[1]=0;
        this.turn=COLOR.WHITE;
        this.ply=0;
        this.hisPly=0;
        this.castlePerm=0;
        this.positionKey=0;
        for(let i=0;i<64;i++){
            this.movelistSize[i]=0;
        }
        
        
    }

    generatePositionKey(){
        var finalKey=0;
        var piece=PIECES.EMPTY;
        
        for(let i=0;i<BOARD_SIZE;i++){
            piece=this.board[i];
            if(piece!=PIECES.EMPTY &&piece!=SQUARES.OUT_OF_BOARD){
                finalKey^=PieceKeyArray[piece][i];
            }
        }

        if(this.turn==COLOR.WHITE){
            finalKey^=SideKey;
        }
        finalKey^=this.castlePerm;
        return finalKey;
    }
    
    parseFEN(FEN){
        console.log(FEN);
        this.reset_board();
        var FEN_array=FEN.split(" ");
        FEN_array=FEN_array.filter(function(value) {return value != ""; });
        
        var counter=0;
        var sq=21; 
        //parse board;
        //console.log("hhh");
        for(let i=0;i<FEN_array[0].length;i++){
            var ch=FEN_array[0][i];
            //console.log(ch);
            if(isCharNum(ch)){
            
                sq+=char_to_int(ch);
            }else if(ch=="p"){
                this.board[sq]=PIECES.BLACK_PAWN;
                sq+=1;
            }else if(ch=="n"){
                this.board[sq]=PIECES.BLACK_KNIGHT;
                sq+=1;
            }else if(ch=="b"){
                this.board[sq]=PIECES.BLACK_BISHOP;
                sq+=1;
            }else if(ch=="r"){
                this.board[sq]=PIECES.BLACK_ROOK;
                sq+=1;
            }else if(ch=="q"){
                this.board[sq]=PIECES.BLACK_QUEEN;
                sq+=1;
            }else if(ch=="k"){
                this.board[sq]=PIECES.BLACK_KING;
                sq+=1;
            }else if(ch=="P"){
                this.board[sq]=PIECES.WHITE_PAWN;
                sq+=1;
            }else if(ch=="N"){
                this.board[sq]=PIECES.WHITE_KNIGHT;
                sq+=1;
            }else if(ch=="B"){
                this.board[sq]=PIECES.WHITE_BISHOP;
                sq+=1;
            }else if(ch=="R"){
                this.board[sq]=PIECES.WHITE_ROOK;
                sq+=1;
            }else if(ch=="Q"){
                this.board[sq]=PIECES.WHITE_QUEEN;
                sq+=1;
            }else if(ch=="K"){
                this.board[sq]=PIECES.WHITE_KING;
                sq+=1;
            }else if(ch=="/"){
                counter+=1
                sq=getSquareFILERANK(FILES.A,counter);
            }
        }


        if(FEN_array[1][0]=="w"){
            this.turn=COLOR.WHITE;
        }else if(FEN_array[1][0]=="b"){
            this.turn=COLOR.BLACK;
        }else{
            console.error("invalid str");
        }
        this.castlePerm=0;
        for(let i=0;i<FEN_array[2].length;i++){
            var cp=FEN_array[2][i];
            if(cp=="-"){
                break;
            }else if(cp=="K"){
                this.castlePerm+=WHITE_KING_CASTLE;
            }else if(cp=="Q"){
                this.castlePerm+=WHITE_QUEEN_CASTLE;
            }else if(cp=="k"){
                this.castlePerm+=BLACK_KING_CASTLE;
            }else if(cp=="q"){
                this.castlePerm+=BLACK_QUEEN_CASTLE;
            }
        }
        

        var epSquare=getSquareFromRankFileStr(FEN_array[3]);
        if(epSquare!=-1){
            this.enPassantSquare=epSquare;
        }else{
            this.enPassantSquare=SQUARES.NONE;
        }

        var fiftyTmp=parseInt(FEN_array[4]);
        if(fiftyTmp!=null){
            this.fiftyMove=fiftyTmp;
        }

        var plyTmp=parseInt(FEN_array[5]);
        if(plyTmp!=null){
            this.ply=plyTmp;
        }
        this.ply=1;
        this.positionKey=this.generatePositionKey();
        this.fill_piece_list();

    }


    fill_piece_list(){
        
        for(let i=0;i<this.pieceNumber.length;i++){
            this.pieceNumber[i]=0;
        }

        for(let i=0;i<this.pieceList.length;i++){
            for(let j=0;j<10;j++){
                this.pieceList[i][j]=PIECES.EMPTY;
            }
        }

        for(let i=0;i<64;i++){
            var piece=this.board[board_64_to_120[i]];
            //console.log(piece);
            if(piece!=PIECES.EMPTY){
                this.material[PieceCol[piece]]+=PieceVal[piece];
                this.pieceList[piece][this.pieceNumber[piece]]=board_64_to_120[i];
                this.pieceNumber[piece]+=1;
            }
        }
    }



    isSquareAttacked(square,side){
        var current_square;
        var direction;
        var piece;
        var square_side=PieceCol[this.board[square]];
        
        //knight
        
        for(let i=0;i<8;i++){
            current_square=this.board[square+knight_direction[i]];
            if(current_square!=SQUARES.OUT_OF_BOARD|| current_square!=PIECES.EMPTY){
                if(PieceCol[current_square]==side && square_side!=side && PieceKnight[current_square]==BOOL.TRUE){
                    //console.log(side,current_square,square,PieceCol[current_square]);
            
                    return true;
                }
            }
        }
        //pawn
      
        if(side==COLOR.WHITE){
                if(this.board[square+11]==PIECES.WHITE_PAWN||this.board[square+9]==PIECES.WHITE_PAWN){ //up
                    //console.log(square,side,"2");
                    return true;
                }
        }else if(side==COLOR.BLACK ){
                if(this.board[square-11]==PIECES.BLACK_PAWN|| this.board[square-9]==PIECES.BLACK_PAWN ){ //down
                    //console.log(square,side,"3");
                    return true;
                }
        }else{
            return false;
        }
        
        //ray cast
    
        //rook,queen
        for(let i=0;i<4;i++){
            direction=rook_direction[i];
            piece=square+direction;
            current_square=this.board[piece];
            while(current_square!=SQUARES.OUT_OF_BOARD){
                if(current_square!=PIECES.EMPTY){
                       
                        if(PieceCol[current_square]==side &&  square_side!=side && (PieceRookQueen[current_square]==BOOL.TRUE)){
                            
                            //console.log(current_square,square,side,"4");
                            return true;
                        }
                        break;
                }
                 piece+=direction;
                current_square=this.board[piece];
            }
        }
    
        //bishop,queen
        for(let i=0;i<4;i++){
            direction=bishop_direction[i];
            piece=square+direction;
            current_square=this.board[piece];
            while(current_square!=SQUARES.OUT_OF_BOARD){
                if(current_square!=PIECES.EMPTY){
                       
                        if(PieceCol[current_square]==side  &&  square_side!=side && (PieceBishopQueen[current_square]==BOOL.TRUE)){
                            //console.log(square,side,"5");
                            return true;
                        }
                        break;
                }
                 piece+=direction;
                current_square=this.board[piece];
            }
        }
    
        //king
        for(let i=0;i<8;i++){
            current_square=this.board[square+king_direction[i]];
            if(current_square!=SQUARES.OUT_OF_BOARD || current_square!=PIECES.EMPTY){
                if(PieceCol[current_square]==side && square_side!=side &&  PieceKing[current_square]==BOOL.TRUE){
                    //console.log(square,side,"6");
                    return true;
                }
            }
        }
    
        return false;
    }

    to_fen_string(){
        var str="";
        var count=0;
        for(let i=0;i<8;i++){
            for(let j=0;j<8;j++){
                var piece=this.board[board_64_to_120[i*8+j]];
                if(piece==PIECES.EMPTY){
                    count+=1;
                }else{
                    if(count!=0){
                        str+=count;
                        count=0;
                    }
                    
                }
                
                if(piece==PIECES.WHITE_PAWN){
                    str+="P";
                }else if(piece==PIECES.WHITE_KNIGHT){
                    str+="N";
                }else if(piece==PIECES.WHITE_BISHOP){
                    str+="B";
                }else if(piece==PIECES.WHITE_ROOK){
                    str+="R";
                }else if(piece==PIECES.WHITE_QUEEN){
                    str+="Q";
                }else if(piece==PIECES.WHITE_KING){
                    str+="K";
                }else if(piece==PIECES.BLACK_PAWN){
                    str+="p";
                }else if(piece==PIECES.BLACK_KNIGHT){
                    str+="n";
                }else if(piece==PIECES.BLACK_BISHOP){
                    str+="b";
                }else if(piece==PIECES.BLACK_ROOK){
                    str+="r";
                }else if(piece==PIECES.BLACK_QUEEN){
                    str+="q";
                }else if(piece==PIECES.BLACK_KING){
                    str+="k";
                }
            }
            if(count>0){
                str+=count;
                count=0;
            }
            if(i!=7){
                str+="/";
            }
            
           
            
        }
        str+=" ";
        if(this.turn==COLOR.WHITE){
            str+="w";
        }else{
            str+="b";
        }
        str+=" ";
        if(this.castlePerm&WHITE_KING_CASTLE){
            str+="K"
        }
        if(this.castlePerm&WHITE_QUEEN_CASTLE){
            str+="Q"
        }
        if(this.castlePerm&BLACK_KING_CASTLE){
            str+="k"
        }
        if(this.castlePerm&BLACK_QUEEN_CASTLE){
            str+="q"
        }
        if(this.castlePerm==0){
            str+="-"
        }
        str+=" ";
        if(this.enPassantSquare==SQUARES.NONE){
            str+="-";
        }else{
            str+=toFileRank(board_120_to_64[this.enPassantSquare]);
        }
        str+=" ";
        str+="0 1";
        //console.log(str);
        return str;
    }

   
    add_capture_move(move,depth){
        var index=this.movelistSize[depth];
        this.movelist[depth][index]=move;
        //index=CAPTURED(move)*14+this.board[FROMSQ(move)];
        /*
        if(index<0 || index>196){
            console.log(index,CAPTURED(move),FROMSQ(move),TOSQ(move));
        }
        */
        this.moveScores[depth][index]=MvvLvaScores[CAPTURED(move)*14+this.board[FROMSQ(move)]]+1000000;
        this.movelistSize[depth]+=1;
    }
    add_quiet_move(move,depth){
        var index=this.movelistSize[depth];
        this.movelist[depth][index]=move;
        this.moveScores[depth][index]=0;
        if(move==this.searchKillers[this.ply]){
            this.moveScores[depth][index]=900000;
        }else if(move==this.searchKillers[MAXDEPTH+ this.ply]){
            this.moveScores[depth][index]=800000;
        }else{
            this.moveScores[depth][index]=this.searchHistory[this.board[FROMSQ(move)]*120+TOSQ(move)];
        }
        this.movelistSize[depth]+=1;
    }
    add_ep_move(move,depth){
        var index=this.movelistSize[depth];
        this.movelist[depth][index]=move;
        this.moveScores[depth][index]=1000105;
        this.movelistSize[depth]+=1;
    }

    add_white_pawn_move(from,to,depth){
        if(from>=31 && from<=38){//rank 7 prom
             this.add_quiet_move(createMOVE(from,to,0,PIECES.WHITE_KNIGHT,0),depth);
             this.add_quiet_move(createMOVE(from,to,0,PIECES.WHITE_BISHOP,0),depth);
             this.add_quiet_move(createMOVE(from,to,0,PIECES.WHITE_ROOK,0),depth);
             this.add_quiet_move(createMOVE(from,to,0,PIECES.WHITE_QUEEN,0),depth);
        }else{
             this.add_quiet_move(createMOVE(from,to,0,0,0),depth);
        }
    }

    add_black_pawn_move(from,to,depth){
        if(from>=81 && from<=88){//rank 2 prom
            this.add_quiet_move(createMOVE(from,to,0,PIECES.BLACK_KNIGHT,0),depth);
            this.add_quiet_move(createMOVE(from,to,0,PIECES.BLACK_BISHOP,0),depth);
            this.add_quiet_move(createMOVE(from,to,0,PIECES.BLACK_ROOK,0),depth);
            this.add_quiet_move(createMOVE(from,to,0,PIECES.BLACK_QUEEN,0),depth);
       }else{
            this.add_quiet_move(createMOVE(from,to,0,0,0),depth);
       }
    }
    add_white_pawn_move_capture(from,to,capture,depth){
        if(from>=31 && from<=38){//rank 7 prom
            this.add_quiet_move(createMOVE(from,to,capture,PIECES.WHITE_KNIGHT,0),depth);
            this.add_quiet_move(createMOVE(from,to,capture,PIECES.WHITE_BISHOP,0),depth);
            this.add_quiet_move(createMOVE(from,to,capture,PIECES.WHITE_ROOK,0),depth);
            this.add_quiet_move(createMOVE(from,to,capture,PIECES.WHITE_QUEEN,0),depth);
        }else{
            this.add_quiet_move(createMOVE(from,to,capture,0,0),depth);
        }
    }
    add_black_pawn_move_capture(from,to,capture,depth){
        if(from>=81 && from<=88){//rank 2 prom
            this.add_quiet_move(createMOVE(from,to,capture,PIECES.BLACK_KNIGHT,0),depth);
            this.add_quiet_move(createMOVE(from,to,capture,PIECES.BLACK_BISHOP,0),depth);
            this.add_quiet_move(createMOVE(from,to,capture,PIECES.BLACK_ROOK,0),depth);
            this.add_quiet_move(createMOVE(from,to,capture,PIECES.BLACK_QUEEN,0),depth);
        }else{
            this.add_quiet_move(createMOVE(from,to,capture,0,0),depth);
        }
    }


    //non legal create and eliminate
    generateMoves(){
         var depth=this.ply;
         this.movelistSize[depth]=0;
         var pieceType;
         var tmpsquare;
         var pieceNum;
         var sq;
         var square;

         //pawn move
         if(this.turn==COLOR.WHITE){
            pieceType=PIECES.WHITE_PAWN;
            for(let i=0;i<this.pieceNumber[pieceType];i++){
                sq= this.pieceList[pieceType][i];    

                //quiet_move
                if(this.board[sq-10]==PIECES.EMPTY){
                    this.add_white_pawn_move(sq,sq-10,depth);
                    
                    if(sq>=81 && sq<=88 && this.board[sq-20]==PIECES.EMPTY){ //rank 2
                      
                        this.add_quiet_move(createMOVE(sq,sq-20,0,0,MFLAG_PAWN_START),depth);
                    }
                }
                //capture
                tmpsquare=this.board[sq-9];
                if(tmpsquare!=SQUARES.OUT_OF_BOARD && tmpsquare!=PIECES.EMPTY && PieceCol[tmpsquare]==COLOR.BLACK){
                    //console.log("asdadsd",sq,tmpsquare);
                    //add_down_pawn_move_capture(chessboard,square,square-9,tmpsquare,movelist);
                    this.add_white_pawn_move_capture(sq,sq-9,tmpsquare,depth);
                }


                tmpsquare=this.board[sq-11];
                if(tmpsquare!=SQUARES.OUT_OF_BOARD && tmpsquare!=PIECES.EMPTY && PieceCol[tmpsquare]==COLOR.BLACK){
                  
                    //add_down_pawn_move_capture(chessboard,square,square-11,tmpsquare,movelist);
                    this.add_white_pawn_move_capture(sq,sq-11,tmpsquare,depth);
                }


                //en passant
                if(this.enPassantSquare!=SQUARES.NONE){
                    if(sq-9==this.enPassantSquare){
                        
                        //add_ep_move(chessboard,CREATE_MOVE(square,square-9,EMPTY,EMPTY,FLAG_EP),movelist);
                        this.add_ep_move(createMOVE(sq,sq-9,0,0,MFLAG_EP),depth);
                    }
    
                    if(sq-11==this.enPassantSquare){
                      
                        //add_ep_move(chessboard,CREATE_MOVE(square,square-11,EMPTY,EMPTY,FLAG_EP),movelist);
                        this.add_ep_move(createMOVE(sq,sq-11,0,0,MFLAG_EP),depth);
                    }
    
                }

            }

            //castling
            if(this.castlePerm & WHITE_KING_CASTLE) {			
                if(this.board[SQUARES.F1] == PIECES.EMPTY && this.board[SQUARES.G1] == PIECES.EMPTY) {
                    if(this.isSquareAttacked(SQUARES.F1, COLOR.BLACK) == false && this.isSquareAttacked(SQUARES.E1, COLOR.BLACK) == false) {
                        //AddQuietMove( MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
                        this.add_quiet_move(createMOVE(SQUARES.E1,SQUARES.G1,0,0,MFLAG_CASTLE),depth);
                    }
                }
            }
            
            if(this.castlePerm &WHITE_QUEEN_CASTLE) {
                if(this.board[SQUARES.D1] == PIECES.EMPTY && this.board[SQUARES.C1] == PIECES.EMPTY && this.board[SQUARES.B1] == PIECES.EMPTY) {
                    if(this.isSquareAttacked(SQUARES.D1, COLOR.BLACK) == false && this.isSquareAttacked(SQUARES.E1, COLOR.BLACK) == false) {
                        //AddQuietMove( MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFLAGCA ));
                        this.add_quiet_move(createMOVE(SQUARES.E1,SQUARES.C1,0,0,MFLAG_CASTLE),depth);
                    }
                }
            }		


         }else{
            pieceType=PIECES.BLACK_PAWN;
            for(let i=0;i<this.pieceNumber[pieceType];i++){
                sq= this.pieceList[pieceType][i];    

                //quiet_move
                if(this.board[sq+10]==PIECES.EMPTY){
                    this.add_black_pawn_move(sq,sq+10,depth);
                
                    if(sq>=31 && sq<=38 && this.board[sq+20]==PIECES.EMPTY){ //rank 2
                     
                        this.add_quiet_move(createMOVE(sq,sq+20,0,0,MFLAG_PAWN_START),depth);
                    }
                }
                //capture
                tmpsquare=this.board[sq+9];
                if(tmpsquare!=SQUARES.OUT_OF_BOARD && tmpsquare!=PIECES.EMPTY && PieceCol[tmpsquare]==COLOR.WHITE){
                  
                    this.add_black_pawn_move_capture(sq,sq+9,tmpsquare,depth);
                }


                tmpsquare=this.board[sq+11];
                if(tmpsquare!=SQUARES.OUT_OF_BOARD && tmpsquare!=PIECES.EMPTY && PieceCol[tmpsquare]==COLOR.WHITE){
                  
                    this.add_black_pawn_move_capture(sq,sq+11,tmpsquare,depth);
                }


                //en passant
                if(this.enPassantSquare!=SQUARES.NONE){
                    if(sq+9==this.enPassantSquare){
                      
                        this.add_ep_move(createMOVE(sq,sq+9,0,0,MFLAG_EP),depth);
                    }
    
                    if(sq+11==this.enPassantSquare){
                     
                        this.add_ep_move(createMOVE(sq,sq+11,0,0,MFLAG_EP),depth);
                    }
    
                }

            }

            //castling
            if(this.castlePerm & BLACK_KING_CASTLE) {			
                if(this.board[SQUARES.F8] == PIECES.EMPTY && this.board[SQUARES.G8] == PIECES.EMPTY) {
                    if(this.isSquareAttacked(SQUARES.F8, COLOR.WHITE) == false && this.isSquareAttacked(SQUARES.E8, COLOR.WHITE) == false) {
                      
                        this.add_quiet_move(createMOVE(SQUARES.E8,SQUARES.G8,0,0,MFLAG_CASTLE),depth);
                    }
                }
            }
            
            if(this.castlePerm & BLACK_QUEEN_CASTLE) {
                if(this.board[SQUARES.D8] == PIECES.EMPTY && this.board[SQUARES.C8] == PIECES.EMPTY && this.board[SQUARES.B8] == PIECES.EMPTY) {
                    if(this.isSquareAttacked(SQUARES.D8, COLOR.WHITE) == false && this.isSquareAttacked(SQUARES.E8, COLOR.WHITE) == false) {
                       
                        this.add_quiet_move(createMOVE(SQUARES.E8,SQUARES.C8,0,0,MFLAG_CASTLE),depth);
                    }
                }
            }		

         }
         


        //rook move
        var sidePiece;
        var oppositeColor;
        if (this.turn == COLOR.WHITE) {
            oppositeColor = COLOR.BLACK;
        } else {
            oppositeColor = COLOR.WHITE;
        }
        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_ROOK;
        } else {
            sidePiece = PIECES.BLACK_ROOK;
        }
        var direction;
        var length = this.pieceNumber[sidePiece];
        var index;
        var start_square;
        for (let i = 0; i < length; i++) {
            start_square = this.pieceList[sidePiece][i];
            for (let j = 0; j < 4; j++) {
                direction = rook_direction[j];
                index = start_square + direction;
                square = this.board[index];
                while (square == PIECES.EMPTY) {
                    //add_quiet_move(chessboard,CREATE_MOVE(start_square,index,EMPTY,EMPTY,0),movelist);
                    this.add_quiet_move(createMOVE(start_square,index,0,0,0),depth);
                    index += direction;
                    square = this.board[index];
                }
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (PieceCol[square] == oppositeColor) {

                        // add_capture_move(chessboard,CREATE_MOVE(start_square,index,square,EMPTY,0),movelist);
                        this.add_capture_move(createMOVE(start_square,index,square,0,0),depth);

                    }

                }

            }
        }


        

        //bishop move
        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_BISHOP;
        } else {
            sidePiece = PIECES.BLACK_BISHOP;
        }

        length = this.pieceNumber[sidePiece];
        for (let i = 0; i < length; i++) {
            start_square = this.pieceList[sidePiece][i];
            for (let j = 0; j < 4; j++) {
                direction = bishop_direction[j];
                index = start_square + direction;
                square = this.board[index];
                while (square == PIECES.EMPTY) {

                    //add_quiet_move(chessboard,CREATE_MOVE(start_square,index,EMPTY,EMPTY,0),movelist);
                    this.add_quiet_move(createMOVE(start_square,index,0,0,0),depth);
                    index += direction;
                    square = this.board[index];
                }
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (PieceCol[square] == oppositeColor) {

                        // add_capture_move(chessboard,CREATE_MOVE(start_square,index,square,EMPTY,0),movelist);
                        this.add_capture_move(createMOVE(start_square,index,square,0,0),depth);


                    }

                }

            }
        }





        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_KNIGHT;
        } else {
            sidePiece = PIECES.BLACK_KNIGHT;
        }

        //knight move
        length = this.pieceNumber[sidePiece];
        for (let i = 0; i < length; i++) {
            start_square = this.pieceList[sidePiece][i];
            for (let j = 0; j < 8; j++) {
                square =this.board[start_square + knight_direction[j]];
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (square == PIECES.EMPTY) {
                       

                        //add_quiet_move(chessboard, CREATE_MOVE(start_square, start_square + knight_direction[j], EMPTY, EMPTY, 0), movelist);
                        this.add_quiet_move(createMOVE(start_square,start_square + knight_direction[j],0,0,0),depth);
                    } else if (PieceCol[square] == oppositeColor) {

                        //add_capture_move(chessboard, CREATE_MOVE(start_square, start_square + knight_direction[j], square, EMPTY, 0), movelist);
                        this.add_capture_move(createMOVE(start_square,start_square + knight_direction[j],square,0,0),depth);
                    }
                }
            }
        }

        //queen
        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_QUEEN;
        } else {
            sidePiece = PIECES.BLACK_QUEEN;
        }
        length = this.pieceNumber[sidePiece];
        for (let i = 0; i < length; i++) {
            start_square = this.pieceList[sidePiece][i];
            for (let j = 0; j < 8; j++) {
                direction = queen_direction[j];
                index = start_square + direction;
                square = this.board[index];
                while (square == PIECES.EMPTY) {

                    //add_quiet_move(chessboard, CREATE_MOVE(start_square, index, EMPTY, EMPTY, 0), movelist);
                    this.add_quiet_move(createMOVE(start_square,index,0,0,0),depth);
                    index += direction;
                    square = this.board[index];
                }
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (PieceCol[square] == oppositeColor) {
                        // add_capture_move(chessboard,CREATE_MOVE(start_square,index,square,EMPTY,0),movelist);
                        this.add_capture_move(createMOVE(start_square,index,square,0,0),depth);

                    }
                }

            }
        }






        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_KING;
        } else {
            sidePiece = PIECES.BLACK_KING;
        }

        //king move
        if (this.pieceNumber[sidePiece] != 0) {
            start_square = this.pieceList[sidePiece][0];
            for (let j = 0; j < 8; j++) {
                square = this.board[start_square + king_direction[j]];
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (square == PIECES.EMPTY) {
                       
                        //add_quiet_move(chessboard, CREATE_MOVE(start_square, start_square + knight_direction[j], EMPTY, EMPTY, 0), movelist);
                        this.add_quiet_move(createMOVE(start_square,start_square + king_direction[j],0,0,0),depth);
                    } else if (PieceCol[square] == oppositeColor) {
                        //add_capture_move(chessboard, CREATE_MOVE(start_square, start_square + knight_direction[j], square, EMPTY, 0), movelist);
                         this.add_capture_move(createMOVE(start_square,start_square + king_direction[j],square,0,0),depth);

                    }
                }
            }
        }









        /*
        console.log("mov", this.movelistSize[depth]);
        console.log(this.movelist[depth]);
        for (let i = 0; i < this.movelistSize[depth]; i++) {
            var mov = this.movelist[depth][i];
            console.log(FROMSQ(mov), TOSQ(mov));
        }
        */
    }


    generateCapture(){
        var depth=this.ply;
         this.movelistSize[depth]=0;
         var pieceType;
         var tmpsquare;
         var pieceNum;
         var sq;
         var square;

         //pawn move
         if(this.turn==COLOR.WHITE){
            pieceType=PIECES.WHITE_PAWN;
            for(let i=0;i<this.pieceNumber[pieceType];i++){
                sq= this.pieceList[pieceType][i];    

               
                //capture
                tmpsquare=this.board[sq-9];
                if(tmpsquare!=SQUARES.OUT_OF_BOARD && tmpsquare!=PIECES.EMPTY && PieceCol[tmpsquare]==COLOR.BLACK){
                    //console.log("asdadsd",sq,tmpsquare);
                    //add_down_pawn_move_capture(chessboard,square,square-9,tmpsquare,movelist);
                    this.add_white_pawn_move_capture(sq,sq-9,tmpsquare,depth);
                }


                tmpsquare=this.board[sq-11];
                if(tmpsquare!=SQUARES.OUT_OF_BOARD && tmpsquare!=PIECES.EMPTY && PieceCol[tmpsquare]==COLOR.BLACK){
                  
                    //add_down_pawn_move_capture(chessboard,square,square-11,tmpsquare,movelist);
                    this.add_white_pawn_move_capture(sq,sq-11,tmpsquare,depth);
                }


                //en passant
                if(this.enPassantSquare!=SQUARES.NONE){
                    if(sq-9==this.enPassantSquare){
                        
                        //add_ep_move(chessboard,CREATE_MOVE(square,square-9,EMPTY,EMPTY,FLAG_EP),movelist);
                        this.add_ep_move(createMOVE(sq,sq-9,0,0,MFLAG_EP),depth);
                    }
    
                    if(sq-11==this.enPassantSquare){
                      
                        //add_ep_move(chessboard,CREATE_MOVE(square,square-11,EMPTY,EMPTY,FLAG_EP),movelist);
                        this.add_ep_move(createMOVE(sq,sq-11,0,0,MFLAG_EP),depth);
                    }
    
                }

            }

         }else{
            pieceType=PIECES.BLACK_PAWN;
            for(let i=0;i<this.pieceNumber[pieceType];i++){
                sq= this.pieceList[pieceType][i];    

                //capture
                tmpsquare=this.board[sq+9];
                if(tmpsquare!=SQUARES.OUT_OF_BOARD && tmpsquare!=PIECES.EMPTY && PieceCol[tmpsquare]==COLOR.WHITE){
                  
                    this.add_black_pawn_move_capture(sq,sq+9,tmpsquare,depth);
                }


                tmpsquare=this.board[sq+11];
                if(tmpsquare!=SQUARES.OUT_OF_BOARD && tmpsquare!=PIECES.EMPTY && PieceCol[tmpsquare]==COLOR.WHITE){
                  
                    this.add_black_pawn_move_capture(sq,sq+11,tmpsquare,depth);
                }


                //en passant
                if(this.enPassantSquare!=SQUARES.NONE){
                    if(sq+9==this.enPassantSquare){
                      
                        this.add_ep_move(createMOVE(sq,sq+9,0,0,MFLAG_EP),depth);
                    }
    
                    if(sq+11==this.enPassantSquare){
                     
                        this.add_ep_move(createMOVE(sq,sq+11,0,0,MFLAG_EP),depth);
                    }
    
                }

            }

         }
         


        //rook move
        var sidePiece;
        var oppositeColor;
        if (this.turn == COLOR.WHITE) {
            oppositeColor = COLOR.BLACK;
        } else {
            oppositeColor = COLOR.WHITE;
        }
        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_ROOK;
        } else {
            sidePiece = PIECES.BLACK_ROOK;
        }


        var direction;
        var length = this.pieceNumber[sidePiece];
        var index;
        var start_square;
        for (let i = 0; i < length; i++) {
            start_square = this.pieceList[sidePiece][i];
            for (let j = 0; j < 4; j++) {
                direction = rook_direction[j];
                index = start_square + direction;
                square = this.board[index];
                while (square == PIECES.EMPTY) {
                   
                  
                    index += direction;
                    square = this.board[index];
                }
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (PieceCol[square] == oppositeColor) {

                        // add_capture_move(chessboard,CREATE_MOVE(start_square,index,square,EMPTY,0),movelist);
                        this.add_capture_move(createMOVE(start_square,index,square,0,0),depth);

                    }

                }

            }
        }


        

        //bishop move
        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_BISHOP;
        } else {
            sidePiece = PIECES.BLACK_BISHOP;
        }

        length = this.pieceNumber[sidePiece];
        for (let i = 0; i < length; i++) {
            start_square = this.pieceList[sidePiece][i];
            for (let j = 0; j < 4; j++) {
                direction = bishop_direction[j];
                index = start_square + direction;
                square = this.board[index];
                while (square == PIECES.EMPTY) {

                    
                    index += direction;
                    square = this.board[index];
                }
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (PieceCol[square] == oppositeColor) {

                        // add_capture_move(chessboard,CREATE_MOVE(start_square,index,square,EMPTY,0),movelist);
                        this.add_capture_move(createMOVE(start_square,index,square,0,0),depth);


                    }

                }

            }
        }





        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_KNIGHT;
        } else {
            sidePiece = PIECES.BLACK_KNIGHT;
        }

        //knight move
        length = this.pieceNumber[sidePiece];
        for (let i = 0; i < length; i++) {
            start_square = this.pieceList[sidePiece][i];
            for (let j = 0; j < 8; j++) {
                square =this.board[start_square + knight_direction[j]];
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (square == PIECES.EMPTY) {
                       

            
                    } else if (PieceCol[square] == oppositeColor) {

                        //add_capture_move(chessboard, CREATE_MOVE(start_square, start_square + knight_direction[j], square, EMPTY, 0), movelist);
                        this.add_capture_move(createMOVE(start_square,start_square + knight_direction[j],square,0,0),depth);
                    }
                }
            }
        }

        //queen
        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_QUEEN;
        } else {
            sidePiece = PIECES.BLACK_QUEEN;
        }
        length = this.pieceNumber[sidePiece];
        for (let i = 0; i < length; i++) {
            start_square = this.pieceList[sidePiece][i];
            for (let j = 0; j < 8; j++) {
                direction = queen_direction[j];
                index = start_square + direction;
                square = this.board[index];
                while (square == PIECES.EMPTY) {

                    
                    index += direction;
                    square = this.board[index];
                }
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (PieceCol[square] == oppositeColor) {
                        // add_capture_move(chessboard,CREATE_MOVE(start_square,index,square,EMPTY,0),movelist);
                        this.add_capture_move(createMOVE(start_square,index,square,0,0),depth);

                    }
                }

            }
        }






        if (this.turn == COLOR.WHITE) {
            sidePiece = PIECES.WHITE_KING;
        } else {
            sidePiece = PIECES.BLACK_KING;
        }

        //king move
        if (this.pieceNumber[sidePiece] != 0) {
            start_square = this.pieceList[sidePiece][0];
            for (let j = 0; j < 8; j++) {
                square = this.board[start_square + king_direction[j]];
                if (square != SQUARES.OUT_OF_BOARD) {
                    if (square == PIECES.EMPTY) {
                       
                       
                    } else if (PieceCol[square] == oppositeColor) {
                        //add_capture_move(chessboard, CREATE_MOVE(start_square, start_square + knight_direction[j], square, EMPTY, 0), movelist);
                         this.add_capture_move(createMOVE(start_square,start_square + king_direction[j],square,0,0),depth);

                    }
                }
            }
        }


    }



    hashPiece(piece,square){
        this.positionKey^=PieceKeyArray[piece][square];
    }
    hashCastle(){
        this.positionKey^=CastleKeys[this.castlePerm];
    }
    hashSide(){
        this.positionKey^=SideKey;
    }
    hashEP(){
        this.positionKey^=PieceKeyArray[0][this.enPassantSquare];
    }

    clearPiece(sq){

        var piece=this.board[sq];
        var pieceColor=PieceCol[piece];
        
        var pieceIndex=-1;
        this.hashPiece(piece,sq);
        this.board[sq]=PIECES.EMPTY;
        this.material[pieceColor]-=PieceVal[piece];

        var size=this.pieceNumber[piece];
        for(let i = 0;i<size;i++){
            if(this.pieceList[piece][i]==sq){
                pieceIndex=i;
                break;
            }
        }

        if(pieceIndex==-1){
            console.log("error clear piece");
        }
        this.pieceList[piece][pieceIndex]=this.pieceList[piece][size-1];
        this.pieceNumber[piece]-=1;

    }

    addPiece(sq,piece){
        var pieceColor=PieceCol[piece];

        this.hashPiece(piece,sq);
        this.board[sq]=piece;
        this.material[pieceColor]+=PieceVal[piece];
        this.pieceList[piece][this.pieceNumber[piece]]=sq;
        this.pieceNumber[piece]+=1;
    }

    movePiece(from,to){
        var index = 0;
        var piece= this.board[from];

        this.hashPiece(piece,from);
        this.board[from]=PIECES.EMPTY;

        this.hashPiece(piece,to);
        this.board[to]=piece;

        for(let i=0;i<this.pieceNumber[piece];i++){
            if(this.pieceList[piece][i]==from){
                this.pieceList[piece][i]=to;
                break;
            }
        }
    }


    

    
    makeMove(move){
        var from=FROMSQ(move);
        var to =TOSQ(move);
        this.history[this.hisPly].positionKey=this.positionKey;
        var current_turn=this.turn;
        //ep move
        if((move & MFLAG_EP )!=0){
            if(this.turn==COLOR.WHITE){
                this.clearPiece(to+10);
            }else{
                this.clearPiece(to-10);
            }

        //castling move
        }else if((move & MFLAG_CASTLE)!=0){
            switch(to){
                case SQUARES.C1:
                    this.movePiece(SQUARES.A1,SQUARES.D1);
                    break;
                case SQUARES.C8:
                    this.movePiece(SQUARES.A8,SQUARES.D8);
                    break;    
                case SQUARES.G1:
                    this.movePiece(SQUARES.H1,SQUARES.F1);
                    break;
                case SQUARES.G8:
                    this.movePiece(SQUARES.H8,SQUARES.F8);
                    break;
                        
            }
        }
      

        if(this.enPassantSquare!=SQUARES.NONE){
            this.hashEP();
        }

        this.hashCastle();

        this.history[this.hisPly].move=move;
        this.history[this.hisPly].fiftyMove=this.fiftyMove;
        this.history[this.hisPly].enPassantSquare=this.enPassantSquare;
        this.history[this.hisPly].castlePerm=this.castlePerm;

        this.castlePerm &=CastlePermArray[from];
        this.castlePerm &=CastlePermArray[to];
        this.enPassantSquare=SQUARES.NONE;
        this.hashCastle();
        var captured= CAPTURED(move);

        this.fiftyMove+=1;

        if(captured!=PIECES.EMPTY){
            this.clearPiece(to);
            this.fiftyMove=0;
        }

        this.hisPly+=1;
        this.ply+=1;

        if(PiecePawn[this.board[from]]==BOOL.TRUE){
            this.fiftyMove=0;
            if((move&MFLAG_PAWN_START)!=0){
                if(this.turn==COLOR.WHITE){
                    this.enPassantSquare=from-10;
                }else{
                    this.enPassantSquare=from+10;
                }
                this.hashEP();
            }
        }

        this.movePiece(from,to);

        var promotedPiece=PROMOTED(move);

        if(promotedPiece!=PIECES.EMPTY){
            this.clearPiece(to);
            this.addPiece(to,promotedPiece);
        }


        this.turn^=1;
        this.hashSide();

        //legal move check

        if(this.isSquareAttacked(this.pieceList[Kings[current_turn]][0],this.turn)==true){
            //console.log("make move illegal");
            this.takeMove();
            return false;
        }
        //console.log("make move");
        //console.log("ep ",this.enPassantSquare)
        return true;
        
    }

    takeMove(){
        this.hisPly-=1;
        this.ply-=1;

        var move=this.history[this.hisPly].move;
        var from=FROMSQ(move);
        var to=TOSQ(move);

        if(this.enPassantSquare!=SQUARES.NONE){
            this.hashEP();
        }
        this.hashCastle();

        this.castlePerm=this.history[this.hisPly].castlePerm;
        this.fiftyMove=this.history[this.hisPly].fiftyMove;
        this.enPassantSquare=this.history[this.hisPly].enPassantSquare;
        
        if(this.enPassantSquare!=SQUARES.NONE){
            this.hashEP();
        }
        this.hashCastle();
        //console.log(from,to);
        this.turn^=1;
        this.hashSide();


        if((move & MFLAG_EP )!=0){
          
            if(this.turn==COLOR.WHITE){
                this.addPiece(to+10,PIECES.BLACK_PAWN);
            }else{
                this.addPiece(to-10,PIECES.WHITE_PAWN);
            }

        //castling move
        }else if((move & MFLAG_CASTLE)!=0){
         
            switch(to){
                case SQUARES.C1:
                    this.movePiece(SQUARES.D1,SQUARES.A1);
                    break;
                case SQUARES.C8:
                    this.movePiece(SQUARES.D8,SQUARES.A8);
                    break;    
                case SQUARES.G1:
                    this.movePiece(SQUARES.F1,SQUARES.H1);
                    break;
                case SQUARES.G8:
                    this.movePiece(SQUARES.F8,SQUARES.H8);
                    break;
                        
            }
        }

        this.movePiece(to,from);

        var captured= CAPTURED(move);
        if(captured!=PIECES.EMPTY){
       
            this.addPiece(to,captured);
        }

        
        var promotedPiece=PROMOTED(move);

        if(promotedPiece!=PIECES.EMPTY){
         
            this.clearPiece(from);
            if(PieceCol[promotedPiece]==COLOR.WHITE){
                this.addPiece(from,PIECES.WHITE_PAWN);
            }else{
                this.addPiece(from,PIECES.BLACK_PAWN);
            }
            
        }


        
    }

    leafnodes=0;
    perft(depth){
        if(depth==0){
            this.leafnodes+=1;
            return;
        }
        this.generateMoves();
        var move;
        for(let i=0;i<this.movelistSize[this.ply];i++){
            move=this.movelist[this.ply][i];
            if(this.makeMove(move)==false){
                continue;
            }
            this.perft(depth-1);
            this.takeMove();
        }
    }

    perftTest(depth){
        this.leafnodes=0;
        var move;
        this.generateMoves();
        for(let i=0;i<this.movelistSize[this.ply];i++){
            move=this.movelist[this.ply][i];
            if(this.makeMove(move)==false){
                continue;
            }
            var cNode=this.leafnodes;
            this.perft(depth-1);
            this.takeMove();
            var oldNode=this.leafnodes-cNode;
            console.log(toFileRank(board_120_to_64[FROMSQ(move)]),toFileRank(board_120_to_64[TOSQ(move)]),oldNode);
        }

        console.log("total node ",this.leafnodes);
       
    }
    ai_move(maxDepth,time){
        //console.log("wwww")
        var move=this.searchPosition(maxDepth,time);
        if(move!=NOMOVE){
            this.makeMove(move);
           
            return true;
        }else{
            console.log("dude cmon")
            return false;
        }
       
    }
    searchPosition(maxDepth,time){
        var bestMove=NOMOVE;
        var bestScore=-INFINITE;
        var pvNum;
        this.clearForSearch(time);

        for(let i=1;i<=maxDepth;i++){
            bestScore=this.alphaBeta(-INFINITE,INFINITE,i);
            if(this.searchStopped){
                break;
            }
            bestMove=this.probe_pv_table();
            var line='D:'+i+" bestMove" +toFileRank(board_120_to_64[FROMSQ(bestMove)])+toFileRank(board_120_to_64[TOSQ(bestMove)])+ " score: "+bestScore+ " nodes "+this.searchNodes;
            pvNum=this.get_pv_line(i);
            line+=" pv :";
            for(let j=0;j<pvNum;j++){
                line+=" "+toFileRank(board_120_to_64[FROMSQ(this.pvArray[j])])+toFileRank(board_120_to_64[TOSQ(this.pvArray[j])])
            }
            if(i!=1){
                line+=" ordering "+((this.searchFhf/this.searchFh)).toFixed(2) ;
            }
            console.log(line);
        }
       

        return bestMove;
    }

    clearForSearch(time){
        for(let i=0;i<14*120;i++){
            this.searchHistory[i]=0;
        }
        for(let i=0;i<3*MAXDEPTH;i++){
            this.searchKillers[i]=0;
        }
        //clear pv
        this.searchNodes=0;
        this.searchFh=0;
        this.searchFhf=0;
        this.searchStart=get_time();
        this.searchStopped=false;
        this.searchEnd=this.searchStart+time;
    }

    alphaBeta(alpha,beta,depth){

       
        console.log("aaaa");
        if(depth==0){
            return this.quiescence(alpha,beta);
        }
     
        //time up
        if((this.searchNodes & 2047)==0){
            this.checkTime();
        }
      
        this.searchNodes+=1;
        if((this.isRepetation()|| this.fiftyMove>=100)&&this.ply!=0){
            return 0;
        }
     
        if(this.ply>MAXDEPTH-1){
            return this.quiescence(alpha,beta);
        }

        var inCheck=this.isSquareAttacked(this.pieceList[Kings[this.turn]][0],this.turn^1);
        if(inCheck){
            depth+=1;
        }
        var score=-INFINITE;

        //get pv move
        //order pv move

        var legalMoves=0;
        var oldAlpha=alpha;
        var bestMove=NOMOVE;
        var move;
        //var pvMove=this.probe_pv_table();


        this.generateMoves();
        var len=this.movelistSize[this.ply];

        /*
        if(pvMove!=NOMOVE){
            for(let i=0;i<len;i++){
                move=this.movelist[this.ply][i];
                if(move==pvMove){
                    this.moveScores[this.ply][i]=5000000;
                    break;
                }
            }
        }
        */
      
        for(let i=0;i<len;i++){
            //this.pick_next_move(i);
           
            move=this.movelist[this.ply][i];
            if(this.makeMove(move)==false){
                continue;
            }
            legalMoves+=1;
            score=-this.alphaBeta(-beta,-alpha,depth-1);
           
            this.takeMove();
            if(this.searchStopped==true){
                return 0;
            }
            if(score>alpha){
                
                if(score>=beta){
                    if(legalMoves==1){
                        //this.searchFhf+=1;
                    }
                    //this.searchFh+=1;
                    if((move&MFLAG_CAPTURE)==0){
                        this.searchKillers[MAXDEPTH + this.ply]=this.searchKillers[this.ply];
                        this.searchKillers[this.ply]=move;
                    }
                    //return beta;
                }
                if((move&MFLAG_CAPTURE)==0){
                    this.searchHistory[this.board[FROMSQ(move)]*120+ TOSQ(move)]+=depth*depth;
                }
                
                alpha=score;
                bestMove=move;
                //update history
            }
        }

        //mate check
        if(legalMoves==0){
            if(inCheck){
                return -MATE+this.ply;
            }else{
                return 0;
            }
        }
        if(alpha!=oldAlpha){
            this.store_pv_move(bestMove);
        }
        
        return alpha;
        

    }
    

    quiescence(alpha,beta){
       
        this.searchNodes+=1;

        //time up
        if((this.searchNodes & 2047)==0){
            this.checkTime();
        }
      
      

        
        if((this.isRepetation()|| this.fiftyMove>=100)&&this.ply!=0){
            return 0;
        }

        var score=this.evaluate();

        if(score>=beta){
            return beta;
        }

        if(score>alpha){
            alpha=score;
        }

        var legalMoves=0;
        var oldAlpha=alpha;
        var bestMove=NOMOVE;
        
        
        var move;
        this.generateCapture();
        for(let i=0;i<this.movelistSize[this.ply];i++){
            //this.pick_next_move(i);
            move=this.movelist[this.ply][i];
            if(this.makeMove(move)==false){
                continue;
            }
            legalMoves+=1;
            score=-this.quiescence(-beta,-alpha);
           
            this.takeMove();
            if(this.searchStopped==true){
                return 0;
            }
            if(score>alpha){
                if(score>=beta){
                    if(legalMoves==1){
                        this.searchFhf+=1;
                    }
                    this.searchFh+=1;
                    //return beta;
                }
                alpha=score;
                bestMove=move;
            }
        }

        if(alpha!=oldAlpha){
            this.store_pv_move(bestMove);
        }
        
        return alpha;
        
    }



    checkTime(){
        const d = new Date();
        let time = d.getTime();
        if(d>this.searchEnd){
            this.searchStopped=true;
        }
    }

    isRepetation(){
        for(let i=this.hisPly -this.fiftyMove;i<this.hisPly-1;i++){
            if(this.positionKey==this.history[i].positionKey){
                return true;
            }
        }
        return false;
    }

    evaluate(){
        var score=this.material[COLOR.WHITE]-this.material[COLOR.BLACK];

        let i;
        var sq;
        var pce;
        pce = PIECES.WHITE_PAWN;
        for(i = 0; i <this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score += PawnTable[board_120_to_64[sq]];
        }
        
        pce = PIECES.BLACK_PAWN;
        for(i = 0; i < this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score -= PawnTable[Mirror64[board_120_to_64[sq]]];
        }
        
        pce = PIECES.WHITE_KNIGHT;	
        for(i = 0; i < this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score += KnightTable[board_120_to_64[sq]];
        }	
    
        pce = PIECES.BLACK_KNIGHT;	
        for(i = 0; i < this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score -= KnightTable[Mirror64[board_120_to_64[sq]]];
        }			
        
        pce = PIECES.WHITE_BISHOP;	
        for(i = 0; i < this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score += BishopTable[board_120_to_64[sq]];
        }	
    
        pce = PIECES.BLACK_BISHOP;	
        for(i = 0; i < this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score -= BishopTable[Mirror64[board_120_to_64[sq]]];
        }
        
        pce = PIECES.WHITE_ROOK;	
        for(i = 0; i < this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score += RookTable[board_120_to_64[sq]];
        }	
    
        pce = PIECES.BLACK_ROOK;	
        for(i = 0; i < this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score -= RookTable[Mirror64[board_120_to_64[sq]]];
        }
        
        pce = PIECES.WHITE_QUEEN;	
        for(i = 0; i < this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score += RookTable[board_120_to_64[sq]];
        }	
    
        pce = PIECES.BLACK_QUEEN;	
        for(i = 0; i < this.pieceNumber[pce]; i++) {
            sq=this.pieceList[pce][i];
            score -= RookTable[Mirror64[board_120_to_64[sq]]];
        }	
        
        if(this.pieceNumber[PIECES.WHITE_BISHOP] >= 2) {
            score += 40;
        }
        
        if(this.pieceNumber[PIECES.BLACK_BISHOP] >= 2) {
            score -= 40;
        }
        

        if(this.turn==COLOR.BLACK){
            score*=-1;
        }
        return score;
    }

    
    probe_pv_table(){
        var index= Math.floor((this.positionKey % PV_SIZE));
        if(this.pvTable[index].positionKey==this.positionKey){
            return this.pvTable[index].move;
        }
        return NOMOVE;
    }


    store_pv_move(move){
        var index= Math.floor((this.positionKey % PV_SIZE));
        this.pvTable[index].positionKey=this.positionKey;
        this.pvTable[index].move=move;
    }

    clear_pv_table(){
        for(let i=0;i<PV_SIZE;i++){
            this.pvTable[i].positionKey=0;
            this.pvTable[i].move=NOMOVE;
        }
    }

    get_pv_line(depth){
        var move=this.probe_pv_table();
        var count=0;
        
        while(move!=NOMOVE && count<depth){
            if(this.is_move_exist(move)){
                this.makeMove(move);
                this.pvArray[count]=move;
                count+=1;
            }else{
                break;
            }
            move=this.probe_pv_table();

        }
        for(let i=0;i<count;i++){
            this.takeMove();
        }

        return count;
    }

    is_move_exist(move){
        this.generateMoves();
        var moveFound=NOMOVE;
        for(let i=0;i<this.movelistSize[this.ply];i++){
            moveFound=this.movelist[this.ply][i];
            if(this.makeMove(moveFound)==false){
                continue;
            }
            this.takeMove();
            if(move==moveFound){
                return true;
            }
        }
        return false;
    }

    pick_next_move(moveNum){
        var bestscore=-1;
        var bestIndex=moveNum;

        for(let i=moveNum;i<this.movelistSize[this.ply];i++){
            if(this.moveScores[this.ply][i]>bestscore){
                bestscore=this.moveScores[this.ply][i];
                bestIndex=i;
            }
        }
        if(bestIndex!=moveNum){
            var tmp;
            tmp=this.moveScores[this.ply][moveNum];
            this.moveScores[this.ply][moveNum]=this.moveScores[this.ply][bestIndex];
            this.moveScores[this.ply][bestIndex]=tmp;
            tmp=this.movelist[this.ply][moveNum];
            this.movelist[this.ply][moveNum]=this.movelist[this.ply][bestIndex];
            this.movelist[this.ply][bestIndex]=tmp;

        }
    }
    
}
