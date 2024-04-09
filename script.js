let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid Input";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    // load the songs
    let a = await fetch(`/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    // show all the songs in the playlist
    let songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img src="./assets/music.svg" alt="Music" class="music">
        <div class="info">
            <div> ${song.replaceAll("%20", " ")} </div>
            <div class="BySpotify">By Spotify</div>
        </div>
        <div class="playnow">
        <span>Play Now</span>
            <img src="./assets/play.svg" alt="Play Now">
        </div>
    </li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "./assets/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// display albums
async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".allcards");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <svg class="playbutton" xmlns="http://www.w3.org/2000/svg" width="100" height="100"
                viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="#00e600" />
                <polygon points="35,25 35,75 75,50" fill="#000000" />
            </svg>
            <img src="/songs/${folder}/cover.jpg" alt="cover">
            <div>
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>
        </div>`;
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log("Fetching Songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);

        });
    });
}

async function main() {
    // get the songs list
    await getSongs("songs/Aashiqui-2");
    playMusic(songs[0], true);

    await displayAlbums();

    // attach an event listener to play
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./assets/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "./assets/play.svg";
        }
    });

    // listen for time update
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add an event listener for close
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-140%";
    });

    // add an event listener to previous and next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= length) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) > length) {
            playMusic(songs[index + 1]);
        }
    });

    // add event listener to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });

    // add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }

    })
}
main();


// // Define global variables
// let currentSong = new Audio(); // Create a new HTML Audio element
// let songs; // Variable to store the list of songs
// let currFolder; // Variable to store the current folder

// // Function to convert seconds to minutes and seconds format
// function secondsToMinutesSeconds(seconds) {
//     // Check if input is valid
//     if (isNaN(seconds) || seconds < 0) {
//         return "Invalid Input";
//     }
//     // Calculate minutes and remaining seconds
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);

//     // Format minutes and seconds with leading zeros if necessary
//     const formattedMinutes = String(minutes).padStart(2, "0");
//     const formattedSeconds = String(remainingSeconds).padStart(2, "0");

//     // Return formatted time string
//     return `${formattedMinutes}:${formattedSeconds}`;
// }

// // Function to fetch songs from a folder
// async function getSongs(folder) {
//     // Set the current folder
//     currFolder = folder;
//     // Fetch the content of the folder
//     let response = await fetch(`/${folder}/`);
//     let text = await response.text();

//     // Create a temporary div to parse the HTML response
//     let div = document.createElement("div");
//     div.innerHTML = text;

//     // Get all anchor tags from the parsed HTML
//     let as = div.getElementsByTagName("a");
//     songs = [];
//     // Iterate through anchor tags to find mp3 files and add them to songs array
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index];
//         if (element.href.endsWith(".mp3")) {
//             songs.push(element.href.split(`/${folder}/`)[1]);
//         }
//     }

//     // Display the songs in the playlist
//     let songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0];
//     songUL.innerHTML = "";
//     for (const song of songs) {
//         // Create list item for each song
//         songUL.innerHTML = songUL.innerHTML + `<li>
//             <img src="./assets/music.svg" alt="Music" class="music">
//             <div class="info">
//                 <div> ${song.replaceAll("%20", " ")} </div>
//                 <div class="BySpotify">By Spotify</div>
//             </div>
//             <div class="playnow">
//                 <span>Play Now</span>
//                 <img src="./assets/play.svg" alt="Play Now">
//             </div>
//         </li>`;
//     }

//     // Attach event listener to each song for playing
//     Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
//         e.addEventListener("click", element => {
//             playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
//         });
//     });

//     return songs;
// }

// // Function to play a music track
// const playMusic = (track, pause = false) => {
//     // Set source of the audio element to the selected track
//     currentSong.src = `/${currFolder}/` + track;
//     // Play the track if not paused
//     if (!pause) {
//         currentSong.play();
//         play.src = "./assets/pause.svg";
//     }
//     // Display the track information
//     document.querySelector(".songinfo").innerHTML = decodeURI(track);
//     document.querySelector(".songtime").innerHTML = "00:00 / 00:00"; // Initialize song time
// }

