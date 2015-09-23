var solrQueryUrl = 'http://141.161.20.98:8080/solr/counterfeit/winwin';


app.controller('popupWindowController', function(pythonService, $window, $scope, $rootScope) {
	/*
    console.log($window.mySharedData);
    var msg = $window.mySharedData.queryInfo;
    pythonService.getGraphStructure(msg)
			.then(function(data){
				console.log(data);
				json =data;
				updateStructure();

		});
*/
json=initialGraphJson;
updateStructure();

});

app.controller('dialogCtrl', function($scope, $mdDialog, $rootScope) {
	$scope.alert = '';

	$scope.$on('showDialog', function(event, args) {
		$scope.showDialog(args);
	},true);

	$scope.showDialog = function(msg) {
		trackballControls.enabled = false;
		$mdDialog.show({
			controller: docDetailInDialogCtrl,
			templateUrl: 'app/view/spheres/docDetail.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose:true
		});
	};

});


app.controller('graphCtrl', function($scope, $mdDialog,$rootScope) {
	$scope.clickSphere = function (event,msg){
		$rootScope.$broadcast('showDialog', msg);
		var clickedObject=msg.clickedObject;
		var entity="";
		if (clickedObject.surroundedSphere!=undefined) {
			entity+=clickedObject.surroundedSphere.data.fatherNodeName;
		} 
		var args={};
		args.text="Hmm, you are interested in <hlt>"
		+entity
		+"</hlt>. Good, please go on."
		$rootScope.$broadcast('MinervaSpeak',args);
	}
	$scope.rightClickSphere = function (event,msg){
		$rootScope.$broadcast('rightClickSphere', msg);
	}
});


function docDetailInDialogCtrl($scope, $mdDialog) {
	$scope.hide = function() {
		trackballControls.enabled = true;
		$mdDialog.hide();
	};
};


app.controller('sphereClickedDropdownMenuCtrl', function($scope) {
	$scope.topDirections = ['left', 'up'];
	$scope.bottomDirections = ['down', 'right'];

	$scope.isOpen = false;

	$scope.availableModes = ['md-fling', 'md-scale'];
	$scope.selectedMode = 'md-fling';

	$scope.availableDirections = ['up', 'down', 'left', 'right'];
	$scope.selectedDirection = 'down';

	$scope.$on('rightClickSphere', function(event, msg) {
		$scope.latestClickedObject = msg.clickedObject;
		mousePos = msg.mousePos;
		mousePos.x-=20;
		mousePos.y-=0;
		mousePos.x+="px";
		mousePos.y+="px";
		$scope.mousePos=mousePos;
		$scope.isOpen = true;
		$scope.$apply();
	},true);

	$scope.open = function(){
		$scope.latestClickedObject.surroundedSphere.open();
	}

	$scope.close= function(){
		$scope.latestClickedObject.surroundedSphere.close();
	}

	$scope.openAll=function(){
		objectContainer.openAll();
	}

	$scope.closeAll=function(){
		objectContainer.closeAll();
	}
});


