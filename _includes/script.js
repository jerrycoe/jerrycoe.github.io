$(document).ready(function(){

	//USER
   	$.ajax({
   		sections: [
   			'#menu-box'
   		],
   		beforeSend: function(){

   		},
		method: "GET",
		cache: true,
		url: "https://api.github.com/users/jerrycoe"
	})
	.done(function( msg ) {
		console.log(msg);
		$('#gh-info-name').append(msg.name);
		$('#gh-info-location').append(msg.location);
		$('#gh-info-bio').append(msg.bio);
	});

	//MENU
	$(document).on(
		'click', 
		'#menu-btn', 
		function(e){
			$('.menu-item-single').removeClass('closing-menu');
			$('#menu-box').show();
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

	//GISTS
   	$.ajax({
   		sections: [
   			'#public-gist-box',
   			'#sub-header-gists'
   		],
   		beforeSend: function(){
   			$.each(this.sections, function(index, el){
   				$(el).find(".loading-spinner").show();
   			});
   		},
		method: "GET",
		cache: true,
		url: "https://api.github.com/users/jerrycoe/gists"
	})
	.done(function( msg ) {
		for(var i = 0; i < msg.length; i++){
			descriptionExcerpt = msg[i].description.substring(0,27)+'...';
			if(i < 3){
				$("#public-gist-list").append('<li class="list-group-item list-item-title list-item-preview" data-gist-id="'+msg[i].id+'"><a href="'+msg[i].html_url+'">'+ descriptionExcerpt +'</a></li>')
			}else{
				$("#public-gist-list").append('<li class="list-group-item list-item-title list-item-hidden" data-gist-id="'+msg[i].id+'"><a href="'+msg[i].html_url+'">'+ descriptionExcerpt +'</a></li>')
			}
		}
		$.each(this.sections, function(index, el){
			$(el).find( ".loading-spinner" ).hide();
			$(el).addClass('content-loaded');
		});

		for( i = 0; i < msg.length; i++){
			$('#sub-header-gists').find('h5').text(i+1);
		}
		
		$(msg).each(function(index) {
			$(this).delay(100*index).queue(function(next) {
				$('#sub-header-gists').find('h5').text(index+1);
				next();
			});
		});

	});

	//LANGUAGES
	var ajaxResult = [];
	var ajaxResult2 = [];
	var highRepoCount = false;
	for ( var i = 0; i < repos.length; i++ )
	{
		if(repos.length > 10)
		{
			highRepoCount = true;
		}
	   	$.ajax({
	   		sections: [
	   			'#sub-header-languages',
	   			'#languages-used',
	   			'#popular-language'
	   		],
	   		beforeSend: function(){
				$.each(this.sections, function(index, el){
					$(el).find(".loading-spinner").show();
				});
			},
			method: "GET",
			cache: true,
			async: false,
		 	//url: "https://api.github.com/repos/jerrycoe/"+repos[i].name+"/stats/contributors",
			url: "https://api.github.com/repos/jerrycoe/"+repos[i].name+"/languages",
			repos: repos,
			index: i,
		})
		.done(function( msg ) {
			ajaxResult.push(msg);
   			$.each(this.sections, function(index, el){
				$(el).find( ".loading-spinner" ).hide();
				$(el).addClass('content-loaded');
			});
		});

	   	$.ajax({
	   		sections: [
	   			'#most-commits'
	   		],
	   		beforeSend: function(){
				$.each(this.sections, function(index, el){
					$(el).find(".loading-spinner").show();
				});
			},
			method: "GET",
			cache: true,
			async: false,
		 	url: "https://api.github.com/repos/jerrycoe/"+repos[i].name+"/stats/contributors",
			repos: repos,
			index: i,
		})
		.done(function( msg ) {
			ajaxResult2.push(msg);
   			$.each(this.sections, function(index, el){
				$(el).find( ".loading-spinner" ).hide();
				$(el).addClass('content-loaded');
			});
		});
	}
	
	var highcommit = {};

	for( var i = 0; i < ajaxResult2.length; i++)
	{
		var commitCount = 0;
		if(ajaxResult2[i][0].weeks){
			$(ajaxResult2[i][0].weeks).each(function(i,v){

				commitCount += this.c;
			});
		}

		highcommit[repos[i].name] = commitCount;
	}
	var highest = 0;
	var highset = {};
	for( var i = 0; i < repos.length; i++)
	{
		if( highcommit[repos[i].name] > highest)
		{
			old = Object.keys(highset)[0];
			highest = highcommit[repos[i].name];
			highset[repos[i].name] = highcommit[repos[i].name];
			delete highset[old];
		}
	}
	hkeys = Object.keys(highset);
	hvals = Object.values(highset);
	$('#most-commits p').html(hkeys + '<span></span>');
	$('#most-commits p span').text(' ['+hvals+']');

	var newArr = [];
	var newArr2 = {};
	for(var i = 0; i < ajaxResult.length; i++){

		var keys = Object.keys(ajaxResult[i]);
		var vals = Object.values(ajaxResult[i]);
		for(var j = 0; j < keys.length; j++)
		{
			newArr.push(keys[j]);
			newArr2[keys[j]] = 0;
		}
	}

	function onlyUnique(value, index, self) { 
	    return self.indexOf(value) === index;
	}
	var uniqueGitLanguages = newArr.filter( onlyUnique );

	animText = function(index){
		$('#sub-header-languages').delay(30*index).queue(function(next) {
			$(this).find('h5').text(index+1);
			next();
		});
	}

	$(uniqueGitLanguages).each(function(index, value) {
		$(ajaxResult).each(function(i, v) {
			if(ajaxResult[v] == uniqueGitLanguages[value])
			{
				if(ajaxResult[i][value] !== undefined)
				{
					newArr2[value] = newArr2[value]+ajaxResult[i][value];
				}
			}
		});
		$('#languages-used ul').append("<li>"+value+"</li>");
		animText(index);
	});
	high = Object.keys(newArr2).sort(function(a,b)
		{
			return newArr2[a]-newArr2[b]
		}).reverse();
	$('#popular-language p').html(high[0] + "<span class='badge badge-secondary'></span>");
	$('#popular-language p span').text(' ['+newArr2[high[0]] + ' bytes written]');


	//REPOS
	$(document).on('expandListItem','.list-group-item a', function(event){
		$(this).toggleClass('expanded');
		if($(this).hasClass('expanded')){
			$(this).find('i').removeClass('fa-sort-down').addClass('fa-sort-up');
		}else{
			$(this).find('i').removeClass('fa-sort-up').addClass('fa-sort-down');
		}
		$($(this).find('.list-item-expanded')[0]).slideToggle( 500 ,function(event){
		});
	});

	$(document).on('click', '#public-repo-list li a', function(event){
		event.preventDefault();
		$(event.target).trigger('expandListItem');
	});
	

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


});