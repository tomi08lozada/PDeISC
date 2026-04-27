function show(id,t){document.getElementById(id).innerHTML=t;}

function ej1(){
let nombres=['Juan','Ana'];
let res="";
nombres.forEach(n=>res+="Hola "+n+"<br>");
show("out1",res);
}

function ej2(){
let nums=[2,4,6];
let res="";
nums.forEach(n=>res+=n*2+" ");
show("out2",res);
}

function ej3(){
let users=[{nombre:'Leo',edad:20}];
let res="";
users.forEach(u=>res+=u.nombre+" "+u.edad);
show("out3",res);
}
