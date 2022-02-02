/******************************************************************* 
* File    : JSFX_FadingTrail.js  © JavaScript-FX.com
* Created : 2001/08/29 
* Author  : Roy Whittle  (Roy@Whittle.com) www.Roy.Whittle.com 
* Purpose : A mouse trailer that fades away
* History 
* Date         Version        Description 
* 2001-08-19	1.0		First version
* 2001-12-09	1.1		Removed the need for JSFX.PlayField
***********************************************************************/ 
/*******************************************************************************/
/*** These are the simplest HEX/DEC conversion routines I could come up with ***/
/*** I have seen a lot of fade routines that seem to make this a             ***/
/*** very complex task. I am sure somene else must've had this idea          ***/
/*******************************************************************************/
var hexDigit=new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");
function dec2hex(dec)
{
	return(hexDigit[dec>>4]+hexDigit[dec&15]);
}
function hex2dec(hex)
{
	return(parseInt(hex,16))
}
/*
 * Static Class FadingTrail 
 */
JSFX.FadingTrail = function(w, startColor, endColor, type)
{
	return new JSFX.FadingTrailControler(w, startColor, endColor, type);
}
/*
 * Class FadingTrailControler extends Object
 */
JSFX.FadingTrailControler = function(w, startColor, endColor, type)
{
	if(type == null)
		type = 0;
	var i;
	var max = w;
	this.sprites=new Array();
	this.w	= w;
	this.lastX	= 0;
	this.lastY	= 0;
	this.id = "JSFX_FadingTrailControler_"+JSFX.FadingTrailControler.count++;

	for(i=0 ; i<max ; i++)
		this.sprites[this.sprites.length] = new JSFX.FadingTrailSprite(w, startColor, endColor, type);

	if(type==1)
		this.animate = this.animate2;
	else if(type==2)
		this.animate = this.animate3;
	else if(type==3)
		this.animate = this.animate3;
	else
		this.animate = this.animate1;

	window[this.id]=this;
	this.animate();
}
JSFX.FadingTrailControler.count = 0;
JSFX.FadingTrailControler.prototype.animate1 = function()
{
	setTimeout("window."+this.id+".animate1()", 40);

	var mx = JSFX.Browser.mouseX;
	var my = JSFX.Browser.mouseY;
	var i;
	if(this.lastX != mx || this.lastY != my)
	{
		this.lastX=mx;
		this.lastY=my;
		for(i=0; i<this.sprites.length ; i++)
		{
			if(this.sprites[i].i == 0)
			{
				this.sprites[i].i=Math.floor(this.sprites[i].w/2);
				this.sprites[i].moveTo(mx, my);
				this.sprites[i].setzIndex(0);
				this.sprites[i].show();
				break;
			}
		}
	}
	for(i=0; i<this.sprites.length ; i++)
		this.sprites[i].animate();
}
JSFX.FadingTrailControler.prototype.animate2 = function()
{
	setTimeout("window."+this.id+".animate2()", 40);

	var mx = JSFX.Browser.mouseX;
	var my = JSFX.Browser.mouseY;
	var i;
	for(i=0; i<this.sprites.length ; i++)
	{
		if(this.sprites[i].i == 0)
		{
			this.sprites[i].i=Math.floor(this.sprites[i].w/2);
			this.sprites[i].moveTo(mx, my);
			this.sprites[i].setzIndex(0);
			this.sprites[i].show();
			break;
		}
	}
	for(i=0; i<this.sprites.length ; i++)
		this.sprites[i].animate();
}
JSFX.FadingTrailControler.prototype.animate3 = function()
{
	setTimeout("window."+this.id+".animate3()", 40);

	var mx = Math.floor(JSFX.Browser.mouseX/this.w);
	var my = Math.floor(JSFX.Browser.mouseY/this.w);
	var i;
	if(this.lastX != mx || this.lastY != my)
	{
		this.lastX=mx;
		this.lastY=my;
		for(i=0; i<this.sprites.length ; i++)
		{
			if(this.sprites[i].i == 0)
			{
				this.sprites[i].i=this.sprites[i].s;
				this.sprites[i].moveTo(mx*this.w, my*this.w);
				this.sprites[i].show();
				break;
			}
		}
	}
	for(i=0; i<this.sprites.length ; i++)
		this.sprites[i].animate();
}
/*
 * Class FadingTrailSprite extends Layer
 */
JSFX.FadingTrailSprite = function(w, startColor, endColor, type)
{
	this.superC = JSFX.Layer;
	this.superC(" ");

	this.x 	= 0;
	this.y 	= 0;
	this.i	= 0;
	this.w	= w;
	if(type==3)
		this.s	= w;
	else
		this.s	= w/2;
	this.r1	= hex2dec(startColor.slice(0,2));
	this.g1	= hex2dec(startColor.slice(2,4));
	this.b1	= hex2dec(startColor.slice(4,6));
	this.r2	= hex2dec(endColor.slice(0,2));
	this.g2	= hex2dec(endColor.slice(2,4));
	this.b2	= hex2dec(endColor.slice(4,6));
	this.setBgColor('#' + startColor);
	this.resizeTo(this.w, this.w);
	this.moveTo(this.x, this.y);
	this.show();

	if(type==3)
		this.animate = this.animate2;
	else
	{
		this.clip(0,0,0,0);
		this.animate = this.animate1;
	}
}
JSFX.FadingTrailSprite.prototype = new JSFX.Layer;

JSFX.FadingTrailSprite.prototype.setColor = function()
{
	var i = this.s-this.i;
	var r2= Math.floor(this.r1+(i*(this.r2-this.r1))/(this.s) + .5);
	var g2= Math.floor(this.g1+(i*(this.g2-this.g1))/(this.s) + .5);
	var b2= Math.floor(this.b1+(i*(this.b2-this.b1))/(this.s) + .5);

	this.setBgColor("#" + dec2hex(r2) + dec2hex(g2) + dec2hex(b2));
}
JSFX.FadingTrailSprite.prototype.animate1 = function()
{
	if(this.i > 0)
	{
		this.i--;
		this.setColor();
		var w = (this.s)-this.i;
		this.setzIndex(w);
		this.clip(w, w, this.w-w, this.w-w);
	}
}
JSFX.FadingTrailSprite.prototype.animate2 = function()
{
	if(this.i > 0)
	{
		this.i--;
		this.setzIndex(this.i);
		this.setColor();
	}
	else
		this.hide();
}