var pythonGetGraphStructure = 'http://141.161.20.98/direwolf/pythonCgi/getGraph.cgi';
var pythonGetMoreTags = 'http://141.161.20.98/direwolf/pythonCgi/getMoreTags.cgi';
var pythonSearch = 'http://141.161.20.98/direwolf/pythonCgi/pattern_handler.cgi';
var pythonGetPossiblePairs = 'http://141.161.20.98/direwolf/pythonCgi/getPossiblePairs.cgi';
var pythonGetMoreSpecificTypeOfTags = 'http://141.161.20.98/direwolf/pythonCgi/getMoreSpecificTypeOfTags.cgi';

app.service('pythonService',function($http,$sce, $q,$rootScope){
	this.queryData = function (args){
		 var defer = $q.defer();
		 $.ajax({
		 	method: 'post',
		 	url: pythonSearch,
		 	data:
		 		{
		 		drop_str: args
		 		},
		 	success: function(response){
		 		response=angular.fromJson(response);

		 		docs= response.response.docs;
		 		for (var i in docs) {
		      				// Convert NULL title to "No Title"
		      				if (docs[i].title==null ||docs[i].title=="") {
		      					docs[i].title="No Title";
		      				}

		      				// Unescape highlights' HTML 
		      				try{
		      					docs[i].highlighting=getSnippet(docs[i].content, args);
		      				} catch (err){
		      				}

		      				docs[i].plainContent=docs[i].content;
		      				docs[i].content+="&nbsp; THE END."
		      				docs[i].content=$sce.trustAsHtml(highlight(docs[i].content,args));
		      				docs[i].escapedUlr=docs[i].url;
		      				docs[i].url=unescape(docs[i].url);
		      				$sce.trustAsResourceUrl(docs[i].url);
		      				docs[i].upVote=null;
		      				docs[i].downVote=null;
		      			}
		      			data = {docs:docs, numFound:response.response.numFound};

		 		//$rootScope.$broadcast('gotTopicTree',response.topics);
            	//resetCavas(topics);
              	defer.resolve(data);
		 	},
		 	error: function(){
		 		defer.reject('Can not connect to server');
		 	}
		 });
		 return defer.promise;;
	}

	this.getPossiblePairs = function (args){
		 var defer = $q.defer();
		 $.ajax({
		 	method: 'post',
		 	url: pythonGetPossiblePairs,
		 	data:
		 		{
		 		text: args
		 		},
		 	success: function(response){
		 		response=angular.fromJson(response);
              	defer.resolve(response);
		 	},
		 	error: function(){
		 		defer.reject('Can not connect to server');
		 	}
		 });
		 return defer.promise;;
	}

	this.getMoreTags = function (args){
		 var defer = $q.defer();
		 $.ajax({
		 	method: 'post',
		 	url: pythonGetMoreTags,
		 	data:
		 		{
		 		text: args
		 		},
		 	success: function(response){
		 		console.log(response);
		 		response=[{"field":"Product","key":"Part #","value":"CY7C1470V33-167AXI"},{"field":"Product","key":"Manufactor","value":"CYPRESS"},{"field":"Seller","key":"Telephone","value":"0755-83207872"},{"field":"Seller","key":"Qq","value":"QQ:1143812087"},{"field":"Seller","key":"Email","value":"E-mail:xsdic518@yeah.net"},{"field":"Product","key":"Part #","value":"STMPE610QTR"},{"field":"Product","key":"Package","value":"QFN16"},{"field":"Product","key":"Part #","value":"MC68EZ328CPU16V"},{"field":"Product","key":"Manufactor","value":"MOTOROLA"}]
		 		response=angular.fromJson(response);
              	defer.resolve(response);
		 	},
		 	error: function(){
		 		defer.reject('Can not connect to server');
		 	}
		 });
		 return defer.promise;;
	}

	this.getMoreSpecificTypeOfTags = function (args){
		 var defer = $q.defer();
		 $.ajax({
		 	method: 'post',
		 	url: pythonGetMoreSpecificTypeOfTags,
		 	data:
		 		{
		 		text: args.text,
		 		type: args.type
		 		},
		 	success: function(response){
		 		response=[{"field":"Product","key":"Part #","value":"CY7C1470V33-167AXI"},{"field":"Product","key":"Manufactor","value":"CYPRESS"},{"field":"Seller","key":"Telephone","value":"0755-83207872"},{"field":"Seller","key":"Qq","value":"QQ:1143812087"},{"field":"Seller","key":"Email","value":"E-mail:xsdic518@yeah.net"},{"field":"Product","key":"Part #","value":"STMPE610QTR"},{"field":"Product","key":"Package","value":"QFN16"},{"field":"Product","key":"Part #","value":"MC68EZ328CPU16V"},{"field":"Product","key":"Manufactor","value":"MOTOROLA"}]
		 		response=angular.fromJson(response);
              	defer.resolve(response);
		 	},
		 	error: function(){
		 		defer.reject('Can not connect to server');
		 	}
		 });
		 return defer.promise;;
	}

	this.getGraphStructure = function (args){
		var defer = $q.defer();
		$.ajax({
			method: 'post',
			url: pythonGetGraphStructure,
			data:
			{
				text: JSON.stringify(args)
			},
			success: function(response){
		 		//response=angular.fromJson(response);
		 		console.log("from cgi:");
		 		console.log(response);
		 		defer.resolve(response);
		 	},
		 	error: function(){
		 		defer.reject('Can not connect to server');
		 	}
		 });
		return defer.promise;;
	}
});



