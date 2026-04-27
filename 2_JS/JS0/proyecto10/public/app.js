function show(id,t){document.getElementById(id).innerHTML=t;}

function ej1(){
show("out1",[1,2,3].map(n=>n*3));
}

function ej2(){
show("out2",['juan','ana'].map(n=>n.toUpperCase()));
}

function ej3(){
show("out3",[100,200].map(p=>p*1.21));
}
