function show(id,t){document.getElementById(id).innerHTML=t;}

function ej1(){
show("out1",[5,12,20].filter(n=>n>10));
}

function ej2(){
show("out2",['hola','javascript'].filter(p=>p.length>5));
}

function ej3(){
let u=[{nombre:'A',activo:true},{nombre:'B',activo:false}];
show("out3",u.filter(x=>x.activo).map(x=>x.nombre));
}