app.controller('SearchResultDocListCtrl', function(solrService,$rootScope, $scope, $mdDialog) {
	$rootScope.state="searchResult";
	$rootScope.beginning = "true";

	$rootScope.$watch('docs', function() {
		if ($rootScope.docs!=undefined && $rootScope.docs.length!=0) {
			$rootScope.$broadcast('displayNewDocOnDocDetailPanel',$rootScope.docs[0]);
		}
	});
	// Click doc content
	$scope.clickContent=function(doc){
		$rootScope.readDocEvents.push({id:doc.id,url:doc.escapedUlr, content:"", startTime:Date.now()});
		//var popupWindow = window.open('app/counterfeit/popupWindow.html');
  		//popupWindow.mySharedData = doc;
		//$rootScope.$broadcast('overlayDisplay',{title:doc.title, url:doc.url, content:doc.content});
		$rootScope.$broadcast('displayNewDocOnDocDetailPanel',doc);
		$rootScope.$broadcast('clearHoverPannels');
	};

	// Click up vote button
	$scope.clickUpVote=function(event, doc){
		$rootScope.$broadcast('interactionEmit',{title:"Vote Up", detail:"Doc ID: "+doc.id, extra_1:doc.escapedUlr});
		
		// Send to server
		solrService.sendUpVote(doc);
		
		doc.upVote="checked";
		doc.downVote=null;
		event.stopPropagation();
	};
	
	// Click down vote button
	$scope.clickDownVote=function(event, doc){
		$rootScope.$broadcast('interactionEmit',{title:"Vote Down", detail:"Doc ID: "+doc.id, extra_1:doc.escapedUlr});
		doc.downVote="checked";
		solrService.sendDownVote(doc);
		doc.upVote=null;
		event.stopPropagation();
	};
	
	// Prepare to start
	$rootScope.readDocEvents=[];
	$rootScope.docs=[];
	// When user send a new query.
	$scope.$on('sendQuery',function(event, args){
		
		$rootScope.readDocEvents=[];
		solrService.queryData(args.query, args.start, "newQuery").then(function (data){
			var subtopicPostJson={};
			subtopicPostJson.docno=new Array();
			for (var i=0; i<data.docs.length; i++){
				subtopicPostJson.docno.push(data.docs[i].id);
			}
			
			//topicService.getTopicTree(angular.toJson(subtopicPostJson));
			
			$rootScope.numFound = data.numFound;
			var transition;
			if ($rootScope.lastQueryIsRelevant==true){
				transition="Relevant. "
			} else {
				transition="Irrelevant. "
			}
			$rootScope.lastQueryIsRelevant = false;
			
			if (data.userState=="RELEVANT_EXPLOITATION"){
				transition+="Find out more";
				//changeStateLabel(0);
				//moveBallToAbove();
				//changeWords(args.query.split(" ").concat(["human","abuse","trafficking","sex","child"]));
			} else {
				transition+="Next topic";
				//changeStateLabel(1);
				//moveBallToBelow();
				//changeWords(args.query.split(" "));
			}
			$rootScope.docs = data.docs;
			//movingHistory.snapshot();
			if ($rootScope.doNotAddToUserStates==true){
				$rootScope.doNotAddToUserStates==false;
			} else {
				//$rootScope.stateHistory.push({query:args.query, transition: transition});
			}
			//rootCookie.put("stateHistory",$rootScope.stateHistory);
		});
});

	// When user send a new query.
	$scope.$on('changePage',function(event, args){
		$rootScope.readDocEvents=[];
		solrService.queryData(args.query, args.start, "oldQuery").then(function (data){
			$rootScope.docs = data.docs;
			
			var subtopicPostJson={};
			subtopicPostJson.docno=new Array();
			for (var i=0; i<data.docs.length; i++){
				subtopicPostJson.docno.push(data.docs[i].id);
			}
			//topicService.getTopicTree(angular.toJson(subtopicPostJson));
		});
	});
	
	$scope.trustHtml = function(html) {
		return $sce.trustAsHtml(html);
	}
	
	//Paging
	$rootScope.page=1;
	$rootScope.resultPerPage=10;
	
	$scope.clickPreviousPage = function(){
		if ($rootScope.page>1){
			$rootScope.page--;
			$rootScope.$broadcast('changePage',{query:$rootScope.lastQuery, start:($rootScope.page-1)*$rootScope.resultPerPage});
			$rootScope.$broadcast('interactionEmit',{title:"Change page", detail:"Query: "+$rootScope.lastQuery+", Page:"+$rootScope.page});
		}
	}
	
	$rootScope.queryMoreStart=0;
	$scope.clickNextPage = function(){
		$rootScope.cubeTestImageNumber=($rootScope.cubeTestImageNumber+1)%10;
		/*
		if ($rootScope.docs.length>=$rootScope.resultPerPage){
			$rootScope.page++;
			$rootScope.$broadcast('changePage',{query:$rootScope.lastQuery, start:($rootScope.page-1)*$rootScope.resultPerPage});
			$rootScope.$broadcast('interactionEmit',{title:"Change page", detail:"Query: "+$rootScope.lastQuery+", Page:"+$rootScope.page});
		}*/
		$rootScope.hackDoubleQuery="queryMore"+$rootScope.queryMoreStart;
		$rootScope.queryMoreStart++;
		solrService.queryMore("*", $rootScope.queryMoreStart, "oldQuery").then(function (data){
			$rootScope.docs = data.docs;
			var subtopicPostJson={};
			subtopicPostJson.docno=new Array();
			for (var i=0; i<data.docs.length; i++){
				subtopicPostJson.docno.push(data.docs[i].id);
			}
			//topicService.getTopicTree(angular.toJson(subtopicPostJson));

			//$rootScope.stateHistory.push({query:"Paw", transition: "Relevant. Find out more."});
			$rootScope.$apply();
	        //rootCookie.put("stateHistory",$rootScope.stateHistory);
	    });
	}
});

