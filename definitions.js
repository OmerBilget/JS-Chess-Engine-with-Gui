var PIECES = {EMPTY:0,
              WHITE_PAWN:1,WHITE_KNIGHT:2,WHITE_BISHOP:3,WHITE_ROOK:4,WHITE_QUEEN:5,WHITE_KING:6,
              BLACK_PAWN:7,BLACK_KNIGHT:8,BLACK_BISHOP:9,BLACK_ROOK:10,BLACK_QUEEN:11,BLACK_KING:12}



var BOARD_SIZE = 120;
var FILES={A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,NONE:8}              
var RANKS={R1:7,R2:6,R3:5,R4:4,R5:3,R6:2,R7:1,R8:0,NONE:8};



var COLOR={WHITE:0,BLACK:1,BOTH:2}
var BOARD_WIDTH=10;
var BOARD_HEIGHT=12;
var SQUARES={
    A1:91,B1:92,C1:93,D1:94,E1:95,F1:96,G1:97,H1:98,
    A8:21,B8:22,C8:23,D8:24,E8:25,F8:26,G8:27,H8:28,
    NONE:99,OUT_OF_BOARD:100};

var BOOL={FALSE:0,TRUE:1}

// A8 0 0 = 21
// A8 B8 C8 ...... H8
// A7 B7 C7 ...... H7

function getSquareFILERANK(file,rank){
    if(file<0 || file>7 || rank<0 || rank>7){
        return SQUARES.OUT_OF_BOARD;
    }
    return (BOARD_WIDTH*(rank+2)+(file+1));
}
var OUB=SQUARES.OUT_OF_BOARD;
//input square return rank or file value
var FILE_MAP=  [OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
                OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
                OUB,FILES.A ,FILES.B  ,FILES.C  ,FILES.D  ,FILES.E  ,FILES.F ,FILES.G ,FILES.H  ,OUB,
                OUB,FILES.A ,FILES.B  ,FILES.C  ,FILES.D  ,FILES.E  ,FILES.F ,FILES.G ,FILES.H  ,OUB,
                OUB,FILES.A ,FILES.B  ,FILES.C  ,FILES.D  ,FILES.E  ,FILES.F ,FILES.G ,FILES.H  ,OUB,
                OUB,FILES.A ,FILES.B  ,FILES.C  ,FILES.D  ,FILES.E  ,FILES.F ,FILES.G ,FILES.H  ,OUB,
                OUB,FILES.A ,FILES.B  ,FILES.C  ,FILES.D  ,FILES.E  ,FILES.F ,FILES.G ,FILES.H  ,OUB,
                OUB,FILES.A ,FILES.B  ,FILES.C  ,FILES.D  ,FILES.E  ,FILES.F ,FILES.G ,FILES.H  ,OUB,
                OUB,FILES.A ,FILES.B  ,FILES.C  ,FILES.D  ,FILES.E  ,FILES.F ,FILES.G ,FILES.H  ,OUB,
                OUB,FILES.A ,FILES.B  ,FILES.C  ,FILES.D  ,FILES.E  ,FILES.F ,FILES.G ,FILES.H  ,OUB,
                OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
                OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
                            ];

var RANK_MAP=  [OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
                OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
                OUB,RANKS.R8  ,RANKS.R8  ,RANKS.R8  ,RANKS.R8  ,RANKS.R8  ,RANKS.R8  ,RANKS.R8  ,RANKS.R8  ,OUB,
                OUB,RANKS.R7  ,RANKS.R7  ,RANKS.R7  ,RANKS.R7  ,RANKS.R7  ,RANKS.R7  ,RANKS.R7  ,RANKS.R7  ,OUB,
                OUB,RANKS.R6  ,RANKS.R6  ,RANKS.R6  ,RANKS.R6  ,RANKS.R6  ,RANKS.R6  ,RANKS.R6  ,RANKS.R6  ,OUB,
                OUB,RANKS.R5  ,RANKS.R5  ,RANKS.R5  ,RANKS.R5  ,RANKS.R5  ,RANKS.R5  ,RANKS.R5  ,RANKS.R5  ,OUB,
                OUB,RANKS.R4  ,RANKS.R4  ,RANKS.R4  ,RANKS.R4  ,RANKS.R4  ,RANKS.R4  ,RANKS.R4  ,RANKS.R4  ,OUB,
                OUB,RANKS.R3  ,RANKS.R3  ,RANKS.R3  ,RANKS.R3  ,RANKS.R3  ,RANKS.R3  ,RANKS.R3  ,RANKS.R3  ,OUB,
                OUB,RANKS.R2  ,RANKS.R2  ,RANKS.R2  ,RANKS.R2  ,RANKS.R2  ,RANKS.R2  ,RANKS.R2  ,RANKS.R2  ,OUB,
                OUB,RANKS.R1  ,RANKS.R1  ,RANKS.R1  ,RANKS.R1  ,RANKS.R1  ,RANKS.R1  ,RANKS.R1  ,RANKS.R1  ,OUB,
                OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
                OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
                            ];                           