// Cookie
app.service('rootCookie',function($rootScope,$cookies){
	this.get = function (key){
		var value = $cookies.getObject(key);
		if (value){
			return value;	
		} else {
			if (key=="interactionHistory" || key=="stateHistory") {
				return [];
			} else if (key=="lastQuery"){
				return "";
			}
			return {};
		}
	}
	this.put = function (key,value){
		if (key=="interactionHistory"){
			var maxLength=6
			if (value.length>maxLength) {
				var slicedValue = [];
				for (var i=value.length-maxLength; i<value.length; i++){
					slicedValue.push(value[i]);
				}
				$cookies.putObject(key,slicedValue);
			} else {
				$cookies.putObject(key,value);
			}
		} else {
			$cookies.putObject(key,value);
		}
	}
});

app.service('solrService',function($http,$sce, $q,$rootScope){
	this.sendUpVote = function (doc){
	}
	this.sendDownVote = function (doc){
	}
	
	this.clearHistory = function (query){
		 var defer = $q.defer();
		 $http(
		            {method: 'JSONP',
		             url: solrQueryUrl,
		             params:{
		            	 	'q': 'content:'+"placeholder",
		            	    'json.wrf': 'JSON_CALLBACK',
		                    'wt':'json',
		                    'clearHistory':"true"
		                    }
		            })
		            .success(function(response) {
		              	defer.resolve();
		            }).error(function() {
		            	defer.reject('Can not get data from Solr');
		 });
		 return defer.promise;;
	}
	
	this.queryMore = function (query,start,status){
		 var defer = $q.defer();
		var url=solrQueryUrl;
		$http(
		            {method: 'JSONP',
		             url: url,
		             params:{
		            	 	'q': "*:*",
		            	    'json.wrf': 'JSON_CALLBACK',
		                    'wt':'json',
		                    'hl':true,
		                    'hl.fl':'*',
		                    'hl.simple.pre':'',
		                    'hl.simple.post':'',
		                    'hl.fragsize':500,
		                    'row':10,
		                    'start':start,
		                    'status':status
		                    }
		            })
		            .success(function(response) {
		            	docs= response.response.docs;
		              	for (var prop in  response.highlighting) {
		            	  	for (var doc in docs){
		            		  	if (docs[doc].id==prop){
		            		  		try {
		            		  			docs[doc].highlighting=docs[doc].content;
		            		  		} catch (err){
		            		  			docs[doc].highlighting="";
		            		  		}
		            		  	}
		            	  	}
		              	}
		              	for (var i in docs) {
		      				// Convert NULL title to "No Title"
		      				if (docs[i].title==null ||docs[i].title=="") {
		      					docs[i].title="No Title";
		      				}
		      			
		      				// Unescape highlights' HTML 
		      				try{
		      					docs[i].highlighting=$sce.trustAsHtml(docs[i].highlighting.trim());
		      				} catch (err){
		      				}

		      				docs[i].plainContent=docs[i].content;
		      				docs[i].content+="&nbsp; THE END."
		      				docs[i].content=unescape(docs[i].content);
		      				docs[i].content=$sce.trustAsHtml(docs[i].content);
		      				docs[i].escapedUlr=docs[i].url;
		      				docs[i].url=unescape(docs[i].url);
		      				$sce.trustAsResourceUrl(docs[i].url);
		      				docs[i].upVote=null;
		      				docs[i].downVote=null;
		      			}
		              	data = {docs:docs, numFound:response.response.numFound};
		              	defer.resolve(data);
		            }).error(function() {
		            	defer.reject('Can not get data from Solr');
		 });
		 return defer.promise;;
	}

	this.queryData = function (query,start,status){
		/*
		if (status!="oldQuery" && query==$rootScope.hackDoubleQuery){
			return;
		}
		*/
		$rootScope.cubeTestImageNumber=($rootScope.cubeTestImageNumber+1)%10;
		$rootScope.nextInNavi="nextPage";
		$rootScope.hackDoubleQuery=query;
		
		 var docs=[];
		 var defer = $q.defer();
		 var excludeKeywords={};
		 excludeKeywords.content = null;
		 excludeKeywords.title = null;
		 /*
		 if ($rootScope.queryAdvanced.exclude!=undefined && $rootScope.queryAdvanced.exclude.length>0){
			 excludeKeywords.content="-content:";
			 excludeKeywords.title = "-title:";
			 excludeKeywords.content+=$rootScope.queryAdvanced.exclude.replace(/ /g, '+');
			 excludeKeywords.title+=$rootScope.queryAdvanced.exclude.replace(/ /g, '+');
		 }*/
		
		 var url=solrQueryUrl;
		 if ($rootScope.queryMode=="structural"){
			 var old=query;
			 query=convertStructuralQuery(query);
			 // only /select support structural query.
			 if (query!=old){
				 url=solrSelectQueryUrl;
			 } 
		 } else {
			 query='content:'+query;
		 }
		 
		 $http(
		            {method: 'JSONP',
		             url: url,
		             params:{
		            	 	'q': query,
		            	    'json.wrf': 'JSON_CALLBACK',
		                    'wt':'json',
		                    'hl':true,
		                    'fq':excludeKeywords.content,
		                    'fq':excludeKeywords.title,
		                    'hl.fl':'*',
		                    'hl.simple.pre':'',
		                    'hl.simple.post':'',
		                    'hl.fragsize':500,
		                    'row':10,
		                    'start':start,
		                    'status':status
		                    }
		            })
		            .success(function(response) {
		            	userState = response.state;
		            	docs= response.response.docs;
		            	/*
		            	if ($rootScope.docs.length!=$rootScope.resultPerPage){
		            		$rootScope.nextInNavi="search";
		            	} else {
		            		$rootScope.nextInNavi="nextPage";
		            	}*/
		            	$rootScope.nextInNavi="nextPage";
		              	for (var prop in  response.highlighting) {
		            	  	for (var doc in docs){
		            		  	if (docs[doc].id==prop){
		            		  		try {
		            		  			docs[doc].highlighting=highlight(response.highlighting[prop].content[0],query);
		            		  		} catch (err){
		            		  			docs[doc].highlighting="";
		            		  		}
		            		  	}
		            	  	}
		              	}
		              	for (var i in docs) {
		      				// Convert NULL title to "No Title"
		      				if (docs[i].title==null ||docs[i].title=="") {
		      					docs[i].title="No Title";
		      				}
		      			
		      				// Unescape highlights' HTML 
		      				try{
		      					docs[i].highlighting=$sce.trustAsHtml(docs[i].highlighting.trim());
		      				} catch (err){
		      				}

		      				docs[i].plainContent=docs[i].content;
		      				docs[i].content+="&nbsp; THE END."
		      				docs[i].content=unescape(docs[i].content);
		      				docs[i].content=$sce.trustAsHtml(highlight(docs[i].content,query));
		      				docs[i].escapedUlr=docs[i].url;
		      				docs[i].url=unescape(docs[i].url);
		      				$sce.trustAsResourceUrl(docs[i].url);
		      				docs[i].upVote=null;
		      				docs[i].downVote=null;
		      			}
		              	data = {userState:userState, docs:docs, numFound:response.response.numFound};
		              	defer.resolve(data);
		            }).error(function() {
		            	defer.reject('Can not get data from Solr');
		 });
		 return defer.promise;;
	}
});

app.directive('iframeOnload', [function(){
return {
    scope: {
        callBack: '&iframeOnload'
    },
    link: function(scope, element, attrs){
        element.on('load', function(){
            return scope.callBack();
        })
    }
}}])