//docDetail
app.controller('SearchResultDocDetailCtrl', function(rootCookie, pythonService,$scope, $rootScope) {
	$scope.$on('displayNewDocOnDocDetailPanel',function(event, args){
		$scope.selectedText = "";
		$scope.selectedTextPosition={};

		$("#docDetailPanel").scrollTop();
		$scope.doc=args;
	});

	$scope.selectedText = "";
	$scope.selectedTextPosition={};

	$scope.droppedTextList = {};

	$scope.getSelectionText = function(event) {
		$rootScope.$broadcast('clearHoverPannels');
		$scope.selectedTextPosition.left=event.offsetX-10;
		$scope.selectedTextPosition.top=event.offsetY+20;
		snapSelectionToWord();
		var text = "";
		if (window.getSelection) {
			text = window.getSelection().toString();
		} else if (document.selection && document.selection.type != "Control") {
			text = document.selection.createRange().text;
		}	
		$scope.selectedText=text.trim();
		return text;
	};

	$scope.indicateDropPlace = function(turnOn){
		if (turnOn==true){
			$scope.dropCover=true;
			//$scope.coverBackgroundColor="red";
		} else {
			$scope.dropCover=false;
			//$scope.coverBackgroundColor="transparent";
		}
	}

	$scope.selectedText="";
	$scope.droppedTextArray=[];

	$scope.indexCounter=0;
	$scope.onDrop = function($event,$data){
		for (var i=0; i<$scope.droppedTextArray.length; i++){
			if ($scope.droppedTextArray[i].text==$data) return;	
		}
		$scope.indicateDropPlace(false);
		$scope.selectedText = "";
		var droppedText={};
		droppedText.text=$data;
		$scope.indexCounter++;
		droppedText.index=$scope.indexCounter;
		$scope.droppedTextArray.push(droppedText);
		$('#dropTextBox').animate({scrollTop:$('#dropTextBox')[0].scrollHeight}, '600');
	};

	$scope.onDropToDelete = function($event,$data){
		if ($data.index==undefined) return;
		for (var i=0; i<$scope.droppedTextArray.length; i++){
			if ($scope.droppedTextArray[i].index==$data.index) {
				$scope.droppedTextArray.splice(i,1);
				break;
			};
		}
		$('#dropTextBox').animate({scrollTop:$('#dropTextBox')[0].scrollHeight}, '600');
	};

	$scope.clickDroppedText=function(text){
		pythonService.queryData(text).then(function (data){
			$rootScope.docs = data.docs;
			var subtopicPostJson={};
			subtopicPostJson.docno=new Array();
			for (var i=0; i<data.docs.length; i++){
				subtopicPostJson.docno.push(data.docs[i].id);
			}
			topicService.getTopicTree(angular.toJson(subtopicPostJson));

			$rootScope.stateHistory.push({query:text, transition: "Relevant. Find out more."});
	        //$rootScope.$apply();
	        rootCookie.put("stateHistory",$rootScope.stateHistory);
	    });
	}

	$scope.typeList=["Link", "Address", "Part #", "Email", "Telephone", "Manufacturer", "Device Type", "Name", "Employee", "QQ", "Website"];
	$scope.menuPosition={};
	$scope.rightClickDroppedText=function(droppedText,$event){
		$event.stopPropagation();
		$scope.clearPanels();

		$scope.menuPosition.left=$event.clientX-45;
		$scope.menuPosition.top=$event.clientY-10;
		droppedText.showMenu=true;
		
	}
	$scope.clickMenu=function(droppedText,choice, $event){
		$scope.clearPanels();
		if (choice=="tag") {
			droppedText.showTypeSelectPanel=true;
		} else if (choice=="find more this type"){
			$scope.getMoreSpecificTypeOfTags($scope.doc.plainContent,droppedText.type);
		}else if (choice=="find more"){
			$scope.getMoreTags($scope.doc.plainContent);
    		//$scope.clickDroppedText(droppedText.text);
    	}
    	$event.stopPropagation();
    }

    $scope.clickType=function(droppedText,type, $event){
    	$scope.clearPanels();
    	$scope.lastClickedDroppedText=droppedText;
    	var evidenceCollection="";
    	evidenceCollection = droppedText.text;
    	/*
    	for (var i=0; i<$scope.droppedTextArray.length; i++){
    		evidenceCollection+=$scope.droppedTextArray[i].text+" ,";
    	}*/
    	if (type=="Link"){
    		$scope.getPossiblePairs(evidenceCollection);
    	} else {
    		droppedText.type=type;
    	}

    	$event.stopPropagation();
    }

    $scope.getMoreTags = function (text){
    	pythonService.getMoreTags(text)
    	.then(function(data){
    		for (var i=0; i<data.length; i++){
    			var isNewText=true;
    			for (var j=0; j<$scope.droppedTextArray.length; j++){
    				if ($scope.droppedTextArray[j].text==data[i].value) {
    					isNewText=false;
    					break;	
    				}
    			}
    			if (isNewText==false) continue;
    			var droppedText = {};
    			droppedText.text=data[i].value;
    			droppedText.value=data[i].value;
    			droppedText.key=data[i].key;
    			droppedText.field=data[i].field;
    			if (data[i].key!=undefined){
    				droppedText.type=data[i].key;
    			}
    			droppedText.backgroundColor="#AEB645";
    			$scope.indexCounter++;
    			droppedText.index=$scope.indexCounter;
    			$scope.droppedTextArray.push(droppedText);
    		}
    	});
    }

    $scope.getMoreSpecificTypeOfTags = function (text,type){
    	pythonService.getMoreSpecificTypeOfTags({text:text,type:type})
    	.then(function(data){
    		for (var i=0; i<data.length; i++){
    			var isNewText=true;
    			for (var j=0; j<$scope.droppedTextArray.length; j++){
    				if ($scope.droppedTextArray[j].text==data[i].value) {
    					isNewText=false;
    					break;	
    				}
    			}
    			if (isNewText==false) continue;
    			var droppedText = {};
    			droppedText.text=data[i].value;
    			droppedText.value=data[i].value;
    			droppedText.key=data[i].key;
    			droppedText.field=data[i].field;
    			if (data[i].key!=undefined){
    				droppedText.type=data[i].key;
    			}
    			droppedText.backgroundColor="#AEB645";
    			$scope.indexCounter++;
    			droppedText.index=$scope.indexCounter;
    			$scope.droppedTextArray.push(droppedText);
    		}
    	});
    }

    $scope.$on('clickShowGraph',function(event, args){
    	var popupWindow = window.open('graph/index.html');
    	var sharedData={};
    	sharedData.queryInfo=[];
    	var userTagList=[];
    	var docTagList=[];
    	for (var i=0; i<$scope.droppedTextArray.length; i++){
    		if ($scope.droppedTextArray[i].field==undefined) {
    			userTagList.push($scope.droppedTextArray[i].text
    				+"("+$scope.droppedTextArray[i].type+")");
    		} else {
    			docTagList.push($scope.droppedTextArray[i]);
    		}
    	}
    	sharedData.queryInfo.push(userTagList);
    	sharedData.queryInfo.push(docTagList);
    	popupWindow.mySharedData = sharedData;
		/*
		pythonService.getGraphStructure()
			.then(function(data){
				var popupWindow = window.open('graph/index.html');
  				popupWindow.mySharedData = data;

		});
    */
});

    $scope.showPossiblePairsPanel=false;
    $scope.possiblePairArray=[];
    $scope.getPossiblePairs = function (text){
    	$scope.isLoading=true;
    	$scope.showPossiblePairsPanel=true;
    	pythonService.getPossiblePairs(text)
    	.then(function(data){
    		$scope.isLoading=false;
    		$scope.possiblePairArray=data;
    	});
    }
    $scope.clickPair = function(pair){
    	$scope.lastClickedDroppedText.type="Link: "+pair[0]+" & "+pair[1];
    	$scope.showPossiblePairsPanel=false;
    }

    $scope.clickDropTextBox = function(){
    	$scope.clearPanels();
    }

    $scope.$on('clearHoverPannels',function(event, args){
    	console.log("??");
    	$scope.clearPanels();
    });


    $scope.clearPanels = function (){
    	for (var i=0; i<$scope.droppedTextArray.length; i++){
    		$scope.droppedTextArray[i].showTypeSelectPanel=false;
    		$scope.droppedTextArray[i].showMenu=false;
    	}
    	$scope.showPossiblePairsPanel=false;
    }
});

