//控制音乐的所有方法
(function (window){
	//写闭包的目的就是为了能够将我们内部的数据和外界进行隔绝，相互不造成污染
	
	function Player($audio){
		return new Player.prototype.init($audio);
	}
	Player.prototype = {
		constructor: Player,
		//保存播放的数据
		musicList:[],
		init: function($audio){
			this.$audio = $audio;
			this.audio = $audio.get(0);
		},
		//记录当前播放歌曲的索引
		currentIndex:-1,
		//播放的方法，把索引和音乐给它，它给你存放起来
		playMusic:function(index,music){
			//判断是否是同一首音乐
			if(this.currentIndex == index){
				//判断同一首音乐是否暂停(audio属性上有paused判断是否暂停)
				if(this.audio.paused){
					//音乐播放
					this.audio.play();
				}
				else{
					//音乐暂停
					this.audio.pause();
				}
			}
			else{
				//不是同一首(把播放的音乐传给它)
				this.$audio.attr('src',music.link_url);
				this.audio.play();
				//记录播放的歌曲的索引
				this.currentIndex = index;
			}
		},
		//第一首音乐的上一首是最后一首音乐
		preIndex:function(){
			var index = this.currentIndex - 1;
			if(index < 0){
				index = this.musicList.length - 1;
			}
			return index;
		},
		//最后一首音乐的下一首是第一首音乐
		nextIndex:function(){
			var index = this.currentIndex + 1;
			if(index > this.musicList.length - 1){
				index = 0;
			}
			return index;
		},
		//删除对应的数据(前台删除，后台也要删除)
		changeMusic:function(index){
			this.musicList.splice(index,1);
			//判断删除的音乐是否是在播放的前面
			if(index < this.currentIndex){
				this.currentIndex = this.currentIndex - 1;
			}
		},
		//监听播放的进度
		musicTimeUpdate:function(callBack){
			var $this = this;
			//ontimeupdate 事件在视频/音频（audio/video）当前的播放位置发送改变时触发。
			this.$audio.on('timeupdate',function(){
				//获取音乐的总时长
				var duration = $this.audio.duration;
				//获取音乐当前的时长
				var currentTime = $this.audio.currentTime;
				var timeStr = $this.formatDate(currentTime,duration);
				callBack(currentTime,duration,timeStr);
			});
		},
		//定义一个格式化时间的方法
		formatDate:function(currentTime,duration){
			//结束的时间
			var endMin = parseInt(duration / 60);
			var endSec = parseInt(duration % 60);
			//给个位数前面加上0
			if(endMin < 10){
				endMin = '0' + endMin;
			}
			if(endSec < 10){
				endSec = '0' + endSec;
			}
			//开始的时间
			var startMin = parseInt(currentTime / 60);
			var startSec = parseInt(currentTime % 60);
			//给个位数前面加上0
			if(startMin < 10){
				startMin = '0' + startMin;
			}
			if(startSec < 10){
				startSec = '0' + startSec;
			}
			return startMin + ":" + startSec + " / " + endMin + ":" + endSec;
		},
		//进度条跳转到指定的位置
		musicSeekTo:function(value){
			if(isNaN(value)) return;
			this.audio.currentTime = this.audio.duration * value;
		},
		//设置声音
		musicVoiceSeekTo:function(value){
			if(isNaN(value)) return;
			if(value < 0 || value > 1) return;
			//0~1
			this.audio.volume = value;
		}
	}
	Player.prototype.init.prototype = Player.prototype;
	//传window的目的是为了能够将我们闭包当中需要给暴露外界的东西变成全局变量，暴露给外界使用。
	window.Player = Player;
})(window);