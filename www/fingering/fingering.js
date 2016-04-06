
var notationToSVG, fingeringNotes;
var notes = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
var nbNotes = notes.length;
var fingeringElements = {};
var notationToSVG, notationToSVG;
var noteFingering = "A";
var octaveFingering = 3;
var indexFingering = 0;


window.onload=function(){
	(function(d){
	 var
	 ce=function(e,n){var a=document.createEvent("CustomEvent");a.initCustomEvent(n,true,true,e.target);e.target.dispatchEvent(a);a=null;return false},
	 nm=true,sp={x:0,y:0},ep={x:0,y:0},
	 touch={
  touchstart:function(e){sp={x:e.touches[0].pageX,y:e.touches[0].pageY};preventTheTouch(e);},
  touchmove:function(e){nm=false;ep={x:e.touches[0].pageX,y:e.touches[0].pageY}},
  touchend:function(e){if(nm){ce(e,'fc')}else{var x=ep.x-sp.x,xr=Math.abs(x),y=ep.y-sp.y,yr=Math.abs(y);if(Math.max(xr,yr)>20){ce(e,(xr>yr?(x<0?'swl':'swr'):(y<0?'swu':'swd')))}};nm=true},
  touchcancel:function(e){nm=false}
	 };
	 for(var a in touch){d.addEventListener(a,touch[a],false);}
	 })(document);
	//EXAMPLE OF USE
	/*
	var h=function(e){console.log(e.type,e)};
	document.body.addEventListener('fc',h,false);// 0-50ms vs 500ms with normal click
	document.body.addEventListener('swl',h,false);
	document.body.addEventListener('swr',h,false);
	document.body.addEventListener('swu',h,false);
	document.body.addEventListener('swd',h,false);
	*/
}


function preventTheTouch(e)
{
	if(fingeringElements.noteSelect[0] != e.target)
	{
		e.preventDefault();
	}
}

function initFingering(json)
{
	if(!json) return;
	notationToSVG = json.notationToSVG;
	fingeringNotes = json.notes;
	fingeringElements = {
							"container" : $("#fingeringsView"),
							"noteSelect" : $("#fingeringsView #fingeringNoteSelect"),
							"svgPaths" : $("#fingeringsView #fingeringSVG path"),
							"comments" : $("#fingeringsView .comments"),
							"indexList" : $("#fingeringsView #fingeringIndexUl")
						}
	if(!notationToSVG || !fingeringNotes || fingeringElements.noteSelect.length == 0 || fingeringElements.svgPaths.length == 0 || fingeringElements.comments.length == 0 || fingeringElements.indexList.length == 0)
	{
		return;
	}

	initFingeringGraphicals();

	initFingeringEvents();

	updateFingeringInfo();

	updateFingeringVisual();

	document.body.addEventListener("keydown", selectOnKeyDown);
	document.body.addEventListener('swl',nextFingering,false);//left
	document.body.addEventListener('swr',previousFingering,false);//right
	document.body.addEventListener('swu',nextNote,false);//up
	document.body.addEventListener('swd',previousNote,false);//down
}

function selectOnKeyDown(e)
{
	if ( !e.metaKey ) {
		e.preventDefault();
	}

	switch(e.keyCode)
	{
		case 37 : //"left arrow ",
			applyNoteChange(e,'previousFingering');
			break;
		case  39 : //"right arrow",
			applyNoteChange(e,'nextFingering');
			break;
		case  38 : //"up arrow ",
			applyNoteChange(e,'previousNote');
			break;
		case  40 : //"down arrow ",
			applyNoteChange(e,'nextNote');
			break;
	}
}

function previousFingering(e)
{
	applyNoteChange(e,'previousFingering');
}

function nextFingering(e)
{
	applyNoteChange(e,'nextFingering');
}

function previousNote(e)
{
	applyNoteChange(e,'previousNote');
}

function nextNote(e)
{
	applyNoteChange(e,'nextNote');
}


function applyNoteChange(e,msg)
{
	var octaveIncrement = 0;
	var noteIncrement = 0;
	var indexIncrement = 0;
	
	switch(msg)
	{
		case 'previousFingering': 	indexIncrement--;									break;
		case 'previousNote':		(e.shiftKey)? octaveIncrement-- : noteIncrement-- ;	break;
		case 'nextFingering':		indexIncrement++;	break;
		case 'nextNote':			(e.shiftKey)? octaveIncrement++ : noteIncrement++ ;	break;
		default:	return;
	}
	
	if(fingeringIncrementNote(octaveIncrement, noteIncrement, indexIncrement))
	{
		// stop the propagation
		e.stopPropagation();
		e.preventDefault();
	}
}


function fingeringIncrementNote(octaveIncrement, noteIncrement, indexIncrement)
{
	var o = parseInt(octaveFingering);
	var n = parseInt(notes.indexOf(noteFingering));
	if(n == -1) return false;
	var i = parseInt(indexFingering)

	n += noteIncrement;
	o += (n < 0)? -1: ((n >= 12)? +1 : 0);
	o += octaveIncrement;
	n = (n + 12) %12;

	note = notes[n]+o;
	var dataFingering = fingeringNotes[note]
	if(!dataFingering)	
	{
		return false;
	}

	if(noteIncrement != 0 || octaveIncrement != 0)
	{
		i = 0;
	}
	else
	{
		nb = dataFingering.length;
		i = (i + indexIncrement + nb) % nb;
	}


	if(!dataFingering[i])	
	{
		return false;
	}

	octaveFingering = o;
	noteFingering = notes[n];
	indexFingering = i;
	
	updateFingeringVisual();
	updateFingeringInfo();
	return true;
}

