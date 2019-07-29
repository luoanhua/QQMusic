$(function(){
	
	
	//0.自定义滚动条的样式
	// $('.content_list').mCustomScrollbar();
	
	//获取播放按钮的信息
	var $audio = $('audio');
	var player = new Player($audio);
	var voiceProgress;
	var progress;
	var lyric;
	
	
	//1.加载本地歌曲列表
	getPlayerList();
	function getPlayerList(){
		$.ajax({
			url:"./source/musiclist.json",
			dateType:"json",
			success:function(date){
				//把播放的数据给player.musiclist
				player.musicList = date;
				//1.1遍历获取到的数据，创建每一条音乐
				var $musicList = $('.content_list ul');
				$.each(date,function(index,ele){
					var $item = crateMusicItem(index,ele);
					$musicList.append($item);
				});
				initMusicInfo(date[0]);
				initMusicLyric(date[0]);
			},
			error:function(e){
				console.log(e);
			}
		});
	}
	
	//2.初始化歌曲信息
	function initMusicInfo(music){
		//获取要初始化的元素
		var $musicImg = $('.song_info_pic img');
		var $musicName = $('.song_info_name a');
		var $musicSinger = $('.song_info_singer a');
		var $musicAlbum = $('.song_info_album a');
		var $musicProgressName = $('.music_progress_name');
		var $musicProgressTime = $('.music_progress_time');
		var $musicBg = $('.mask_bg');
		
		//给获取到的元素赋值
		$musicImg.attr('src',music.cover);
		$musicName.text(music.name);
		$musicSinger.text(music.singer);
		$musicAlbum.text(music.album);
		$musicProgressName.text(music.name + " / " + music.singer);
		$musicProgressTime.text("00:00 / " + music.time);
		$musicBg.css('background',"url('" + music.cover + "')");
	}
	
	//3.初始化歌词信息
	function initMusicLyric(music){
		//把歌词的地址传给它
		lyric = new Lyric(music.link_lrc);
		var $lyricContainer = $('.song_lyric');
		//清空上一首歌曲的歌词
		$lyricContainer.html("");
		lyric.loadLyric(function(){
			//创建歌词列表
			$.each(lyric.lyrics, function(index,ele){
				var $item = $('<li>'+ele+'</li>');
				$lyricContainer.append($item);
			});
		});
	}
	
	initProgress();
	//3.初始化进度条
	function initProgress(){
		//获取进度条的信息
		var $progressBar = $('.music_progress_bar');
		var $progressLine = $('.music_progress_line');
		var $progressDot = $('.music_progress_dot');
		progress = Progress($progressBar,$progressLine,$progressDot);
		progress.progressClick(function(value){
			player.musicSeekTo(value);
		});
		progress.progressMove(function(value){
			player.musicSeekTo(value);
		});
		
		//获取声音的信息
		var $voiceBar = $('.music_voice_bar');
		var $voiceLine = $('.music_voice_line');
		var $voiceDot = $('.music_voice_dot');
		voiceProgress = Progress($voiceBar,$voiceLine,$voiceDot);
		voiceProgress.progressClick(function(value){
			player.musicVoiceSeekTo(value);
		});
		voiceProgress.progressMove(function(value){
			player.musicVoiceSeekTo(value);
		});
	}
	
	//4.初始化事件监听
	initEvents();
	function initEvents(){
		
		//1.监听歌曲移入移出事件(因为是动态创建，所以要用事件委托)
		$('.content_list').delegate('.list_music','mouseenter',function(){
			//显示子菜单
			$(this).find('.list_menu').stop().fadeIn(100);
			$(this).find('.list_time>a').stop().fadeIn(100);
			//隐藏时长
			$(this).find('.list_time>span').stop().fadeOut(100);
		});
		$('.content_list').delegate('.list_music','mouseleave',function(){
			//显示时长
			$(this).find('.list_time>span').stop().fadeIn(100);
			//隐藏子菜单
			$(this).find('.list_menu').stop().fadeOut(100);
			$(this).find('.list_time>a').stop().fadeOut(100);
		});
		
		//2.监听复选框的点击事件
		$('.content_list').delegate('.list_check','click',function(){
			$(this).toggleClass('list_checked');
		});
		
		//3.添加子菜单播放按钮的监听
		var $musicPlay = $('.music_play');
		$('.content_list').delegate('.list_menu_play','click',function(){
			//拿到音乐
			var $item = $(this).parents('.list_music');
			// console.log($item.get(0).index);
			// console.log($item.get(0).music);
			
			//3.1切换子菜单播放按钮的监听
			$(this).toggleClass('list_menu_play2');
			
			//3.2复原其他的播放图标
			$item.siblings().find(".list_menu_play").removeClass("list_menu_play2");
			
			//3.3同步底部播放按钮
			if($(this).attr('class').indexOf('list_menu_play2') != -1){
				//当前子菜单的播放按钮是播放状态
				$musicPlay.addClass('music_play2');
				//让文字高亮
				$item.find('div').css("color","#fff");
				//复原其他文字的不高亮
				$item.siblings().find('div').css('color','rgba(255,255,255,0.5)');
				
			}else{
				//当前子菜单的播放按钮不是播放状态
				$musicPlay.removeClass('music_play2');
				//让文字不高亮
				$item.find('div').css("color","rgba(255,255,255,0.5)");
			}
			
			//3.4切换序号的状态
			$item.find('.list_number').toggleClass('list_number2');
			//复原其他的序号状态
			$item.siblings().find('.list_number').removeClass('list_number2');
			
			//3.5播放音乐(获取当前音乐的参数)
			player.playMusic($item.get(0).index,$item.get(0).music);
			
			//3.6切换歌曲信息
			initMusicInfo($item.get(0).music);
			
			//3.7切换歌词信息
			initMusicLyric($item.get(0).music);
		});
		
		//4.监听底部控制区域播放按钮的点击
		$musicPlay.click(function(){
			//判断有没有播放过音乐
			if(player.currentIndex == -1){
				//没有播放过，默认播放第一首
				$('.list_music').eq(0).find('.list_menu_play').trigger('click');
			}else{
				//播放过了，播放当前的
				$('.list_music').eq(player.currentIndex).find('.list_menu_play').trigger('click');
			}
		});
		
		//5.监听底部控制区域上一首按钮的点击
		$('.music_pre').click(function(){
			$('.list_music').eq(player.preIndex()).find('.list_menu_play').trigger('click');
		});
		
		//6.监听底部控制区域下一首按钮的点击
		$('.music_next').click(function(){
			$('.list_music').eq(player.nextIndex()).find('.list_menu_play').trigger('click');
		});
		
		//7.监听删除按钮的点击(因为是动态创建的，所以要用事件委托)
		$('.content_list').delegate('.list_menu_del','click',function(){
			
			//找到被点击的音乐
			var $item = $(this).parents('.list_music');
			//判断删除的音乐是否是正在播放的
			if($item.get(0).index == player.currentIndex){
				$('.music_next').trigger('click');
			}
			//删除对应的音乐
			$item.remove();
			//找到被点击的音乐的位置
			player.changeMusic($item.get(0).index);
			
			//重新排序
			$('.list_music').each(function(index,ele){
				ele.index = index;
				$(ele).find('.list_number').text(index + 1);
			})
		});
		
		//
		$('.delete').click(function(){
			var $item = $('.list_checked').parents('.list_music');
			if($item.length){
				for(var i = $item.length -1; i >= 0 ; i--){
					if($item.get(i).index == player.currentIndex){
						$('.music_next').trigger('click');
					}
					$item.get(i).remove();
					player.changeMusic($item.get(i).index);
				}
				//重新排序
				$('.list_music').each(function(index,ele){
					ele.index = index;
					$(ele).find('.list_number').text(index + 1);
				});
			}else{
				alert('请勾选删除的歌曲');
			}
			//有2个bug，$item里面的dom是倒序的，1.播放直接跳删除的数量，2.按暂停的时候出现bug
		});
		
		//8.监听播放的进度
		player.musicTimeUpdate(function(currentTime,duration,timeStr){
			//同步时间
			$('.music_progress_time').text(timeStr);
			//同步进度条
			//计算播放比例
			var value = currentTime / duration * 100;
			progress.setProgress(value);
			//实现歌词的同步
			var index = lyric.currentIndex(currentTime);
			var $item = $('.song_lyric li').eq(index);
			$item.addClass('cur');
			$item.siblings().removeClass('cur');
			
			//纯净模式的
			var $item1 = $('.lyric_only_box .song_lyric li').eq(index);
			$item1.addClass('cur');
			$item1.siblings().removeClass('cur');
			 
			//让歌词的第三行高亮
			if(index <= 2) return;
			$('.song_lyric').css({
				marginTop:((-index + 2) * 30)
			});
			
		
			 
			if(currentTime == duration){
				$('.list_music').eq(player.nextIndex()).find('.list_menu_play').trigger('click');
			}
		});
		
		//9.监听声音按钮的点击
		$('.music_voice_icon').click(function(){
			$(this).toggleClass('music_voice_icon2');
			if($(this).attr('class').indexOf('music_voice_icon2') != -1){
				//没有声音
				player.musicVoiceSeekTo(0);
			}else{
				//有声音
				player.musicVoiceSeekTo(1);
			}
		});
		
		//10.监听清空列表
		$('.clearList').click(function(){
			$('.list_music').remove();
		});
		
		//11.监听纯净模式的点击
		$('.music_only').click(function(){
			//让图标改变
			$(this).toggleClass('music_only2');
			//判断是纯净模式还是不纯净模式
			if($(this).attr('class').indexOf('music_only2') != -1){
				//纯净模式
				$('.content').addClass('content2');
				$('.play_only').css('display','block');
			}else{
				//不纯净模式
				$('.content').removeClass('content2');
				$('.play_only').css('display','none');
			}
		});
		
		//12
	    
	}
	
	
	
	//定义一条方法创建一条音乐
	function crateMusicItem(index,music){
		var $item = $("<li class=\"list_music\">\n" +
					  " <div class=\"list_check \"><i></i></div>\n" +
					  " <div class=\"list_number \">"+(index+1)+"</div>\n" +
					  " <div class=\"list_name\">"+music.name+"\n" +
					  "		<div class=\"list_menu\">\n" +
					  "			<a href=\"javascript:;\" title=\"播放\"  class=\"list_menu_play\"></a>\n" +
					  "			<a href=\"javascript:;\" title=\"添加\"></a>\n" +
					  "			<a href=\"javascript:;\" title=\"下载\"></a>\n" +
					  "			<a href=\"javascript:;\" title=\"分享\"></a>\n" +
					  "		</div>\n" +
					  "	</div>\n" +
					  "	<div class=\"list_singer\">"+music.singer+"</div>\n" +
					  "	<div class=\"list_time\">\n" +
					  "		<span>"+music.time+"</span>\n" +
					  "		<a href=\"javascript:;\" title=\"删除\" class=\"list_menu_del\"></a>\n" +
					  "	</div>\n" +
					  "</li>");
		//把每次传进来的对应的索引和音乐都绑定到原生的li上面
		$item.get(0).index = index;
		$item.get(0).music = music;
		return $item;
	}
	
	
	
	
	
	
	
	
	
	
	
	
})