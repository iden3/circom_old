/*
    Copyright 2018 0KIMS association.

    This file is part of circom (Zero Knowledge Circuit Compiler).

    circom is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    circom is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with circom. If not, see <https://www.gnu.org/licenses/>.
*/

/* description: Construct AST for jaz language. */

/* lexical grammar */
%lex

%%

\s+                     { /* skip whitespace */ }
\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/ { /* console.log("MULTILINE COMMENT: "+yytext); */  }
\/\/.*                                      { /* console.log("SINGLE LINE COMMENT: "+yytext); */ }
var                     { return 'var'; }
signal                  { return 'signal'; }
private                 { return 'private'; }
input                   { return 'input'; }
output                  { return 'output'; }
linearCombination       { return 'linearCombination'; }
component               { return 'component'; }
template                { return 'template'; }
function                { return 'function'; }
if                      { return 'if'; }
else                    { return 'else'; }
for                     { return 'for'; }
while                   { return 'while'; }
compute                 { return 'compute'; }
do                      { return 'do'; }
return                  { return 'return'; }
include                 { return 'include'; }
0x[0-9A-Fa-f]*          { return 'HEXNUMBER'; }
[0-9]+                  { return 'DECNUMBER'; }
[a-zA-Z][a-zA-Z$_0-9]*  { return 'IDENTIFIER'; }
\"[^"]+\"               { yytext = yytext.slice(1,-1); return 'STRING'; }
\=\=\>                  { return '==>'; }
\<\=\=                  { return '<=='; }
\-\-\>                  { return '-->'; }
\<\-\-                  { return '<--'; }
\=\=\=                  { return '==='; }
\>\>\=                  { return '>>='; }
\<\<\=                  { return '<<='; }
\&\&                    { return '&&'; }
\|\|                    { return '||'; }
\=\=                    { return '=='; }
\<\=                    { return '<='; }
\>\=                    { return '>='; }
\!\=                    { return '!='; }
\>\>                    { return '>>'; }
\<\<                    { return '<<'; }
\*\*                    { return '**'; }
\+\+                    { return '++'; }
\-\-                    { return '--'; }
\+\=                    { return '+='; }
\-\=                    { return '-='; }
\*\=                    { return '*='; }
\/\=                    { return '/='; }
\%\=                    { return '%='; }
\|\=                    { return '|='; }
\&\=                    { return '&='; }
\^\=                    { return '^='; }
\=                      { return '='; }
\+                      { return '+'; }
\-                      { return '-'; }
\*                      { return '*'; }
\/                      { return '/'; }
\\                      { return '\\'; }
\%                      { return '%'; }
\^                      { return '^'; }
\&                      { return '&'; }
\|                      { return '|'; }
\!                      { return '!'; }
\~                      { return '~'; }
\<                      { return '<'; }
\>                      { return '>'; }
\!                      { return '!'; }
\?                      { return '?'; }
\:                      { return ':'; }
\(                      { return '('; }
\)                      { return ')'; }
\[                      { return '['; }
\]                      { return ']'; }
\{                      { return '{'; }
\}                      { return '}'; }
\;                      { return ';'; }
\,                      { return ','; }
\.                      { return '.'; }
<<EOF>>                 { return 'EOF'; }
.                       { console.log("INVALID: " + yytext); return 'INVALID'}

/lex

%left ';'
%right 'if' 'else'
%left EMPTY
%left IDLIST
%left ','
%right '?' ':' TERCOND '=' '+=' '-=' '*=' '/=' '%=' '>>=' '<<=' '&=' '|=' '^=' '<==' '==>' '===' '<--' '-->'
%left '||'
%left '&&'
%left '|'
%left '^'
%left '&'
%left '==' '!='
%left '<=' '>=' '<' '>'
%left '<<' '>>'

%left '+' '-'
%left '*' '/' '\\' '%'
%left '**'
%right '++' '--' UMINUS UPLUS '!' '~'
%left '.'
%left DECL
%left  PLUSPLUSRIGHT MINUSMINUSRIGHT '[' ']' '(' ')'
%left HIGH



%{
const Scalar = require('ffjavascript').Scalar;
const util = require('util');

function setLines(dst, first, last) {
    last = last || first;
    dst.first_line = first.first_line;
    dst.first_column = first.first_column;
    dst.last_line = last.last_line;
    dst.last_column = last.last_column;
}

%}

%start allStatments

%% /* language grammar */


allStatments
    : statmentList EOF
        {
//            console.log(JSON.stringify($1, null, 1));
            $$ = { type: "BLOCK", statements: $1.statments };
            setLines($$, @1);
            return $$
        }
    ;

