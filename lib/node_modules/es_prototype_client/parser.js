/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"e":4,"EOF":5,"<=":6,">=":7,"<>":8,"NOT":9,">":10,"<":11,"+":12,"-":13,"*":14,"/":15,"^":16,"(":17,")":18,"PERCENT":19,"DATE":20,"NUMBER":21,"E":22,"FIXEDCELL":23,"FIXEDCELLRANGE":24,"CELL":25,"CELLRANGE":26,"REMOTECELL":27,"REMOTECELLRANGE":28,"STRING":29,"IDENTIFIER":30,"expseq":31,";":32,",":33,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"<=",7:">=",8:"<>",9:"NOT",10:">",11:"<",12:"+",13:"-",14:"*",15:"/",16:"^",17:"(",18:")",19:"PERCENT",20:"DATE",21:"NUMBER",22:"E",23:"FIXEDCELL",24:"FIXEDCELLRANGE",25:"CELL",26:"CELLRANGE",27:"REMOTECELL",28:"REMOTECELLRANGE",29:"STRING",30:"IDENTIFIER",32:";",33:","},
productions_: [0,[3,2],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,2],[4,3],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,3],[4,4],[31,1],[31,3],[31,3]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1:return $$[$0-1];
break;
case 2:this.$ = ($$[$0-2] * 1) <= ($$[$0] * 1);
break;
case 3:this.$ = ($$[$0-2] * 1) >= ($$[$0] * 1);
break;
case 4:this.$ = ($$[$0-2] * 1) != ($$[$0] * 1);
break;
case 5:this.$ = ($$[$0-2] * 1) != ($$[$0] * 1);
break;
case 6:this.$ = ($$[$0-2] * 1) > ($$[$0] * 1);
break;
case 7:this.$ = ($$[$0-2] * 1) < ($$[$0] * 1);
break;
case 8:this.$ = jSE.cFN.sanitize($$[$0-2]) + jSE.cFN.sanitize($$[$0]);
break;
case 9:this.$ = ($$[$0-2] * 1) - ($$[$0] * 1);
break;
case 10:this.$ = ($$[$0-2] * 1) * ($$[$0] * 1);
break;
case 11:this.$ = ($$[$0-2] * 1) / ($$[$0] * 1);
break;
case 12:this.$ = Math.pow(($$[$0-2] * 1), ($$[$0] * 1));
break;
case 13:this.$ = $$[$0] * -1;
break;
case 14:this.$ = $$[$0-1];
break;
case 15:this.$ = ($$[$0].replace(/%/,'') * 1) / 100;
break;
case 16:/*this.$ = new Date($$[$0]).toString();*/
break;
case 17:this.$ = Number(yytext);
break;
case 18:this.$ = Math.E;
break;
case 19:this.$ = yy.lexer.cellHandler.fixedCellValue.apply(yy.lexer.cell, [$$[$0]]);
break;
case 20:this.$ = yy.lexer.cellHandler.fixedCellRangeValue.apply(yy.lexer.cell, [$$[$0]]);
break;
case 21:this.$ = yy.lexer.cellHandler.cellValue.apply(yy.lexer.cell, [$$[$0]]);
break;
case 22:this.$ = yy.lexer.cellHandler.cellRangeValue.apply(yy.lexer.cell, [$$[$0]]);
break;
case 23:this.$ = yy.lexer.cellHandler.remoteCellValue.apply(yy.lexer.cell, [$$[$0]]);
break;
case 24:this.$ = yy.lexer.cellHandler.remoteCellRangeValue.apply(yy.lexer.cell, [$$[$0]]);
break;
case 25:this.$ = $$[$0].substring(1, $$[$0].length - 1);
break;
case 26:this.$ = yy.lexer.cellHandler.callFunction($$[$0-2], '', yy.lexer.cell);
break;
case 27:this.$ = yy.lexer.cellHandler.callFunction($$[$0-3], $$[$0-1], yy.lexer.cell);
break;
case 29:
 		this.$ = ($.isArray($$[$0]) ? $$[$0] : [$$[$0]]);
	 	this.$.push($$[$0-2]);
 	
