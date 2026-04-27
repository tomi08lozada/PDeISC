function show(id,t){document.getElementById(id).innerHTML=t;}

function ej1(){
show("out1",['a','b','c'].reverse());
}

function ej2(){
show("out2",[1,2,3].reverse());
}

function ej3(){
show("out3","hola".split('').reverse().join(''));
}