statmentList
    : statmentList statment
        {
            $1.statments.push($2);
            setLines($1, @1, @2);
        }
    | statment
        {
            $$ = { type: "STATMENTLIST", statments: [$1] };
            setLines($$, @1);
        }
    ;

statment
    : functionDefinitionStatment
        {
            $$ = $1;
        }
    | templateDefinitionStatment
        {
            $$ = $1;
        }
    | ifStatment
        {
            $$ = $1;
        }
    | forStatment
        {
            $$ = $1;
        }
    | whileStatment
        {
            $$ = $1;
        }
    | doWhileStatment
        {
            $$ = $1;
        }
    | computeStatment
        {
            $$ = $1;
        }
    | returnStatment
        {
            $$ = $1;
        }
    | block
        {
            $$ = $1;
        }
    | expressionStatment
        {
            $$ = $1;
        }
    | includeStatment
        {
            $$ = $1;
        }
    ;


functionDefinitionStatment
    : 'function' IDENTIFIER '(' identifierList ')' block
        {
            $$ = { type: "FUNCTIONDEF", name: $2, params: $4.identifiers, block: $6};
            setLines($$, @1, @6);
        }
    | 'function' IDENTIFIER '(' ')' block
        {
            $$ = { type: "FUNCTIONDEF", name: $2, params: [], block: $5 };
            setLines($$, @1, @5);
        }
    ;

templateDefinitionStatment
    : 'template' IDENTIFIER '(' identifierList ')' block
        {
            $$ = { type: "TEMPLATEDEF", name: $2, params: $4.identifiers, block: $6 };
            setLines($$, @1, @6);
        }
    | 'template' IDENTIFIER '(' ')' block
        {
            $$ = { type: "TEMPLATEDEF", name: $2, params: [], block: $5 };
            setLines($$, @1, @5);
        }
    ;


identifierList
    : identifierList ',' IDENTIFIER
        {
            $1.identifiers.push($3);
            setLines($1, @1, @3);
        }
    | IDENTIFIER %prec EMPTY
        {
            $$ = { type: "IDENTIFIERLIST", identifiers: [$1] };
            setLines($$, @1);
        }
    ;

ifStatment
    : 'if' '(' expression ')' statment 'else' statment
        {
            $$ = { type: "IF", condition: $3, then: $5, else: $7 };
            setLines($$, @1, @7);
        }
    | 'if' '(' expression ')' statment
        {
            $$ = { type: "IF", condition: $3, then: $5 };
            setLines($$, @1, @5);
        }
    ;

forStatment
    : 'for' '(' expression ';' expression ';' expression ')' statment
        {
            $$ = { type: "FOR", init: $3, condition: $5, step: $7, body: $9 };
            setLines($$, @1, @9);
        }
    ;

whileStatment
    : 'while' '(' expression ')' statment
        {
            $$ = { type: "WHILE", condition: $3, body: $5 };
            setLines($$, @1, @5);
        }
    ;

doWhileStatment
    : 'do' statment 'while' '(' expression ')'
        {
            $$ = { type: "DOWHILE", condition: $5, body: $2 };
            setLines($$, @1, @6);
        }
    ;

computeStatment
    : 'compute' statment
        {
            $$ = { type: "COMPUTE",  body: $2 };
            setLines($$, @1, @2);
        }
    ;

returnStatment
    : 'return' expression ';'
        {
            $$ = { type: "RETURN", value: $2 };
            setLines($$, @1, @3);
        }
    | 'return' expression %prec ';'
        {
            $$ = { type: "RETURN", value: $2 }
            setLines($$, @1, @2);
        }
    ;

includeStatment
    : 'include' STRING ';'
        {
            $$ = { type: "INCLUDE", file: $2 };
            setLines($$, @1, @3);
        }
    | 'include' STRING %prec ';'
        {
            $$ = { type: "INCLUDE", file: $2 }
            setLines($$, @1, @2);
        }
    ;

block
    : '{' statmentList '}'
        {
            $$ = { type: "BLOCK", statements: $2.statments };
            setLines($$, @1, @3);
        }
    ;

expressionStatment
    : expression ';' %prec ';'
        {
            $$ = $1;
        }
    | expression %prec ';'
        {
            $$ = $1;
        }
    ;

expression
    : e17 %prec EMPTY
        {
            $$ = $1;
        }
    ;

