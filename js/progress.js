(function (window){
	//写闭包的目的就是为了能够将我们内部的数据和外界进行隔绝，相互不造成污染
	
	function Progress($progressBar,$progressLine,$progressDot){
		return new Progress.prototype.init($progressBar,$progressLine,$progressDot);
	}
	Progress.prototype = {
		constructor: Progress,
		init: function($progressBar,$progressLine,$progressDot){
			this.$progressBar = $progressBar;
			this.$progressLine = $progressLine;
			this.$progressDot = $progressDot;
		},
		isMove:false,
		//进度条点击方法
		progressClick:function(callBack){
			//此时此刻的this是progress
			var $this = this;
			//监听背景的点击
			this.$progressBar.click(function(event){
				//获取背景距离窗口默认的位置
				var normalLeft = $(this).offset().left;
				//获取点击的位置记录窗口的位置
				var eventLeft = event.pageX;
				//设置$progressLine线的宽度
				$this.$progressLine.css('width',eventLeft - normalLeft);
				//设置$progressDot小球的宽度
				$this.$progressDot.css('left',eventLeft - normalLeft);
				//计算进度条的比例
				var value = (eventLeft - normalLeft) / $(this).width();
				callBack(value);
			});
		},
		//进度条移动方法
		progressMove:function(callBack){
			var $this = this;
			//获取背景距离窗口默认的位置
			var normalLeft = this.$progressBar.offset().left;
			var eventLeft;
			var barWidth = this.$progressBar.width();
			//1.监听鼠标按下事件
			this.$progressBar.mousedown(function(){
				$this.isMove = true;
				//2.监听鼠标移动事件(因为全局都可以移动)
				$(document).mousemove(function(){
					//获取点击的位置记录窗口的位置
					eventLeft = event.pageX;
					var offset = eventLeft - normalLeft;
					//判断小球是否在进度条范围
					if(offset >= 0 && offset <= barWidth){
						//设置$progressLine线的宽度
						$this.$progressLine.css('width',eventLeft - normalLeft);
						//设置$progressDot小球的宽度
						$this.$progressDot.css('left',eventLeft - normalLeft); 
					}
				});
			});
			//3.监听鼠标抬起事件
			$(document).mouseup(function(){
				$(document).off('mousemove');
				$this.isMove = false;
				//计算进度条的比例
				var value = (eventLeft - normalLeft) / $this.$progressBar.width();
				callBack(value);
			});
		},
		//进度条设置方法
		setProgress:function(value){
			if(this.isMove) return;
			if(value < 0 || value > 100) return;
			this.$progressLine.css({
				width: value + "%"
			});
			this.$progressDot.css({
				left: value + "%"
			});
		}
	}
	Progress.prototype.init.prototype = Progress.prototype;
	//传window的目的是为了能够将我们闭包当中需要给暴露外界的东西变成全局变量，暴露给外界使用。
	window.Progress = Progress;
})(window);