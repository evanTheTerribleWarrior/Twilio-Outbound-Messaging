exports.checkHeader = (origin, domain) => {

	if(origin === domain)return false
	else return true

}