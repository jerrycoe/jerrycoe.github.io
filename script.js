				$(document).ready(function(){

					var site = {{ site.github | jsonify }};
					
					var repos = {{ site.github.public_repositories | jsonify }};
					console.log(repos);
					var ajaxResult = [];
				   	$.ajax({
				   		section: '#public-gist-box',
				   		beforeSend: function(){
				   			$(this.section).find(".loading-spinner").show();
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
						$(this.section).find( ".loading-spinner" ).hide();
						$(this.section).addClass('content-loaded');
					});
					for ( var i = 0; i < repos.length; i++ )
					{
					   	$.ajax({

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
						});
					}
					var newArr = [];
					for(var i = 0; i < ajaxResult.length; i++){
						var keys = Object.keys(ajaxResult[i]);
						for(var j = 0; j < keys.length; j++)
						{
							newArr.push(keys[j]);
						}
					}

					function onlyUnique(value, index, self) { 
					    return self.indexOf(value) === index;
					}
					var uniqueGitLanguages = newArr.filter( onlyUnique );

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

				});