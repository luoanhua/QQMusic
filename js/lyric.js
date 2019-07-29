//音乐歌词的所有方法
(function (window){
	//写闭包的目的就是为了能够将我们内部的数据和外界进行隔绝，相互不造成污染
	
	function Lyric(path){
		return new Lyric.prototype.init(path);
	}
	Lyric.prototype = {
		constructor: Lyric,
		init: function(path){
			this.path = path;
		},
		//把时间保存
		times:[],
		//把歌词保存
		lyrics:[],
		//索引
		index:-1,
		//加载本地的歌曲
		loadLyric:function(callBack){
			var $this = this;
			$.ajax({
				url:$this.path,
				dateType:"text",
				success:function(date){
					// console.log(date);
					$this.parseLyric(date);
					callBack();
				},
				error:function(e){
					console.log(e);
				}
			});
		},
		//解析歌词
		parseLyric:function(date){
			var $this = this;
			//一定要清空上一首歌曲的歌词和时间
			$this.times = [];
			$this.lyrics = [];
			//把歌词分成一行一行的
			var array = date.split('\n');
			// console.log(array);
			//[00:00.92]
			var timeReg = /\[(\d*:\d*\.\d*)\]/;
			//遍历取出每一条歌词
			$.each(array, function(index, ele){
				//找出歌词
				var lrc = ele.split(']')[1];
				//排除空字符串(没有歌词)
				if(lrc.length == 1) return true;
				$this.lyrics.push(lrc);
				
				//找出时间
				// console.log(ele);
				var res = timeReg.exec(ele);
				// console.log(res);
				if(res == null) return true;
				var timeStr = res[1]; //00:00.92
				//把时间转换成秒
				var res2 = timeStr.split(':');
				var min = parseInt(res2[0]) * 60;
				var sec = parseFloat(res2[1]);
				//把时间保留2位小数
				var time = parseFloat(Number(min + sec).toFixed(2));
				$this.times.push(time);
			});
			// console.log($this.times,$this.lyrics);
		},
		//找到时间对应的歌词索引
		currentIndex:function(currentTime){
			// console.log(currentTime);
			if(currentTime >= this.times[0]){
				this.index++;
				this.times.shift();//删除数组最前面的一个元素
			}
			return this.index;
		}
	}
	Lyric.prototype.init.prototype = Lyric.prototype;
	//传window的目的是为了能够将我们闭包当中需要给暴露外界的东西变成全局变量，暴露给外界使用。
	window.Lyric = Lyric;
})(window);