var createSongRow = function(songNumber, songName, songLength) {
    var template =
       '<tr class="album-view-song-item">'
	 + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
     + '  <td class="song-item-title">' + songName + '</td>'
     + '  <td class="song-item-duration">' + songLength + '</td>'
     + '</tr>'
     ;

	var $row = $(template);	

	var clickHandler = function() {
		var songNumber = parseInt($(this).attr('data-song-number'));

		if (currentlyPlayingSongNumber !== null) {
			// Revert song number to currently playing song because user started playing new song.
			var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
			currentlyPlayingCell.html(currentlyPlayingSongNumber);
		}
		if (currentlyPlayingSongNumber !== songNumber) {
			// Switch from Play -> Pause button to indicate new song is playing.
			$(this).html(pauseButtonTemplate);
			setSong(songNumber);
			currentSoundFile.play();
			updatePlayerBarSong();
			updateSeekBarWhileSongPlays();
		} else if (currentlyPlayingSongNumber === songNumber) {
			// If paused, start playing the song again and revert the icon 
			// in the song row and the player bar to the pause button.
			if (currentSoundFile.isPaused()) {
				$(this).html(pauseButtonTemplate);
            	$('.main-controls .play-pause').html(playerBarPauseButton);
				currentSoundFile.play();
				updateSeekBarWhileSongPlays();
			// If it isn't paused,pause it and set the content of the song number cell 
			// and player bar's pause button back to the play button.
			} else {
				$(this).html(playButtonTemplate);
				$('.main-controls .play-pause').html(playerBarPlayButton);
				currentSoundFile.pause();
			}
		}
	};	
	
	var onHover = function(event) {
		
		var songNumberCell = $(this).find('.song-item-number');
		var songNumber = parseInt(songNumberCell.attr('data-song-number'));
		
		if (songNumber !== currentlyPlayingSongNumber) {
			songNumberCell.html(playButtonTemplate);
		}
	};
		
	var offHover = function(event) {
		
		var songNumberCell = $(this).find('.song-item-number');
		var songNumber = parseInt(songNumberCell.attr('data-song-number'));
		
		if (songNumber !== currentlyPlayingSongNumber) {
			songNumberCell.html(songNumber);
		}		
	};
	
	$row.find('.song-item-number').click(clickHandler);
	$row.hover(onHover, offHover);
	return $row;
};

var setCurrentAlbum = function(album) {

	currentAlbum = album;	
	var $albumTitle = $('.album-view-title');
	var $albumArtist = $('.album-view-artist');
	var $albumReleaseInfo = $('.album-view-release-info');
	var $albumImage = $('.album-cover-art');
	var $albumSongList = $('.album-view-song-list');

	$albumTitle.text(album.title);
	$albumArtist.text(album.artist);
	$albumReleaseInfo.text(album.year + ' ' + album.label);
	$albumImage.attr('src', album.albumArtUrl);
	
	$albumSongList.empty();

    for (var i = 0; i < album.songs.length; i++) {
		var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
		$albumSongList.append($newRow);
    }
};

var trackIndex = function(album, song) {
	return album.songs.indexOf(song);
};

var nextSong = function() {
    
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _incrementing_ the song here
    currentSongIndex++;

    
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    
    // Set a new current song
	setSong(currentSongIndex + 1);
	currentSoundFile.play();
	updatePlayerBarSong();
	updateSeekBarWhileSongPlays();
	
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    
	var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var previousSong = function() {
    
    // Note the difference between this implementation and the one in
    // nextSong()
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    // Set a new current song
	setSong(currentSongIndex + 1);
	currentSoundFile.play();
	updatePlayerBarSong();
	updateSeekBarWhileSongPlays();
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var updatePlayerBarSong = function() {

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
	$('.main-controls .play-pause').html(playerBarPauseButton);

};

var setSong = function(songNumber) {
	if (currentSoundFile) {
		currentSoundFile.stop();
	}
	currentlyPlayingSongNumber = parseInt(songNumber);
	currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
	currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
		formats: [ 'mp3' ],
		preload: true
	});
	setVolume(currentVolume);
	$('.seek-bar .fill').width(currentVolume + '%');
	$('.seek-bar .thumb').css({left: currentVolume + '%'});
};

var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume) {
	if (currentSoundFile) {
		currentSoundFile.setVolume(volume);
	}
};

var getSongNumberCell = function(number) {
	return $('.song-item-number[data-song-number="' + number + '"]');
};

var updateSeekBarWhileSongPlays = function() {
 	if (currentSoundFile) {
	 	currentSoundFile.bind('timeupdate', function(event) {
			
			var seekBarFillRatio = this.getTime() / this.getDuration();
			var $seekBar = $('.seek-control .seek-bar');

			updateSeekPercentage($seekBar, seekBarFillRatio);
		});
 	}
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;

	offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
 
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
 };

var setupSeekBars = function() {
 	var $seekBars = $('.player-bar .seek-bar');

 	$seekBars.click(function(event) {
		var offsetX = event.pageX - $(this).offset().left;
		var barWidth = $(this).width(); // width of the $seekBars
		// we divide offsetX by the width of the entire bar 
		// to calculate  seekBarFillRatio
		var seekBarFillRatio = offsetX / barWidth;

		if ($(this).parents()[1].className === 'control-group currently-playing') {
			seek(seekBarFillRatio * (currentSoundFile.getDuration()));
		} else if ($(this).parent()[0].className === 'control-group volume') {
			setVolume(seekBarFillRatio * 100);
		}
		
		updateSeekPercentage($(this), seekBarFillRatio);

	});
	
	$seekBars.find('.thumb').mousedown(function(event) {
		var $seekBar = $(this).parent();

		$(document).bind('mousemove.thumb', function(event){
			var offsetX = event.pageX - $seekBar.offset().left;
			var barWidth = $seekBar.width();
			var seekBarFillRatio = offsetX / barWidth;
			
			// Only update $seekBar, not $seekBars, so only the clicked bar is updated
           if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());   
            } else {
                setVolume(seekBarFillRatio);
            }
			
			updateSeekPercentage($seekBar, seekBarFillRatio);

		});

		// attached the mousemove event to $(document) to make sure
		// that we can drag the thumb after mousing down, even when the
		// mouse leaves the seek bar. thumb is use to make sure it unbinds the right event
		$(document).bind('mouseup.thumb', function() {
			$(document).unbind('mousemove.thumb');
			$(document).unbind('mouseup.thumb');
		});		
	}); 
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');


$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
	setupSeekBars();
	$previousButton.click(previousSong);
    $nextButton.click(nextSong);
});