// // Function to display albums
// async function displayAlbums() {
//     // Fetch album information
//     let response = await fetch(`/songs/`);
//     let text = await response.text();

//     // Parse the HTML response
//     let div = document.createElement("div");
//     div.innerHTML = text;

//     // Get all anchor tags from parsed HTML
//     let anchors = div.getElementsByTagName("a");
//     let cardContainer = document.querySelector(".allcards");
//     let array = Array.from(anchors);

//     // Iterate through anchor tags to find albums and display them
//     for (let index = 0; index < array.length; index++) {
//         const e = array[index];
//         if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
//             // Extract folder name
//             let folder = e.href.split("/").slice(-2)[0];

//             // Fetch metadata of the folder
//             let response = await fetch(`/songs/${folder}/info.json`);
//             let metadata = await response.json();

//             // Display album information
//             cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
//                 <svg class="playbutton" xmlns="http://www.w3.org/2000/svg" width="100" height="100"
//                     viewBox="0 0 100 100">
//                     <circle cx="50" cy="50" r="45" fill="#00e600" />
//                     <polygon points="35,25 35,75 75,50" fill="#000000" />
//                 </svg>
//                 <img src="/songs/${folder}/cover.jpg" alt="cover">
//                 <div>
//                     <h2>${metadata.title}</h2>
//                     <p>${metadata.description}</p>
//                 </div>
//             </div>`;
//         }
//     }

//     // Load playlist when a card is clicked
//     Array.from(document.getElementsByClassName("card")).forEach(e => {
//         e.addEventListener("click", async item => {
//             songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
//             playMusic(songs[0]);
//         });
//     });
// }

// // Main function
// async function main() {
//     // Get songs list and play the first song
//     await getSongs("songs/Aashiqui-2");
//     playMusic(songs[0], true);

//     // Display albums
//     await displayAlbums();

//     // Event listener for play/pause button
//     play.addEventListener("click", () => {
//         if (currentSong.paused) {
//             currentSong.play();
//             play.src = "./assets/pause.svg";
//         } else {
//             currentSong.pause();
//             play.src = "./assets/play.svg";
//         }
//     });

//     // Event listener for time update
//     currentSong.addEventListener("timeupdate", () => {
//         document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
//         document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
//     });

//     // Event listener for seekbar
//     document.querySelector(".seekbar").addEventListener("click", e => {
//         let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
//         document.querySelector(".circle").style.left = percent + "%";
//         currentSong.currentTime = ((currentSong.duration) * percent) / 100;
//     });

//     // Event listener for hamburger menu
//     document.querySelector(".hamburger").addEventListener("click", () => {
//         document.querySelector(".left").style.left = "0";
//     });

//     // Event listener for closing menu
//     document.querySelector(".cross").addEventListener("click", () => {
//         document.querySelector(".left").style.left = "-140%";
//     });

//     // Event listener for previous and next buttons
//     previous.addEventListener("click", () => {
//         let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
//         if ((index - 1) >= length) {
//             playMusic(songs[index - 1]);
//         }
//     });

//     next.addEventListener("click", () => {
//         let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
//         if ((index + 1) > length) {
//             playMusic(songs[index + 1]);
//         }
//     });

//     // Event listener for volume control
//     document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
//         currentSong.volume = parseInt(e.target.value) / 100;
//         if (currentSong.volume > 0) {
//             document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
//         }
//     });

//     // Event listener for mute/unmute
//     document.querySelector(".volume>img").addEventListener("click", e => {
//         if (e.target.src.includes("volume.svg")) {
//             e.target.src = e.target.src.replace("volume.svg", "mute.svg");
//             currentSong.volume = 0;
//             document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
//         } else {
//             e.target.src = e.target.src.replace("mute.svg", "volume.svg");
//             currentSong.volume = .10;
//             document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
//         }
//     })
// }

// // Call the main function
// main();
