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
    serverSecret: 'onlyMeAndGitHubUsersKnowIt! - Please,change this for your use'
};