/*
0001 white king
0010 white queen
0100 black king
1000 black queen

*/
var WHITE_KING_CASTLE =0b0001;
var WHITE_QUEEN_CASTLE=0b0010;
var BLACK_KING_CASTLE =0b0100;
var BLACK_QUEEN_CASTLE =0b1000;

var PieceBig = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMaj = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMin = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceVal= [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
var PieceCol = [ COLOR.BOTH, COLOR.WHITE, COLOR.WHITE, COLOR.WHITE, COLOR.WHITE, COLOR.WHITE, COLOR.WHITE,
	COLOR.BLACK, COLOR.BLACK, COLOR.BLACK, COLOR.BLACK, COLOR.BLACK, COLOR.BLACK ];
	
var PiecePawn = [ BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];	
var PieceKnight = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceKing = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE ];
var PieceRookQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
var PieceBishopQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE ];
var PieceSlides = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];

var PieceKeyArray=new Array(14);
for(let i=0;i<14;i++){
    PieceKeyArray[i]=new Array(BOARD_SIZE);
}
var SideKey;
var CastleKeys=new Array(16);
//ep key keys[0][epSquare] because empty not used

var MAXGAMEMOVES=2048;
var MAXPOSITIONMOVES=256;
var MAXDEPTH=64;

var PV_SIZE=1200000;
var knight_direction=[-8,-19,-21,-12,8,19,21,12];
var rook_direction=[-1,-10,1,10];
var bishop_direction=[-9,-11,11,9];
var king_direction=[-1,-10,1,10,-9,-11,11,9];
var queen_direction=[-1,-10,1,10,-9,-11,11,9];





function getRandomNumber32() {

	return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
		 | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);

}


function initHashKey(){
    for(let i=0;i<14;i++){
        for(let j=0;j<BOARD_SIZE;j++){
            PieceKeyArray[i][j]=getRandomNumber32();
        }
    }
    SideKey=getRandomNumber32();
    for(let i=0;i<16;i++){
        CastleKeys[i]=getRandomNumber32();
    }
}


var board_120_to_64=[
    OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
    OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
    OUB,0  ,1  ,2  ,3  ,4  ,5  ,6  ,7  ,OUB,
    OUB,8  ,9  ,10 ,11 ,12 ,13 ,14 ,15 ,OUB,
    OUB,16 ,17 ,18 ,19 ,20 ,21 ,22 ,23 ,OUB,
    OUB,24 ,25 ,26 ,27 ,28 ,29 ,30 ,31 ,OUB,
    OUB,32 ,33 ,34 ,35 ,36 ,37 ,38 ,39 ,OUB,
    OUB,40 ,41 ,42 ,43 ,44 ,45 ,46 ,47 ,OUB,
    OUB,48 ,49 ,50 ,51 ,52 ,53 ,54 ,55 ,OUB,
    OUB,56 ,57 ,58 ,59 ,60 ,61 ,62 ,63 ,OUB,
    OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
    OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB
]
var empty_board=[
    OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
    OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
    OUB,0  ,0  ,0  ,0  ,0  ,0  ,0  ,0  ,OUB,
    OUB,0  ,0  ,0  ,0  ,0  ,0  ,0  ,0  ,OUB,
    OUB,0  ,0  ,0  ,0  ,0  ,0  ,0  ,0  ,OUB,
    OUB,0  ,0  ,0  ,0  ,0  ,0  ,0  ,0  ,OUB,
    OUB,0  ,0  ,0  ,0  ,0  ,0  ,0  ,0  ,OUB,
    OUB,0  ,0  ,0  ,0  ,0  ,0  ,0  ,0  ,OUB,
    OUB,0  ,0  ,0  ,0  ,0  ,0  ,0  ,0  ,OUB,
    OUB,0  ,0  ,0  ,0  ,0  ,0  ,0  ,0  ,OUB,
    OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,
    OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB,OUB
]

var board_64_to_120=[
    21,22,23,24,25,26,27,28,
    31,32,33,34,35,36,37,38,
    41,42,43,44,45,46,47,48,
    51,52,53,54,55,56,57,58,
    61,62,63,64,65,66,67,68,
    71,72,73,74,75,76,77,78,
    81,82,83,84,85,86,87,88,
    91,92,93,94,95,96,97,98
]


