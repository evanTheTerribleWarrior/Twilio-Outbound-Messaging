const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const limit = 10;
const min = 10;
const max = 1000;

function randomNumber(min, max){
    const r = Math.random()*(max-min) + min
    return Math.floor(r)
}

expbackoff = async (fn, depth = 0) => {
	try {
		return await fn();
	}catch(e) {
		if(e.message.toLowerCase().indexOf("too many requests") !== -1){
			if (depth > limit) {
				throw e;
			}
			
			let number = randomNumber(min, max)
			await wait((2 ** depth) + number);
		
			return expbackoff(fn, depth + 1);
		}else{
			throw e;
		}
		
	}
}

module.exports = {expbackoff};