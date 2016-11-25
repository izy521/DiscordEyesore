(function(global, document) {

global.SpeakerElement = SpeakerElement;

function avatarURL(userID, hash) {
    return 'https://cdn.discordapp.com/avatars/' + userID + '/' + hash + '.jpg'
}

function SpeakerElement(user) {
    var avatar = avatarURL(user.id, user.avatar);

    var speaker = document.createElement('div');
        speaker.classList.add('speaker');
        this.id = speaker.id = user.id;
        speaker.style.backgroundImage = 'url(' + avatar + ')';

    var speakerCover = document.createElement('div');
        speakerCover.classList.add('speaker-cover');
    var speakerData = document.createElement('div');
        speakerData.classList.add('speaker-data');

    var speakerImage = document.createElement('div');
        speakerImage.classList.add('speaker-image');
        speakerImage.style.backgroundImage = 'url(' + avatar + ')';
    var speakerName = document.createElement('div');
        speakerName.classList.add('speaker-name');
        speakerName.textContent = user.username;
    var speakerCanvas = this.canvas = document.createElement('canvas');
        speakerCanvas.classList.add('speaker-canvas');

    document.body.appendChild(speaker);
    speaker.appendChild(speakerCover);
    speaker.appendChild(speakerData);
    speakerData.appendChild(speakerImage);
    speakerData.appendChild(speakerName);
    speakerData.appendChild(speakerCanvas);
}

})(window, document);