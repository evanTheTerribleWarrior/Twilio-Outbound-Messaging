const wait = (ms) => new Promise((res) => setTimeout(res, ms));

function randomNumber(min, max){
    const r = Math.random()*(max-min) + min
    return Math.floor(r)
}

async function expbackoff(fn, depth = 0) {
	try {
		return await fn();
	}catch(e) {
		if(e.message.toLowerCase().indexOf("too many requests") !== -1){
			console.log("Got error: " + e.message)
			if (depth > 7) {
				throw e;
			}
			
			let number = randomNumber(1, 1000)
			await wait((2 ** depth) + number);
		
			return expbackoff(fn, depth + 1);
		}else{
			console.log("Got error: " + e.message)
			if (depth > 3) {
				throw e;
			}
			
			let number = randomNumber(1, 1000)
			await wait((2 ** depth) + number);
		
			return expbackoff(fn, depth + 1);
		}
		
	}
}

export {expbackoff}