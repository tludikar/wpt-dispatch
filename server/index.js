"use strict";

require('babel-register')();

const Hapi = require('hapi');
const routes = require('./routes').default;
const path = require('path');
const Immutable = require('immutable');

let isProduction = process.env.NODE_ENV === "production";
let port = isProduction ? process.env.PORT || 9000 : 9000;
delete process.env.BROWSER;

let server = new Hapi.Server();
server.connection({
	host: 'localhost',
	port: port,
	routes: {
		files: {
			relativeTo: path.resolve(__dirname, '../public')
		}
	}
});

const serverOpts = () => {
	let options = Immutable.List.of({ register: require('inert') }, { register: require('vision') });
	if(!isProduction){
		return options.push({register: require('h2o2')}).toArray();
	}
	return options.toArray();
}

server.register(serverOpts(), (err) => {
	if(err) throw err;

	server.views({
       engines: {
            html: require('handlebars')
        },
        relativeTo: path.resolve(__dirname, "../webapp/"),
        path: 'templates'
	});

	server.route(routes);

	server.start(() => console.log("Server started at: " + server.info.uri));
});