function char_to_int(char){
    if(char=="0"){
        return 0;
    }
    if(char=="1"){
        return 1;
    }
    if(char=="2"){
        return 2;
    }
    if(char=="3"){
        return 3;
    }
    if(char=="4"){
        return 4;
    }
    if(char=="5"){
        return 5;
    }
    if(char=="6"){
        return 6;
    }
    if(char=="7"){
        return 7;
    }
    if(char=="8"){
        return 8;
    }
    if(char=="9"){
        return 9;
    }
    console.error("dude wrong input");
    return -1;

}
function char_to_int_file(char){
    if(char=="a"){
        return 0;
    }
    if(char=="b"){
        return 1;
    }
    if(char=="c"){
        return 2;
    }
    if(char=="d"){
        return 3;
    }
    if(char=="e"){
        return 4;
    }
    if(char=="f"){
        return 5;
    }
    if(char=="g"){
        return 6;
    }
    if(char=="h"){
        return 7;
    }
    console.error("dude wrong input");
    return -1;

}
function int_to_char(int){
    if(int==0){
        return "0";
    }
    if(int==1){
        return "1";
    }
    if(int==2){
        return "2";
    }
    if(int==3){
        return "3";
    }
    if(int==4){
        return "4";
    }
    if(int==5){
        return "5";
    }
    if(int==6){
        return "6";
    }
    if(int==7){
        return "7";
    }
    if(int==8){
        return "8";
    }
    if(int==9){
        return "9";
    }
    console.error("dude wrong input");
    return "-1";
}
function isCharNum(char){
    return (char=="0"||char=="1" || char=="2"|| char=="3"|| char=="4"|| char=="5"|| char=="6"|| char=="7"|| char=="8");
}
function getSquareFromRankFileStr(str){
    if(str.length!=2){
        return -1;
    }
    var f=str[0];
    var r=str[1];
    var fn=char_to_int_file(f);
    var rn=char_to_int(r);
    rn+=1;
    rn=9-rn;
    return getSquareFILERANK(fn,rn);
    
}


/*

from
to
capture
ep Move
Promote move
pawn start
castling Move

//from 0-120 fits 7bit 128 
//to 0-120 fits 7bit 128
//capture 0-14 fits 4 bits 16
//promote 0-14 fits 4 bits 16
0000 0000 0000 0000 0000 0111 1111  //from 0-7   get : mov& 0x7F  
0000 0000 0000 0011 1111 1000 0000  //to 8-14    get : mov>>7 0x7F
0000 0000 0011 1100 0000 0000 0000  //captured   get : mov>>14 0xF
0000 0000 0100 0000 0000 0000 0000  //ep         get : 0x40000
0000 0000 1000 0000 0000 0000 0000  //pawn start get : 0x80000
0000 1111 0000 0000 0000 0000 0000  //promote    get : mov>>20 0XF
0001 0000 0000 0000 0000 0000 0000  //castling   get : 0x1000000

*/

var numfrom= 0x0F0FF0F
var from=numfrom&0X7F
console.log(numfrom,from)

var numTo =0x3F80
var to=(numTo>>7)&0x7F
console.log(numTo,to)

var numCap =0x3C000
var cap=(numCap>>14)&0xF
console.log(numCap,cap)

function createMOVE(from,to,captured,promoted,flag){
    return (from|(to<<7)|(captured<<14)|(promoted<<20)|flag);
}
function FROMSQ(m) { return (m & 0x7F); }
function TOSQ(m) { return ( (m >> 7) & 0x7F); }
function CAPTURED(m) { return ( (m >> 14) & 0xF); }
function PROMOTED(m) { return ( (m >> 20) & 0xF); }

var MFLAG_EP = 0x40000;
var MFLAG_PAWN_START = 0x80000;
var MFLAG_CASTLE = 0x1000000;

var MFLAG_CAPTURE = 0x7C000;
var MFLAG_PROM = 0xF00000;

var NOMOVE = 0;

var INFINITE=10000000;
var MATE=700000;
var Kings = [PIECES.WHITE_KING, PIECES.BLACK_KING];
var CastlePermArray = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];


