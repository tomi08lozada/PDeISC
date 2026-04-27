function show(id,t){document.getElementById(id).innerHTML=t;}

function ej1(){
const roles=['user','admin'];
show("out1",roles.includes("admin"));
}

function ej2(){
const colores=['rojo','azul','verde'];
show("out2",colores.includes("verde"));
}

function ej3(){
let nums=[1,2,3];
let n=4;
if(!nums.includes(n)) nums.push(n);
show("out3",nums);
}
