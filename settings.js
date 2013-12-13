/*============================================================================*/
// Power Polygon Settings
// This is the global settings for Power Polygon.
/*============================================================================*/

module.exports= {

	// this information is used by persona to allow user login
	userAuth: {
		subdomains: ['', 'www', 'static', 's1', 's2', 's3'], // eg.: www, ww2, etc
		domain: 'localhost'
	},

	// allows the creation of a default user(recomended)
    usedefaultuser: true,

    // the default user name
    defaultuser: 'admin',

    // directory where to store temporary files and uploads
    uploadDir: '/ppw/tmp/',

    // database source name(only sqlite supported by now)
    dbsrc: '.sqldb',

    // port to be used to keep the server and services on
    port: 8081,

    // server side key to be used for sessions
    serverSecret: 'onlyMeAndGitHubUsersKnowIt! - Please,change this for your use',

    // number of phantomjs instances to keep emulating talks analazing for changes
    // if you are the only user or have few users working on this server, keep it 1
    // increase this number in case your server is shared to many users
    phantomInstances: 4,
    // in case you set up phantomInstances to more than three(3) and it's using the all
    // the instances but one(for example, 9 out of 10 instances, or 3 out of 4), new
    // instances will be automatically started
    phantomInstancesIncrement: true
};