break;
case 30:
 		this.$ = ($.isArray($$[$0]) ? $$[$0] : [$$[$0]]);
	 	this.$.push($$[$0-2]);
 	
break;
}
},
table: [{3:1,4:2,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{1:[3]},{5:[1,17],6:[1,18],7:[1,19],8:[1,20],9:[1,21],10:[1,22],11:[1,23],12:[1,24],13:[1,25],14:[1,26],15:[1,27],16:[1,28]},{4:29,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:30,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{5:[2,15],6:[2,15],7:[2,15],8:[2,15],9:[2,15],10:[2,15],11:[2,15],12:[2,15],13:[2,15],14:[2,15],15:[2,15],16:[2,15],18:[2,15],32:[2,15],33:[2,15]},{5:[2,16],6:[2,16],7:[2,16],8:[2,16],9:[2,16],10:[2,16],11:[2,16],12:[2,16],13:[2,16],14:[2,16],15:[2,16],16:[2,16],18:[2,16],32:[2,16],33:[2,16]},{5:[2,17],6:[2,17],7:[2,17],8:[2,17],9:[2,17],10:[2,17],11:[2,17],12:[2,17],13:[2,17],14:[2,17],15:[2,17],16:[2,17],18:[2,17],32:[2,17],33:[2,17]},{5:[2,18],6:[2,18],7:[2,18],8:[2,18],9:[2,18],10:[2,18],11:[2,18],12:[2,18],13:[2,18],14:[2,18],15:[2,18],16:[2,18],18:[2,18],32:[2,18],33:[2,18]},{5:[2,19],6:[2,19],7:[2,19],8:[2,19],9:[2,19],10:[2,19],11:[2,19],12:[2,19],13:[2,19],14:[2,19],15:[2,19],16:[2,19],18:[2,19],32:[2,19],33:[2,19]},{5:[2,20],6:[2,20],7:[2,20],8:[2,20],9:[2,20],10:[2,20],11:[2,20],12:[2,20],13:[2,20],14:[2,20],15:[2,20],16:[2,20],18:[2,20],32:[2,20],33:[2,20]},{5:[2,21],6:[2,21],7:[2,21],8:[2,21],9:[2,21],10:[2,21],11:[2,21],12:[2,21],13:[2,21],14:[2,21],15:[2,21],16:[2,21],18:[2,21],32:[2,21],33:[2,21]},{5:[2,22],6:[2,22],7:[2,22],8:[2,22],9:[2,22],10:[2,22],11:[2,22],12:[2,22],13:[2,22],14:[2,22],15:[2,22],16:[2,22],18:[2,22],32:[2,22],33:[2,22]},{5:[2,23],6:[2,23],7:[2,23],8:[2,23],9:[2,23],10:[2,23],11:[2,23],12:[2,23],13:[2,23],14:[2,23],15:[2,23],16:[2,23],18:[2,23],32:[2,23],33:[2,23]},{5:[2,24],6:[2,24],7:[2,24],8:[2,24],9:[2,24],10:[2,24],11:[2,24],12:[2,24],13:[2,24],14:[2,24],15:[2,24],16:[2,24],18:[2,24],32:[2,24],33:[2,24]},{5:[2,25],6:[2,25],7:[2,25],8:[2,25],9:[2,25],10:[2,25],11:[2,25],12:[2,25],13:[2,25],14:[2,25],15:[2,25],16:[2,25],18:[2,25],32:[2,25],33:[2,25]},{17:[1,31]},{1:[2,1]},{4:32,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:33,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:34,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:35,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:36,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:37,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:38,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:39,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:40,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:41,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{4:42,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16]},{5:[2,13],6:[2,13],7:[2,13],8:[2,13],9:[2,13],10:[2,13],11:[2,13],12:[2,13],13:[2,13],14:[1,26],15:[1,27],16:[1,28],18:[2,13],32:[2,13],33:[2,13]},{6:[1,18],7:[1,19],8:[1,20],9:[1,21],10:[1,22],11:[1,23],12:[1,24],13:[1,25],14:[1,26],15:[1,27],16:[1,28],18:[1,43]},{4:46,13:[1,3],17:[1,4],18:[1,44],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16],31:45},{5:[2,2],6:[2,2],7:[2,2],8:[2,2],9:[2,2],10:[1,22],11:[1,23],12:[1,24],13:[1,25],14:[1,26],15:[1,27],16:[1,28],18:[2,2],32:[2,2],33:[2,2]},{5:[2,3],6:[2,3],7:[2,3],8:[2,3],9:[2,3],10:[1,22],11:[1,23],12:[1,24],13:[1,25],14:[1,26],15:[1,27],16:[1,28],18:[2,3],32:[2,3],33:[2,3]},{5:[2,4],6:[2,4],7:[2,4],8:[2,4],9:[2,4],10:[1,22],11:[1,23],12:[1,24],13:[1,25],14:[1,26],15:[1,27],16:[1,28],18:[2,4],32:[2,4],33:[2,4]},{5:[2,5],6:[2,5],7:[2,5],8:[2,5],9:[2,5],10:[1,22],11:[1,23],12:[1,24],13:[1,25],14:[1,26],15:[1,27],16:[1,28],18:[2,5],32:[2,5],33:[2,5]},{5:[2,6],6:[2,6],7:[2,6],8:[2,6],9:[2,6],10:[2,6],11:[2,6],12:[1,24],13:[1,25],14:[1,26],15:[1,27],16:[1,28],18:[2,6],32:[2,6],33:[2,6]},{5:[2,7],6:[2,7],7:[2,7],8:[2,7],9:[2,7],10:[2,7],11:[2,7],12:[1,24],13:[1,25],14:[1,26],15:[1,27],16:[1,28],18:[2,7],32:[2,7],33:[2,7]},{5:[2,8],6:[2,8],7:[2,8],8:[2,8],9:[2,8],10:[2,8],11:[2,8],12:[2,8],13:[2,8],14:[1,26],15:[1,27],16:[1,28],18:[2,8],32:[2,8],33:[2,8]},{5:[2,9],6:[2,9],7:[2,9],8:[2,9],9:[2,9],10:[2,9],11:[2,9],12:[2,9],13:[2,9],14:[1,26],15:[1,27],16:[1,28],18:[2,9],32:[2,9],33:[2,9]},{5:[2,10],6:[2,10],7:[2,10],8:[2,10],9:[2,10],10:[2,10],11:[2,10],12:[2,10],13:[2,10],14:[2,10],15:[2,10],16:[1,28],18:[2,10],32:[2,10],33:[2,10]},{5:[2,11],6:[2,11],7:[2,11],8:[2,11],9:[2,11],10:[2,11],11:[2,11],12:[2,11],13:[2,11],14:[2,11],15:[2,11],16:[1,28],18:[2,11],32:[2,11],33:[2,11]},{5:[2,12],6:[2,12],7:[2,12],8:[2,12],9:[2,12],10:[2,12],11:[2,12],12:[2,12],13:[2,12],14:[2,12],15:[2,12],16:[2,12],18:[2,12],32:[2,12],33:[2,12]},{5:[2,14],6:[2,14],7:[2,14],8:[2,14],9:[2,14],10:[2,14],11:[2,14],12:[2,14],13:[2,14],14:[2,14],15:[2,14],16:[2,14],18:[2,14],32:[2,14],33:[2,14]},{5:[2,26],6:[2,26],7:[2,26],8:[2,26],9:[2,26],10:[2,26],11:[2,26],12:[2,26],13:[2,26],14:[2,26],15:[2,26],16:[2,26],18:[2,26],32:[2,26],33:[2,26]},{18:[1,47]},{6:[1,18],7:[1,19],8:[1,20],9:[1,21],10:[1,22],11:[1,23],12:[1,24],13:[1,25],14:[1,26],15:[1,27],16:[1,28],18:[2,28],32:[1,48],33:[1,49]},{5:[2,27],6:[2,27],7:[2,27],8:[2,27],9:[2,27],10:[2,27],11:[2,27],12:[2,27],13:[2,27],14:[2,27],15:[2,27],16:[2,27],18:[2,27],32:[2,27],33:[2,27]},{4:46,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16],31:50},{4:46,13:[1,3],17:[1,4],19:[1,5],20:[1,6],21:[1,7],22:[1,8],23:[1,9],24:[1,10],25:[1,11],26:[1,12],27:[1,13],28:[1,14],29:[1,15],30:[1,16],31:51},{18:[2,29]},{18:[2,30]}],
defaultActions: {17:[2,1],50:[2,29],51:[2,30]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    };

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+'\nExpecting '+expected.join(', ');
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};/* Jison generated lexer */
var lexer = (function(){var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parseError) {
            this.yy.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext+=ch;
        this.yyleng++;
        this.match+=ch;
        this.matched+=ch;
        var lines = ch.match(/\n/);
        if (lines) this.yylineno++;
        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        this._input = ch + this._input;
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            match = this._input.match(this.rules[rules[i]]);
            if (match) {
                lines = match[0].match(/\n.*/g);
                if (lines) this.yylineno += lines.length;
                this.yylloc = {first_line: this.yylloc.last_line,
                               last_line: this.yylineno+1,
                               first_column: this.yylloc.last_column,
                               last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}
                this.yytext += match[0];
                this.match += match[0];
                this.matches = match;
                this.yyleng = this.yytext.length;
                this._more = false;
                this._input = this._input.slice(match[0].length);
                this.matched += match[0];
                token = this.performAction.call(this, this.yy, this, rules[i],this.conditionStack[this.conditionStack.length-1]);
                if (token) return token;
                else return;
            }
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(), 
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    }});
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 29;
break;
case 2:return 29;
break;
case 3:return 24;
break;
case 4:return 23;
break;
case 5:return 28;
break;
case 6:return 27;
break;
case 7:return 26;
break;
case 8:return 25;
break;
case 9:return 30;
break;
case 10:return 20;
break;
case 11:return 19;
break;
case 12:return 21;
break;
case 13:/* skip whitespace */
break;
case 14:return ' ';
break;
case 15:return '.';
break;
case 16:return ':';
break;
case 17:return 32;
break;
case 18:return 33;
break;
case 19:return 14;
break;
case 20:return 15;
break;
case 21:return 13;
break;
case 22:return 12;
break;
case 23:return 16;
break;
case 24:return 17;
break;
case 25:return 18;
break;
case 26:return 10;
break;
case 27:return 11;
break;
case 28:return 7;
break;
case 29:return 6;
break;
case 30:return 8;
break;
case 31:return 9;
break;
case 32:return 'PI';
break;
case 33:return 22;
break;
case 34:return '"';
break;
case 35:return "'";
break;
case 36:return "!";
break;
case 37:return 5;
break;
case 38:return '=';
break;
}
};
lexer.rules = [/^\s+/,/^"(\\["]|[^"])*"/,/^'(\\[']|[^'])*'/,/^\$[A-Za-z]+\$[0-9]+[:]\$[A-Za-z]+\$[0-9]+/,/^\$[A-Za-z]+\$[0-9]+/,/^SHEET[0-9]+[:!][A-Za-z]+[0-9]+[:][A-Za-z]+[0-9]+/,/^SHEET[0-9]+[:!][A-Za-z]+[0-9]+/,/^[A-Za-z]+[0-9]+[:][A-Za-z]+[0-9]+/,/^[A-Za-z]+[0-9]+/,/^[A-Za-z]+/,/^[0-9]([0-9]?)[-/][0-9]([0-9]?)[-/][0-9]([0-9]?)([0-9]?)([0-9]?)/,/^[0-9]+[%]/,/^[0-9]+(\.[0-9]+)?/,/^\$/,/^ /,/^\./,/^:/,/^;/,/^,/,/^\*/,/^\//,/^-/,/^\+/,/^\^/,/^\(/,/^\)/,/^>/,/^</,/^>=/,/^<=/,/^<>/,/^NOT\b/,/^PI\b/,/^E\b/,/^"/,/^'/,/^!/,/^$/,/^=/];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38],"inclusive":true}};return lexer;})()
parser.lexer = lexer;
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}