function toFileRank(square){
    var str="";
    var file=Math.floor(square%8);
    var rank=Math.floor(square/8);
    switch(file){
        case 0:
            str+="a";
            break;
        case 1:
            str+="b";
            break;
        case 2:
            str+="c";
            break;
        case 3:
            str+="d";
            break;  
        case 4:
            str+="e";
            break;      
        case 5:
            str+="f";
            break;    
        case 6:
            str+="g";
            break;   
        case 7:
            str+="h";
            break;     
    }
    switch(rank){
        case 0:
            str+="8";
            break;
        case 1:
            str+="7";
            break;
        case 2:
            str+="6";
            break;
        case 3:
            str+="5";
            break;  
        case 4:
            str+="4";
            break;      
        case 5:
            str+="3";
            break;    
        case 6:
            str+="2";
            break;   
        case 7:
            str+="1";
            break;     
    }
    return str;

}

   /*
   var PawnTable = [
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
    10	,	10	,	0	,	-10	,	-10	,	0	,	10	,	10	,
    5	,	0	,	0	,	5	,	5	,	0	,	0	,	5	,
    0	,	0	,	10	,	20	,	20	,	10	,	0	,	0	,
    5	,	5	,	5	,	10	,	10	,	5	,	5	,	5	,
    10	,	10	,	10	,	20	,	20	,	10	,	10	,	10	,
    20	,	20	,	20	,	30	,	30	,	20	,	20	,	20	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
    ];


    */
    var PawnTable = [
        0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
        20	,	20	,	20	,	30	,	30	,	20	,	20	,	20	,
        10	,	10	,	10	,	20	,	20	,	10	,	10	,	10	,
        5	,	5	,	5	,	10	,	10	,	5	,	5	,	5	,
        0	,	0	,	10	,	20	,	20	,	10	,	0	,	0	,
        5	,	0	,	0	,	5	,	5	,	0	,	0	,	5	,
        10	,	10	,	0	,	-10	,	-10	,	0	,	10	,	10	,
        0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
    ];
    /*
    var KnightTable = [
    0	,	-10	,	0	,	0	,	0	,	0	,	-10	,	0	,
    0	,	0	,	0	,	5	,	5	,	0	,	0	,	0	,
    0	,	0	,	10	,	10	,	10	,	10	,	0	,	0	,
    0	,	0	,	10	,	20	,	20	,	10	,	5	,	0	,
    5	,	10	,	15	,	20	,	20	,	15	,	10	,	5	,
    5	,	10	,	10	,	20	,	20	,	10	,	10	,	5	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0		
    ];
    */
    var KnightTable = [
       0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
       0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
       5	,	10	,	10	,	20	,	20	,	10	,	10	,	5	,
       5	,	10	,	15	,	20	,	20	,	15	,	10	,	5	,
       0	,	0	,	10	,	20	,	20	,	10	,	5	,	0	,
       0	,	0	,	10	,	10	,	10	,	10	,	0	,	0	,
       0	,	0	,	0	,	5	,	5	,	0	,	0	,	0	,
       0	,	-10	,	0	,	0	,	0	,	0	,	-10	,	0	,
     ];


     /*
    var BishopTable = [
    0	,	0	,	-10	,	0	,	0	,	-10	,	0	,	0	,
    0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
    0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
    0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
    0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
    0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
    0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
    ];
    */

    var BishopTable = [
        0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
        0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
        0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
        0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
        0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
        0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
        0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
        0	,	0	,	-10	,	0	,	0	,	-10	,	0	,	0	,
        ];

    /*    
    var RookTable = [
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0		
    ];
    */
    var RookTable = [
        0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,	
        25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,
        0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
        0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
        0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
        0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
        0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
        0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
        
        ];

    var Mirror64 = [
        56	,	57	,	58	,	59	,	60	,	61	,	62	,	63	,
        48	,	49	,	50	,	51	,	52	,	53	,	54	,	55	,
        40	,	41	,	42	,	43	,	44	,	45	,	46	,	47	,
        32	,	33	,	34	,	35	,	36	,	37	,	38	,	39	,
        24	,	25	,	26	,	27	,	28	,	29	,	30	,	31	,
        16	,	17	,	18	,	19	,	20	,	21	,	22	,	23	,
        8	,	9	,	10	,	11	,	12	,	13	,	14	,	15	,
        0	,	1	,	2	,	3	,	4	,	5	,	6	,	7
        ];


    function get_time(){
        const d = new Date();
        return d.getTime();
    }

var MvvLvaValue = [ 0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600 ];
var MvvLvaScores = new Array(14 * 14);

function InitMvvLva() {
	var Attacker;
	var Victim;
	
	for(Attacker = PIECES.WHITE_PAWN; Attacker <= PIECES.BLACK_KING; ++Attacker) {
		for(Victim = PIECES.WHITE_PAWN; Victim <= PIECES.BLACK_KING; ++Victim) {
			MvvLvaScores[Victim * 14 + Attacker] = MvvLvaValue[Victim] + 6 - (MvvLvaValue[Attacker]/100);
		}
	}
}
console.log(MvvLvaScores)
