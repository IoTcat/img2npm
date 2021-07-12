const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec; 

const src = 'wallpaper';
const dir = './';
const folder = 'new';
const name = "ushio-api-img-wallpaper";

const classifier = function(s){
	let id = s.match(/img_(\S*?)_(\d{2,4})x(\d{2,4})_(\S*?)_(\S*?)_(\S*?).(jpe?g|png|gif|svg)\b/)[1];
	let date = new Date(id);
	return '1.'+date.getYear()+'.'+(date.getMonth()+1)+date.getDay();
}


const root = path.join(dir, folder);


if(fs.existsSync(root)) console.error(root + ' already exists!') && exit(-1);

fs.mkdirSync(root);

fs.readdirSync(src).forEach(item => {
	let clas = classifier(item);
	if(!fs.readdirSync(root).includes(clas)){
		fs.mkdirSync(path.join(root, clas));
		fs.writeFileSync(path.join(root, clas, 'package.json'), JSON.stringify({
		  "name": name,
		  "version": clas
		}, null, 4));
	}
	fs.writeFileSync(path.join(root, clas, item), fs.readFileSync(path.join(src, item)));
});

let cnt = 0;

publish = (clas) => new Promise(async (resolve, reject)=>{

	var cmdStr = 'yarn publish --new-version ' + clas;
	exec(cmdStr, {cwd: path.join(process.cwd(), root, clas)},async function(err,stdout,stderr){
		cnt --;
	    if(err && cnt) {
	        console.error(clas + ' error:'+stderr);
	        await publish(clas);
	    } 
	    resolve();
	});
})


;(async function(){
	for(let i = 0; i < fs.readdirSync(root).length; i ++) {
		let clas = fs.readdirSync(root)[i];
		console.log(clas)
		cnt = 3;
		await publish(clas);

	}
})()