function updateFingeringVisual()
{
	updateIndexList();

	var option = $('#fingeringNoteSelect option:contains("'+(noteFingering+octaveFingering)+'")');
	if(option) option.prop('selected', true);
}

function onFingeringChangeNote()
{
	updateFingeringParams();

	updateFingeringInfo();

	updateFingeringVisual();
}


function changeOctaveFingering(direction)
{
	var octave = parseInt(octaveFingering);
	octave += direction;
	var note = noteFingering+octave;

	$('#fingeringsView #fingeringNoteSelect option:contains("'+ note +'")').prop('selected', true);

	//onFingeringChangeNote();
}

function updateFingeringParams()
{
	var optionValue = fingeringElements.noteSelect.find("option:selected").attr("value");
	var regex = /([A-G][#|b]?)([3-8])/gi;
	var match = regex.exec(optionValue);
	if(match.length != 3)
	{
		return;
	}

	//try to access to the note
	if(!fingeringNotes[match[0]] || !fingeringNotes[match[0]][0])
	{
		return;
	}


	noteFingering = match[1];
	octaveFingering = match[2];
	indexFingering = 0;
}

function updateFingeringInfo()
{
	if(!fingeringNotes[noteFingering+octaveFingering])	
	{
		return;
	}

	var fingeringData = fingeringNotes[noteFingering+octaveFingering][indexFingering];
	if(!fingeringData)
	{
		return;
	}
	
	
	//découpe la chaine deux partie , main gauche et main droite
	var split = fingeringData.fingering.split("|",2);;
	
	var fingerings = {};
	fingerings["leftHand"] = split[0];
	fingerings["rightHand"] = split[1];

	disableFingeringSVGPaths();
	fingeringElements.comments.html(fingeringData.description);

	for(var hand in notationToSVG)//left and right
	{
		var handKeys = notationToSVG[hand];
		var i = 0;
		var str = fingerings[hand];
		if(str && str.length > 0)
		{
			for(var key in handKeys)
			{
				if(i >= str.length)
				{
					break;
				}

				test = str.substr(i, key.length);
				if(test == key)
				{
					var idPath = handKeys[key];
					activeFingeringPath($("#" + idPath));
					i += key.length;
				}
			}	
		}
	}
}



function initFingeringGraphicals(json)
{
	var options = '';
	for(var note in fingeringNotes)
	{
		options +=  '<option value="'+note+'">'+ note +'</option>';
	}

	fingeringElements.noteSelect.html(options);
	fingeringElements.comments.html("");
}

function updateIndexList()
{
	var fingeringData = fingeringNotes[noteFingering+octaveFingering];
	if(!fingeringData)
	{
		return;
	}

	var nb = fingeringData.length;
	if(nb <= 1)
	{
		fingeringElements.indexList.html("");	
		return;
	}


	var list = '';
	for(i = 0; i < nb; i++)
	{

		list += '<li data-index="'+ i +'" class="'+((indexFingering == i)? 'selected': '')+'"></li>';
	}

	fingeringElements.indexList.html(list);	
}



function initFingeringEvents()
{
	fingeringElements.noteSelect.change(onFingeringChangeNote);

	$( document ).on( "click", "#fingeringsView #fingeringIndexUl li", function() {
		selectFingeringIndex($(this));
	});
}

function selectFingeringIndex(obj)
{
	if(obj.length == 0)
	{
		return;
	}

	var index = obj.attr('data-index');

	var fingeringData = fingeringNotes[noteFingering+octaveFingering][index];
	if(!fingeringData)
	{
		return;
	}

	indexFingering = index;

	updateFingeringVisual();

	updateFingeringInfo();
}


function activeFingeringPath(path)
{
	if(path.length > 0)
	{
		path.attr("class", "active");
	}
}

function disableFingeringSVGPaths()
{
	fingeringElements.svgPaths.each(function(i,e)
	{
		$(this).attr("class", "");
	});
}


function widthWindow(){
   return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
}
function heightWindow(){
   return window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
}

function resizeSaxFingering()
{
  height = heightWindow() - 100;//$(window).innerHeight() - 100;
  width = widthWindow();//$(window).innerWidth();
  
  $("#fingeringSVG").height(height);
  $("#fingeringSVGContainer").height(height);
  
  widthSax =245;
  heightSax = 493;
  ratio = height/heightSax;
  widthTransform = (width / 2 - (widthSax * ratio) / 2)/ratio;
  transform =  "scale("+ratio+") translateX("+widthTransform+"px)";
  
  $("#fingeringSVG path").css("transform", transform);
 
}

var fingeringSVGPaths;

$(document).ready(function(){
	$.getJSON('fingering/fingering.json', initFingering);
	fingeringSVGPaths = $("#fingeringsView #fingeringSVG path");

	resizeSaxFingering();

	$(window).resize(function(e){
	  resizeSaxFingering();
	});

});

