function show(id,t){document.getElementById(id).innerHTML=t;}

function ej1(){
show("out1",[3,1,2].sort((a,b)=>a-b));
}

function ej2(){
show("out2",['banana','pera','manzana'].sort());
}

function ej3(){
let u=[{nombre:'A',edad:30},{nombre:'B',edad:20}];
show("out3",u.sort((a,b)=>a.edad-b.edad).map(x=>x.nombre));
}
