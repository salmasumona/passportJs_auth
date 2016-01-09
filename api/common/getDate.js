'use strict';

exports.getDate = function(){
	var d=new Date();
    var month = parseInt(d.getMonth())+ parseInt(1);
    var n=d.toLocaleTimeString()+' '+d.getFullYear() + "/" + month + "/" + d.getDate();
    return n;
};