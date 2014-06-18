App.con = App.Controller = {
    
    initialize: function () {
        App.debug('App.Controller.initialize()');
        App.instance = this;
        // Create models
        App.con.userModel = new App.UserModel();
        App.con.mediaSources = new App.MediaModel({parse:true});
        App.con.queryCollection = new App.QueryCollection();
        // Create view manager and app-level views
        App.con.vm = new App.ViewManager({
            "selector": '.content .container'
        });
        App.con.controlsView = new App.ControlsView({ userModel: App.con.userModel });
        App.con.toolView = new App.ToolListView({
            collection:App.con.queryCollection
        });
        $('.brand-toolbar .links').append(App.con.toolView.el);
        $('.controls').append(App.con.controlsView.el);
        App.con.router = new App.Router();
        // Bind event handlers
        _.bindAll(this, 'onSignIn');
        _.bindAll(this, 'onSignOut');
        // Listener for events
        App.con.userModel.on('signin', App.con.onSignIn);
        App.con.userModel.on('signout', App.con.onSignOut);
        App.con.userModel.on('unauthorized', App.con.onSignOut);
        // Start navigation and log user in
        App.con.userModel.signIn({
            "success": function() { _.defer(function () { Backbone.history.start(); }); }
            , "error": function() { _.defer(function () { Backbone.history.start(); }); }
        });
    },
    
    onSignIn: function () {
        App.debug('App.Controller.onSignIn()');
        if (App.con.mediaSources.get('sources').length == 0) {
            $.ajax('/static/core/data/media.json', {
                "dataType": "json",
                "success": function (data) {
                    App.debug('Received media json:');
                    App.con.mediaSources.set(App.con.mediaSources.parse(data));
                    App.con.mediaSources.trigger('sync');
                    App.con.mediaSourceData = data;
                }
            })
        }
        App.con.router.navigate('', true);
    },
    
    onSignOut: function () {
        App.debug('App.Controller.onSignOut()');
        App.con.router.navigate('login', true);
    },
    
    onQuery: function (queryCollection) {
        App.debug('App.Controller.onQuery()');
        App.debug(queryCollection);
        var path = queryCollection.dashboardUrl();
        App.debug('Path: ' + path);
        App.con.router.navigate(path);
        App.con.showResults(queryCollection);
    },
    
    onDemoQuery: function (queryCollection) {
        App.debug('App.Controller.onQuery()');
        App.debug(queryCollection);
        var path = queryCollection.dashboardDemoUrl();
        App.debug('Path: ' + path);
        App.con.router.navigate(path);
        App.con.showResults(queryCollection);
    },
    
    showResults: function (queryCollection) {
        App.debug("App.Controller.showResults")
    },
    
    routeLogin: function () {
        App.debug('Route: login');
        App.con.loginView = App.con.vm.getView(App.LoginView, { model: App.con.userModel });
        App.con.vm.showView(App.con.loginView);
    },
    
    routeHome: function () {
        App.debug('Route: home');
        if (!App.con.userModel.get('authenticated')) {
            App.con.router.navigate('demo', true);
            return;
        }
        // Defaults media
        App.con.mediaModel = new App.MediaModel();
        App.con.mediaSources.deferred.then(function () {
            App.debug('Adding default media');
            //var tagSet = App.con.mediaSources.get('tag_sets').get(5).cloneEmpty();
            //tagSet.get('tags').add(App.con.mediaSources.get('tag_sets').get(5).get('tags').get(8875027).clone());
            //App.con.mediaModel.get('tag_sets').add(tagSet);
            var tag = App.con.mediaSources.get('tags').get(8875027).clone();
            App.con.mediaModel.get('tags').add(tag);
        });
        // Default tags
        // Defaults dates
        var dayMs = 24 * 60 * 60 * 1000;
        var ts = new Date().getTime();
        var start = new Date(ts - 15*dayMs);
        var end = new Date(ts - 1*dayMs);
        var attributes = {
            start: start.getFullYear() + '-' + (start.getMonth()+1) + '-' + start.getDate()
            , end: end.getFullYear() + '-' + (end.getMonth()+1) + '-' + end.getDate()
            , mediaModel: App.con.mediaModel
            , keywords: 'boston'
        };
        var options = {
            mediaSources: App.con.mediaSources
            , parse: true
        };
        if (!App.con.queryCollection) {
            App.con.queryCollection = new App.QueryCollection();
        } else {
            App.con.queryCollection.reset();
        }
        App.con.queryModel = new App.QueryModel(attributes, options);
        App.con.queryCollection.add(App.con.queryModel);
        App.con.queryListView = App.con.vm.getView(
            App.QueryListView
            , {
                collection: App.con.queryCollection
                , mediaSources: App.con.mediaSources
            }
        );
        App.con.queryCollection.on('execute', App.con.onQuery, this);
        App.con.vm.showView(App.con.queryListView);
    },
    
    routeDemo: function () {
        App.debug('Route: demo');
        // Defaults media
        App.con.mediaSources = new App.MediaModel();
        App.con.mediaSources.set(
            App.con.mediaSources.parse({
                'sources': [{"media_id":1,"url":"http://nytimes.com","name":"New York Times"},{"media_id":2,"url":"http://washingtonpost.com","name":"Washington Post"},{"media_id":4,"url":"http://www.usatoday.com","name":"USA Today"},{"media_id":6,"url":"http://www.latimes.com/","name":"LA Times"},{"media_id":7,"url":"http://www.nypost.com/","name":"The New York Post"},{"media_id":8,"url":"http://www.nydailynews.com/","name":"The Daily News New York"},{"media_id":14,"url":"http://www.sfgate.com/","name":"San Francisco Chronicle"},{"media_id":314,"url":"http://www.huffingtonpost.com/","name":"The Huffington Post"},{"media_id":1089,"url":"http://www.reuters.com/","name":"Reuters"},{"media_id":1092,"url":"http://www.foxnews.com/","name":"FOX News"},{"media_id":1094,"url":"http://www.bbc.co.uk/?ok","name":"BBC"},{"media_id":1095,"url":"http://www.cnn.com/","name":"CNN"},{"media_id":1098,"url":"http://www.newsweek.com/","name":"Newsweek "},{"media_id":1104,"url":"http://www.forbes.com/","name":"Forbes"},{"media_id":1149,"url":"http://www.msnbc.msn.com/","name":"MSNBC"},{"media_id":1747,"url":"http://www.dailymail.co.uk/home/index.html","name":"Daily Mail"},{"media_id":1750,"url":"http://www.telegraph.co.uk/","name":"Daily Telegraph"},{"media_id":1751,"url":"http://www.guardian.co.uk/","name":"Guardian"},{"media_id":1752,"url":"http://www.cbsnews.com/","name":"CBS News"},{"media_id":4415,"url":"http://cnet.com","name":"CNET"},{"media_id":4418,"url":"http://examiner.com","name":"Examiner.com"},{"media_id":4419,"url":"http://time.com","name":"TIME.com"}]
                , 'tag_sets' : [
                    {
                        "tag_sets_id": 5
                        , "name": "collection"
                        , "label": "Collections"
                        , "tags": [
                            {
                                "tag_sets_id":5
                                ,"label":"U.S. Mainstream Media"
                                ,"tag":"ap_english_us_top25_20100110"
                                ,"tags_id":8875027
                                ,"description":"Top U.S. mainstream media according Google Ad Planner's measure of unique monthly users."
                            }
                        ]
                    }
                ]
            })
        );
        App.con.mediaSources.trigger('sync');
        App.con.mediaModel = App.con.mediaSources.subset({"sets":[8875027]});
        // Defaults dates
        var dayMs = 24 * 60 * 60 * 1000;
        var ts = new Date().getTime();
        var start = new Date(ts - 15*dayMs);
        var end = new Date(ts - 1*dayMs);
        var attributes = {
            start: start.getFullYear() + '-' + (start.getMonth()+1) + '-' + start.getDate()
            , end: end.getFullYear() + '-' + (end.getMonth()+1) + '-' + end.getDate()
            , mediaModel: App.con.mediaModel
            , keywords: 'boston'
        };
        var options = {
            mediaSources: App.con.mediaSources
            , parse: true
            , ResultModel: App.DemoResultModel
        };
        if (!App.con.queryCollection) {
            App.con.queryCollection = new App.QueryCollection();
        } else {
            App.con.queryCollection.reset();
        }
        App.con.queryModel = new App.QueryModel(attributes, options);
        App.con.queryCollection.add(App.con.queryModel);
        App.con.queryListView = App.con.vm.getView(
            App.DemoQueryListView
            , {
                collection: App.con.queryCollection
                , mediaSources: App.con.mediaSources
            }
        );
        App.con.queryCollection.on('execute', App.con.onDemoQuery, this);
        App.con.vm.showView(App.con.queryListView);
    },
    
    routeDemoQuery: function (keywords, media, start, end) {
        App.debug('Route: demoQuery ------------------------------------------------------------------------------------------------------------------------');
    },
    
    routeQuery: function (keywords, media, start, end) {
        App.debug('Route: query ------------------------------------------------------------------------------------------------------------------------');
    }
};