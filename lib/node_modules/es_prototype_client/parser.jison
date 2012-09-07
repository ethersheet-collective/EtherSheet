/* description: Parses end evaluates mathematical expressions. */

/* lexical grammar */
%lex
%%
\s+								{/* skip whitespace */}
'"'("\\"["]|[^"])*'"'						{return 'STRING';}
"'"('\\'[']|[^'])*"'"						{return 'STRING';}
'$'[A-Za-z]+'$'[0-9]+[:]'$'[A-Za-z]+'$'[0-9]+			{return 'FIXEDCELLRANGE';}
'$'[A-Za-z]+'$'[0-9]+						{return 'FIXEDCELL';}
'SHEET'[0-9]+[:!][A-Za-z]+[0-9]+[:][A-Za-z]+[0-9]+ 		{return 'REMOTECELLRANGE';}
'SHEET'[0-9]+[:!][A-Za-z]+[0-9]+ 				{return 'REMOTECELL';}
[A-Za-z]+[0-9]+[:][A-Za-z]+[0-9]+				{return 'CELLRANGE';}
[A-Za-z]+[0-9]+							{return 'CELL';}
[A-Za-z]+ 							{return 'IDENTIFIER';}
[0-9]([0-9]?)[-/][0-9]([0-9]?)[-/][0-9]([0-9]?)([0-9]?)([0-9]?) {return 'DATE';}
[0-9]+[%]							{return 'PERCENT';}
[0-9]+("."[0-9]+)?  						{return 'NUMBER';}
"$"				{/* skip whitespace */}
" "				{return ' ';}
"."				{return '.';}
":"				{return ':';}
";"				{return ';';}
","				{return ',';}
"*" 				{return '*';}
"/" 				{return '/';}
"-" 				{return '-';}
"+" 				{return '+';}
"^" 				{return '^';}
"(" 				{return '(';}
")" 				{return ')';}
">" 				{return '>';}
"<" 				{return '<';}
">=" 				{return '>=';}
"<=" 				{return '<=';}
"<>"				{return '<>';}
"NOT"				{return 'NOT';}
"PI"				{return 'PI';}
"E"				{return 'E';}
'"'				{return '"';}
"'"				{return "'";}
"!"				{return "!";}
<<EOF>>				{return 'EOF';}
"="				{return '=';}


/lex

/* operator associations and precedence (low-top, high- bottom) */
%left '<=' '>=' '<>' 'NOT' '||'
%left '>' '<'
%left '+' '-'
%left '*' '/'
%left '^'
%left '%'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
 : e EOF
     {return $1;}
 ;

e
	: e '<=' e
		{$$ = ($1 * 1) <= ($3 * 1);}
	| e '>=' e
		{$$ = ($1 * 1) >= ($3 * 1);}
	| e '<>' e
		{$$ = ($1 * 1) != ($3 * 1);}
	| e NOT e
		{$$ = ($1 * 1) != ($3 * 1);}
	| e '>' e
		{$$ = ($1 * 1) > ($3 * 1);}
	| e '<' e
		{$$ = ($1 * 1) < ($3 * 1);}
	| e '+' e
		{$$ = jSE.cFN.sanitize($1) + jSE.cFN.sanitize($3);}
	| e '-' e
		{$$ = ($1 * 1) - ($3 * 1);}
	| e '*' e
		{$$ = ($1 * 1) * ($3 * 1);}
	| e '/' e
		{$$ = ($1 * 1) / ($3 * 1);}
	| e '^' e
		{$$ = Math.pow(($1 * 1), ($3 * 1));}
	| '-' e
		{$$ = $2 * -1;}
	| '(' e ')'
		{$$ = $2;}
	| PERCENT
		{$$ = ($1.replace(/%/,'') * 1) / 100;}
	| DATE
		{/*$$ = new Date($1).toString();*/}
	| NUMBER
		{$$ = Number(yytext);}
	| E
		{$$ = Math.E;}
	| FIXEDCELL
		{$$ = yy.lexer.cellHandler.fixedCellValue.apply(yy.lexer.cell, [$1]);}
	| FIXEDCELLRANGE
		{$$ = yy.lexer.cellHandler.fixedCellRangeValue.apply(yy.lexer.cell, [$1]);}
	| CELL
		{$$ = yy.lexer.cellHandler.cellValue.apply(yy.lexer.cell, [$1]);}
	| CELLRANGE
		{$$ = yy.lexer.cellHandler.cellRangeValue.apply(yy.lexer.cell, [$1]);}
	| REMOTECELL
		{$$ = yy.lexer.cellHandler.remoteCellValue.apply(yy.lexer.cell, [$1]);}
	| REMOTECELLRANGE
		{$$ = yy.lexer.cellHandler.remoteCellRangeValue.apply(yy.lexer.cell, [$1]);}
	| STRING
		{$$ = $1.substring(1, $1.length - 1);}	
	| IDENTIFIER '(' ')'
		{$$ = yy.lexer.cellHandler.callFunction($1, '', yy.lexer.cell);}
	| IDENTIFIER '(' expseq ')'
		{$$ = yy.lexer.cellHandler.callFunction($1, $3, yy.lexer.cell);}
 ;

expseq
 : e
	| e ';' expseq
 	{
 		$$ = ($.isArray($3) ? $3 : [$3]);
	 	$$.push($1);
 	}
 	| e ',' expseq
	{
 		$$ = ($.isArray($3) ? $3 : [$3]);
	 	$$.push($1);
 	}
 ;
