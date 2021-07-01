const videoPlayer = document.querySelector('.c-video')
const video = videoPlayer.querySelector('.video')
const playButton = videoPlayer.querySelector('.play-button')
const volume = videoPlayer.querySelector('.volume')
const currentTimeElement = videoPlayer.querySelector('.current')
const durationTimeElement = videoPlayer.querySelector('.duration')
const progress = videoPlayer.querySelector('.video-progress')
const progressBar = videoPlayer.querySelector('.video-progress-filled')
const mute = videoPlayer.querySelector('.mute')
const fullscreen = videoPlayer.querySelector('.fullscreen')

//Play and Pause buttons
playButton.addEventListener('click', (e) => {
    if (video.paused) {
        video.play()
        e.target.textContent = '⏸'
    } else {
        video.pause()
        e.target.textContent = '▶'
    }
})

//Volume
volume.addEventListener('mousemove', (e) => {
    video.volume = e.target.value
})

//Current time and duration
const currentTime = () => {
    let currentMinutes = Math.floor(video.currentTime/60)
    let currentSeconds = Math.floor(video.currentTime-currentMinutes*60)
    let durationMinutes = Math.floor(video.duration/60)
    let durationSeconds = Math.floor(video.duration-durationMinutes*60)

    currentTimeElement.innerHTML = `${currentMinutes}:${currentSeconds < 10 ? '0' + currentSeconds:currentSeconds}`
    durationTimeElement.innerHTML = `${durationMinutes}:${durationSeconds}`
}

video.addEventListener('timeupdate', currentTime)

//Progress Bar
video.addEventListener('timeupdate', () => {
    const percentage = (video.currentTime / video.duration) * 100
    progressBar.style.width = `${percentage}%`
})

//Change progressbar on click
progress.addEventListener('click', (e) => {
    const progressTime = (e.offsetX / progress.offsetWidth) * video.duration
    video.currentTime = progressTime
})

//Mute button
mute.addEventListener('click', () => {
    video.muted = !video.muted;  //Checking whether true or false
    mute.classList.toggle('muted') //when clicked will add muted class, when unclicked removes it
})

//Fullscreen button
fullscreen.addEventListener('click', () => {
    video.requestFullscreen();   //Method is predifined in html
})