dropText = function(event, ui) {
};

app.controller('ToolboxCtrl', function(pythonService, $mdDialog, rootCookie, $rootScope, $cookies, $scope, $sce, solrService) {
	$scope.batchQueryFileChosen = function(){
		var fd = new FormData();
		fd.append("batchQuery", $('#batchQueryFile').prop('files')[0]);


		$.ajax({
			url: parseBatchQueryUrl,
			type: "POST",
			data: fd,
			processData: false,
			contentType: false,
			success: function(response) {
				var batchQueries=angular.fromJson(response);
				for (var i=0; i<batchQueries.length; i++) {
	        	//$rootScope.stateHistory.push({query:batchQueries[i], transition: "Relevant. Find out more."});
	        }
	        $rootScope.$apply();
	        //rootCookie.put("stateHistory",$rootScope.stateHistory);
	    }
	});
	}

	$scope.show3DEntity = function() {
		$mdDialog.show({
			controller: entitiesStructureCtrl,
			templateUrl: 'app/view/spheres/entitiesStructureDialog.html',
			parent: angular.element(document.body),
			targetEvent: event,
			clickOutsideToClose:true
		});
	};

	$scope.searchboxMenu = {
		topDirections: ['left', 'up'],
		bottomDirections: ['down', 'right'],
		isOpen: false,
		availableModes: ['md-fling', 'md-scale'],
		selectedMode: 'md-fling',
		availableDirections: ['up', 'down', 'left', 'right'],
		selectedDirection: 'down'
	};
	
	$rootScope.numFound=0;
	$rootScope.queryPhone={};
	$rootScope.queryPhone.country="01";
	
	$rootScope.queryEmail={};
	
	$rootScope.queryAddress={};
	
	$rootScope.queryAdvanced={};
	
	$rootScope.queryMode="regular";
	
	$scope.$on("outterControllerClickSubmit",function(){
		$scope.clickSubmit();
	},true);

	$scope.clickSubmit=function(){
		$rootScope.nextInNavi="nextPage";
		if ($rootScope.queryMode=="phone"){
			$rootScope.query="";
			if ($rootScope.queryPhone.country!="01"){
				$rootScope.query+=$rootScope.queryPhone.country+" ";
			}
			$rootScope.query+=checkString($rootScope.queryPhone.area)+" ";
			$rootScope.query+=checkString($rootScope.queryPhone.prefix)+" ";
			$rootScope.query+=checkString($rootScope.queryPhone.line);
		} else if ($rootScope.queryMode=="email"){
			$rootScope.query="";
			$rootScope.query+=checkString($rootScope.queryEmail.part1)+" ";
			$rootScope.query+=checkString($rootScope.queryEmail.part2)+" ";
			$rootScope.query+=checkString($rootScope.queryEmail.part1)+"@"+checkString($rootScope.queryEmail.part2);
		} else if ($rootScope.queryMode=="address"){
			$rootScope.query="";
			$rootScope.query+=checkString($rootScope.queryAddress.part1)+" ";
			$rootScope.query+=checkString($rootScope.queryAddress.part2)+" ";
			$rootScope.query+=checkString($rootScope.queryAddress.part3)+" ";
			$rootScope.query+=checkString($rootScope.queryAddress.part4);
		} else if ($rootScope.queryMode=="structural"){
			$rootScope.query=$rootScope.queryStructural;
		} else if ($rootScope.queryMode=="regular"){
			$rootScope.query=$rootScope.queryRegular;
		}
		$rootScope.query=$rootScope.query.trim().replace(/\s\s+/g, ' ');
		$rootScope.lastQuery=$rootScope.query;
		//rootCookie.put("lastQuery",$rootScope.lastQuery);
		$rootScope.page = 1;
		$rootScope.$broadcast('sendQuery',{query:$rootScope.query, start:($rootScope.page-1)*$rootScope.resultPerPage});
		$rootScope.$broadcast('interactionEmit',{title:"Send query", detail:"Query: "+$rootScope.query});
		
		var args={};
		args.text=$rootScope.queryRegular;
		$rootScope.$broadcast('UserSpeak',args);

		var args={};
		args.type="screenshot";
		args.text="You searched <hlt>"+$rootScope.queryRegular+"</hlt>, and this is the screenshot."
		$rootScope.$broadcast('MinervaSpeak',args);
	};
	
	$scope.clearHistory=function(){
		$rootScope.numFound=0;
		$rootScope.queryEmail={};
		$rootScope.queryAddress={};
		$rootScope.queryAdvanced={};
		$rootScope.queryStructural={};
		$rootScope.query="";
		//rootCookie.put("lastQuery","");
		solrService.clearHistory();
		//$rootScope.stateHistory=[];
		//rootCookie.put("stateHistory",$rootScope.stateHistory);
		$rootScope.readDocEvents=[]
		$rootScope.docs=[];
		$rootScope.$broadcast('interactionEmit',{title:"Clear history", detail:""});
	}
	
	$scope.lastGraphGraph = {};

	$scope.clickShowGraph = function(){
		$rootScope.$broadcast('clickShowGraph',{title:"Clear history", detail:""});
	}

	$scope.$watch('state', function() {
		if ($rootScope.state=="graph"){
			var args={};
			args.text="Show me the 3D entities in the document.";
			$rootScope.$broadcast('UserSpeak',args);

			var args={};
			args.type="3d-graph-screenshot";
			args.text="OK. I am drawing the graph. The screenshot is below."
			$rootScope.$broadcast('MinervaSpeak',args);
		} else if ($rootScope.state=="searchResult" && $rootScope.beginning=="false"){
			var args={};
			args.text="Show me the search results.";
			$rootScope.$broadcast('UserSpeak',args);

			var args={};
			args.type="screenshot";
			args.text="Sure. I am retrieving the search results. The screenshot is below.";
			$rootScope.$broadcast('MinervaSpeak',args);
		}
		$rootScope.beginning="false";
	});
});

