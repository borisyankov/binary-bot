var api = BinaryAPI();
var login = function login(token, callback){
	api.authenticate(token, callback);
};
