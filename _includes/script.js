$(document).ready(function(){

	//GQL
	function onlyUnique(value, index, self) { 
		return self.indexOf(value) === index;
	}


	function getUniqueLanguages(languages) {
		return languages.filter( onlyUnique );
	}


	function populateLanguagesSection(languages) {
		for( i = 0; i < languages.length; i++)
		{
			$('#languages-used ul').append("<li>"+languages[i]+"</li>");
		}
	}
	function populateGistsSection(gists) {
		for( i = 0; i < 3; i++)
		{
			var descriptionExcerpt = gists[i].description.substring(0,27)+'...';
			$("#public-gist-list")
				.append('<li class="list-group-item list-item-title list-item-preview" data-gist-id="'+gists[i].id+'"> ' +
					'<a href="'+gists[i].url+'">'+ 
						descriptionExcerpt +
				  		'<div class="list-item-expanded"><p>' +
							gists[i].description +
						'</p></div></a></li>');
		}
	}
	function populateUserSection(user) {
		$('#gh-info-name').append(user.name);
		$('#gh-info-location').append(user.location);
		$('#gh-info-bio').append(user.bio);
	}
	function populatePopularLanguageSection(popular) {
		$('#popular-language p').html(popular[0] + "<span class='badge badge-secondary'></span>");
		$('#popular-language p span').text(' ['+popular[1] + ' bytes written]');
	}
	function populateMostCommitsSection(repos,mostCommits){
		$('#most-commits p').html(repos[mostCommits[0]].name + "<span class='badge badge-secondary'></span>");
		$('#most-commits p span').text(' ['+repos[mostCommits[0]].commitCount+' commits] ');
	}
	function populateHeaderSection(gists,languages){
		for( i = 0; i < Object.keys(gists).length; i++)
		{
			animateCount(i,'#sub-header-gists');
		}
		for( i = 0; i < languages.length; i++)
		{
			animateCount(i,'#sub-header-languages');
		}
	}
	function cleanResponse(d,newObj){
		//Create workable repository object
		var edges = d.data.viewer.repositories.edges;
		for(var i = 0; i < edges.length; i++)
		{
			var langs = {};
			for(var j = 0; j < edges[i].node.languages.edges.length; j++)
			{
				langs[j] = {
					name: edges[i].node.languages.edges[j].node.name,
					size: edges[i].node.languages.edges[j].size
				};
			}
			newObj[i] = {
				id: edges[i].node.id,
				name: edges[i].node.name,
				languages: langs,
				commitCount: edges[i].node.defaultBranchRef.target.history.totalCount,
				description: edges[i].node.description,
				updatedAt: edges[i].node.updatedAt
			};
		}
	}

	function animateCount (index,el){
		$(el).delay(30*index).queue(function(next) {
			$(this).find('h5').text(index+1);
			next();
		});
	}

	function createLanguagesArray(repos,languages,languagesWithSize){
		//Extract languages from repos object
		for(var i = 0; i < Object.keys(repos).length; i++)
		{
			for(var j = 0; j < Object.keys(repos[i].languages).length; j++)
			{
				languages.push(repos[i].languages[j].name);
				languagesWithSize.push([repos[i].languages[j].name,repos[i].languages[j].size])
			}
		}
	}
	function getPopularLanguage(uniqueLanguages,languagesWithSize){
		var tempUniqueLanguages = [];
		for(var i = 0; i < uniqueLanguages.length; i++)
		{
			tempUniqueLanguages[i] = 0;
			for(var j = 0; j < languagesWithSize.length; j++)
			{
				if(languagesWithSize[j][0] == uniqueLanguages[i])
				{
					tempUniqueLanguages[i] = languagesWithSize[j][1] + tempUniqueLanguages[i];
				}
			}
		}
		var highestIndex = 0;
		var highestCount = tempUniqueLanguages[0];
		for(var i = 0; i < tempUniqueLanguages.length; i++)
		{
			if(tempUniqueLanguages[i] > highestCount)
			{
				highestIndex = i;
				highestCount = tempUniqueLanguages[i];
			}
		}
		return [uniqueLanguages[highestIndex],highestCount];
	}

	function processGists(data,gistsCollection) {
		var edges = data.data.viewer.gists.edges;
		for(var i = 0; i < edges.length; i++)
		{
			gistsCollection[i] = {
				id: edges[i].node.id,
				description: edges[i].node.description,
				updatedAt: edges[i].node.updatedAt,
				url: 'https://gist.github.com/jerrycoe/' + edges[i].node.name
			}
		}
	}

	function createMostCommitsArray(repos,mostCommits){
		var commitArray = [];
		function sortFunction(a, b) {
		    if (a[1] === b[1]) {
		        return 0;
		    }
		    else {
		        return (a[1] < b[1]) ? -1 : 1;
		    }
		}
		for(var i = 0; i < Object.keys(repos).length; i++)
		{
			commitArray.push([i, repos[i].commitCount]);
		}
		commitArray.sort(sortFunction).reverse();
		for(var i = 0; i < commitArray.length; i++)
		{
			mostCommits.push(commitArray[i][0]);
		}
	}
	function getRepos(callback) {
		var msg;
		$.ajax({
			method: "GET",
			url: "https://legenjerry.com",
			dataType: "jsonp"
		}).done(function(msg){
			$('.loading-spinner').hide();
			msg = JSON.parse(msg);
			callback(msg);
		});
	}
	function processRepos() {
	    getRepos(function(data) {

	    	//GQL Ajax Callback
	    	
	    	//Init Empty Objects and Arrays
			var languages = [];
			var languagesWithSize = [];
    		var reposCollection = {};
    		var gistsCollection = {};
    		var uniqueLanguages = [];
    		var mostPopularLanguage = [];
    		var mostCommits = [];
    		var userCollection = data.data.user;

    		cleanResponse(data,reposCollection);
    		processGists(data,gistsCollection);

    		createLanguagesArray(reposCollection,languages,languagesWithSize);
			uniqueLanguages = getUniqueLanguages(languages);
			populateLanguagesSection(uniqueLanguages);

			mostPopularLanguage = getPopularLanguage(uniqueLanguages,languagesWithSize);
			populatePopularLanguageSection(mostPopularLanguage);

			populateGistsSection(gistsCollection);

			createMostCommitsArray(reposCollection,mostCommits);

			populateMostCommitsSection(reposCollection,mostCommits);

			populateUserSection(userCollection);
			populateHeaderSection(gistsCollection,uniqueLanguages);

	    });
	}
	processRepos();

	//MENU
	$(document).on(
		'click', 
		'#menu-btn', 
		function(e){
			$('.menu-item-single').removeClass('closing-menu');
			$('#menu-box').show();
			$('body').addClass('body-noscroll');
			$('#menu-box').animate({
				'opacity': 1
			},{
				start: function(e){

				},
				complete: function(e){
					$('.menu-item-single').each(function(i,el){
						setTimeout(function(){
							$(el).addClass('opening-menu');
						},150*i);
					});
				}
			});
			$('body').addClass('menu-open');
		}
	);

	$(document).on(
		'click', 
		'#menu-close-btn', 
		function(e){
			$('body').removeClass('body-noscroll');
			$('.menu-item-single').removeClass('opening-menu');
			$('#menu-box').animate({
				'opacity': 0
			},{
				start: function(){
					$('.menu-item-single').addClass('closing-menu');
				},
				complete: function(){
					$('#menu-box').hide();
					$('body').removeClass('menu-open');
				}
			});
		}
	);
/*
	//STYLESHEET
	$.ajax({
		method: "GET",
		cache: true,
		url: "assets/css/style.css",
		dataType: 'text'
	})
	.done(function( msg ) {
		//console.log(msg);
	});
	
	//STATS
	//uniqueGitLanguages
	//

*/
});