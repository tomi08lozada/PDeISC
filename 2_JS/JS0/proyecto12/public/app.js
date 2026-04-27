function show(id,t){document.getElementById(id).innerHTML=t;}

function ej1(){
show("out1",[1,2,3].reduce((a,b)=>a+b,0));
}

function ej2(){
show("out2",[1,2,3].reduce((a,b)=>a*b,1));
}

function ej3(){
let p=[{precio:100},{precio:200}];
show("out3",p.reduce((a,b)=>a+b.precio,0));
}