function entitiesStructureCtrl($scope, $mdDialog) {
	$scope.hide = function() {
		$mdDialog.hide();
	};
};

//Highlight all the keywords in target string.
var highlight_colors = [ "#D35400","#F22613","#DB0A5B", "#1F3A93","#96281B","#D2527F","#674172"];
function highlight(target, keyword){
	if (target==undefined){
		return "";
	}
	keyword=keyword.replace(/\W/g, ' ');
	keyword=keyword.trim().replace(/\s\s+/g, ' ');
	if (target instanceof Array){
		target=target[0];
	}
	var keywords=keyword.split(" ");
	for (var i = 0; i < keywords.length; i++) {
		keyword=keywords[i];
		if (keyword.toUpperCase()=="AND" 
			|| keyword.toUpperCase()=="OR"
			|| keyword.toUpperCase()=="NOT") {
			continue;
	}
	reg = new RegExp(keyword, 'gi');
	target = target.replace(reg, '<span class="highlight" style="background-color:'+highlight_colors[i%highlight_colors.length]+'">'+keyword+'</span>');
}

return target;
}

function snapSelectionToWord() {
    var sel;

    // Check for existence of window.getSelection() and that it has a
    // modify() method. IE 9 has both selection APIs but no modify() method.
    if (window.getSelection && (sel = window.getSelection()).modify) {
        sel = window.getSelection();
        if (!sel.isCollapsed) {

            // Detect if selection is backwards
            var range = document.createRange();
            range.setStart(sel.anchorNode, sel.anchorOffset);
            range.setEnd(sel.focusNode, sel.focusOffset);
            var backwards = range.collapsed;
            range.detach();

            // modify() works on the focus of the selection
            var endNode = sel.focusNode, endOffset = sel.focusOffset;
            sel.collapse(sel.anchorNode, sel.anchorOffset);
            
            var direction = [];
            if (backwards) {
                direction = ['backward', 'forward'];
            } else {
                direction = ['forward', 'backward'];
            }

            sel.modify("move", direction[0], "character");
            sel.modify("move", direction[1], "word");
            sel.extend(endNode, endOffset);
            sel.modify("extend", direction[1], "character");
            sel.modify("extend", direction[0], "word");
        }
    } else if ( (sel = document.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        if (textRange.text) {
            textRange.expand("word");
            // Move the end back to not include the word's trailing space(s),
            // if necessary
            while (/\s$/.test(textRange.text)) {
                textRange.moveEnd("character", -1);
            }
            textRange.select();
        }
    }
}


app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
});