e17
   : leftHandExpression '=' e17
        {
            $$ = { type: "OP", op: "=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '+=' e17
        {
            $$ = { type: "OP", op: "+=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '-=' e17
        {
            $$ = { type: "OP", op: "-=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '*=' e17
        {
            $$ = { type: "OP", op: "*=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '/=' e17
        {
            $$ = { type: "OP", op: "/=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '%=' e17
        {
            $$ = { type: "OP", op: "%=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '<<=' e17
        {
            $$ = { type: "OP", op: "<<=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '>>=' e17
        {
            $$ = { type: "OP", op: ">>=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '&=' e17
        {
            $$ = { type: "OP", op: "&=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '|=' e17
        {
            $$ = { type: "OP", op: "|=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '^=' e17
        {
            $$ = { type: "OP", op: "^=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '<==' e17
        {
            $$ = { type: "OP", op: "<==", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e17 '==>' leftHandExpression
        {
            $$ = { type: "OP", op: "<==", values: [$3, $1] };
            setLines($$, @1, @3);
        }
    | leftHandExpression '<--' e17
        {
            $$ = { type: "OP", op: "<--", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e17 '-->' leftHandExpression
        {
            $$ = { type: "OP", op: "<--", values: [$3, $1] };
            setLines($$, @1, @3);
        }
    | e16 '===' e17
        {
            $$ = { type: "OP", op: "===", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e17 '?' e17 ':' e17 %prec TERCOND
        {
            $$ = { type: "OP", op: "?", values: [$1, $3, $5] };
            setLines($$, @1, @5);
        }
    | e16 %prec EMPTY
       {
        $$ = $1;
       }
    ;

e16
    : rightArray
       {
        $$ = $1;
       }
    | e15 %prec EMPTY
       {
        $$ = $1;
       }
    ;

e15
    : e15 '||' e14
        {
            $$ = { type: "OP", op: "||", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e14 %prec EMPTY
       {
        $$ = $1;
       }
    ;

e14
    : e14 '&&' e13
        {
            $$ = { type: "OP", op: "&&", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e13 %prec EMPTY
       {
        $$ = $1;
       }
    ;

e13
    : e13 '|' e12
        {
            $$ = { type: "OP", op: "|", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e12 %prec EMPTY
       {
        $$ = $1;
       }
    ;


e12
    : e12 '^' e11
        {
            $$ = { type: "OP", op: "^", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e11 %prec EMPTY
        {
            $$ = $1;
        }
    ;

e11
    : e11 '&' e10
        {
            $$ = { type: "OP", op: "&", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e10 %prec EMPTY
        {
            $$ = $1;
        }
    ;




e10
    : e10 '==' e9
        {
            $$ = { type: "OP", op: "==", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e10 '!=' e9
        {
            $$ = { type: "OP", op: "!=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e9 %prec EMPTY
       {
        $$ = $1
       }
    ;

e9
    : e9 '<=' e7
        {
            $$ = { type: "OP", op: "<=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e9 '>=' e7
        {
            $$ = { type: "OP", op: ">=", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e9 '<' e7
        {
            $$ = { type: "OP", op: "<", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e9 '>' e7
        {
            $$ = { type: "OP", op: ">", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e7 %prec EMPTY
       {
        $$ = $1
       }
    ;

e7
    : e7 '<<' e6
        {
            $$ = { type: "OP", op: "<<", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e7 '>>' e6
        {
            $$ = { type: "OP", op: ">>", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e6 %prec EMPTY
       {
            $$ = $1;
       }
    ;

e6
    : e6 '+' e5
        {
            $$ = { type: "OP", op: "+", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e6 '-' e5
        {
            $$ = { type: "OP", op: "-", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e5 %prec EMPTY
        {
            $$ = $1;
        }
    ;


e5
    : e5 '*' e4
        {
            $$ = { type: "OP", op: "*", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e5 '/' e4
        {
            $$ = { type: "OP", op: "/", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e5 '\\' e4
        {
            $$ = { type: "OP", op: "\\", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e5 '%' e4
        {
            $$ = { type: "OP", op: "%", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e4 %prec EMPTY
        {
            $$ = $1;
        }
    ;

e4
    : e4 '**' e3
        {
            $$ = { type: "OP", op: "**", values: [$1, $3] };
            setLines($$, @1, @3);
        }
    | e3 %prec EMPTY
        {
            $$ = $1;
        }
    ;


e3
    : '++' leftHandExpression
        {
            $$ = { type: "OP", op: "PLUSPLUSLEFT", values: [$2] };
            setLines($$, @1, @2);
        }
    | '--' leftHandExpression
        {
            $$ = { type: "OP", op: "MINUSMINUSLEFT", values: [$2] };
            setLines($$, @1, @2);
        }
    | '+' e3 %prec UPLUS
        {
            $$ = $2;
            setLines($$, @1, @2);
        }
    | '-' e3 %prec UMINUS
        {
            $$ = { type: "OP", op: "UMINUS", values: [$2] };
            setLines($$, @1, @2);
        }
    | '!' e3
        {
            $$ = { type: "OP", op: "!", values: [$2] };
            setLines($$, @1, @2);
        }
    | '~' e3
        {
            $$ = { type: "OP", op: "~", values: [$2] };
            setLines($$, @1, @2);
        }
    | e2 %prec EMPTY
        {
            $$ = $1;
        }
    ;

e2
    : leftHandExpression '++' %prec PLUSPLUSRIGHT
        {
            $$ = {type: "OP", op: "PLUSPLUSRIGHT", values: [$1] };
            setLines($$, @1, @2);
        }
    | leftHandExpression '--' %prec MINUSMINUSRIGHT
        {
            $$ = {type: "OP", op: "MINUSMINUSRIGHT", values: [$1] };
            setLines($$, @1, @2);
        }
    | functionCall
        {
            $$ = $1;
        }
    | e0 %prec EMPTY
        {
            $$ = $1;
        }
    ;

e0
    : leftHandExpression %prec EMPTY
        {
            $$ = $1
        }
    | DECNUMBER
        {
            $$ = {type: "NUMBER", value: Scalar.fromString($1) }
            setLines($$, @1);
        }
    | HEXNUMBER
        {
            $$ = {type: "NUMBER", value: Scalar.fromString($1.substr(2).toUpperCase(), 16) }
            setLines($$, @1);
        }
    | '(' expression ')' %prec EMPTY
        {
            $$ = $2;
            setLines($$, @1, @3);
        }
    ;

leftHandExpression
    : simpleLeftHandExpression '.' simpleLeftHandExpression %prec EMPTY
        {
            $$ = {type: "PIN", component: $1, pin: $3 };
            setLines($$, @1, @3);
        }
    | declaration %prec DECL
        {
            $$ = $1
        }
    | simpleLeftHandExpression %prec EMPTY
        {
            $$ = $1
        }
    ;



declaration
    : 'var' simpleLeftHandExpression %prec DECL
        {
            $$ = {type: "DECLARE", declareType: "VARIABLE", name: $2}
            setLines($$, @1, @2);
        }
    | 'signal' simpleLeftHandExpression %prec DECL
        {
            $$ = {type: "DECLARE", declareType: "SIGNAL", name: $2}
            setLines($$, @1, @2);
        }
    | 'signal' 'input' simpleLeftHandExpression %prec DECL
        {
            $$ = {type: "DECLARE", declareType: "SIGNALIN", name: $3};
            setLines($$, @1, @3);
        }
    | 'signal' 'private' 'input' simpleLeftHandExpression %prec DECL
        {
            $$ = {type: "DECLARE", declareType: "SIGNALIN", private: true, name: $4};
            setLines($$, @1, @4);
        }
    | 'signal' 'output' simpleLeftHandExpression %prec DECL
        {
            $$ = {type: "DECLARE", declareType: "SIGNALOUT", name: $3};
            setLines($$, @1, @3);
        }
    | 'component' simpleLeftHandExpression %prec DECL
        {
            $$ = {type: "DECLARE", declareType: "COMPONENT", name: $2}
            setLines($$, @1, @2);
        }
    ;

simpleLeftHandExpression
    : simpleLeftHandExpression array
        {
            for (let i=0; i< $2.values.length; i++) {
                $1.selectors.push($2.values[i]);
            }
            setLines($1, @1, @2);
        }
    | IDENTIFIER %prec EMPTY
        {
            $$ = {type: "VARIABLE", name: $1 , selectors: []};
            setLines($$, @1);
        }
    ;

functionCall
    : IDENTIFIER '(' expressionList ')'
        {
            $$ = {type: "FUNCTIONCALL", name: $1, params: $3.expressions}
            setLines($$, @1, @4);
        }
    | IDENTIFIER '(' ')'
        {
            $$ = {type: "FUNCTIONCALL", name: $1, params: []}
            setLines($$, @1, @3);
        }
    ;

expressionList
    : expressionList ',' expression
        {
            $1.expressions.push($3);
            setLines($$, @1, @3);
        }
    | expression %prec ','
        {
            $$ = {type: "EXPRESSIONLST", expressions: [$1]};
            setLines($$, @1);
        }
    ;

rightArray
    : array %prec EMPTY
        {
            $$ = $1;
        }
    ;

array
    : '[' expressionList ']'
           {
                $$ = { type: "ARRAY", values: $2.expressions};
                setLines($$, @1, @3);
           }
    ;

