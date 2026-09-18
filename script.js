const apiKey = "2797d33bcbfe7458eefdada9be96d2d3";
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('error');
const weatherInfo = document.getElementById('weatherInfo');
const cityName = document.getElementById('cityName');
const dateTime = document.getElementById('dateTime');
const qamariDate = document.getElementById('qamariDate');
const hinduDate = document.getElementById('hinduDate');
// const shareWhatsApp = document.getElementById('shareWhatsApp');
// const copyLinkBtn = document.getElementById('copyLinkBtn');
// const postForm = document.getElementById('postForm');
// const postAuthor = document.getElementById('postAuthor');
// const postText = document.getElementById('postText');
// const postsContainer = document.getElementById('postsContainer');
const condition = document.getElementById('condition');
const temperatur = document.getElementById('temperatur');
const windSpeed = document.getElementById('windSpeed');
const humidity = document.getElementById('humidity');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');

const weatherCodes = {
    0: { text: 'Clear sky', icon: 'fa-solid fa-sun' },
    1: { text: 'Mainly clear', icon: 'fa-solid fa-cloud-sun' },
    2: { text: 'Partly cloudy', icon: 'fa-solid fa-cloud-sun' },
    3: { text: 'Overcast', icon: 'fa-solid fa-cloud' },
    45: { text: 'Fog', icon: 'fa-solid fa-smog' },
    48: { text: 'Depositing rime fog', icon: 'fa-solid fa-smog' },
    51: { text: 'Light drizzle', icon: 'fa-solid fa-cloud-rain' },
    53: { text: 'Moderate drizzle', icon: 'fa-solid fa-cloud-rain' },
    55: { text: 'Dense drizzle', icon: 'fa-solid fa-cloud-showers-heavy' },
    56: { text: 'Light freezing drizzle', icon: 'fa-solid fa-cloud-showers-heavy' },
    57: { text: 'Dense freezing drizzle', icon: 'fa-solid fa-cloud-showers-heavy' },
    61: { text: 'Slight rain', icon: 'fa-solid fa-cloud-rain' },
    63: { text: 'Moderate rain', icon: 'fa-solid fa-cloud-rain' },
    65: { text: 'Heavy rain', icon: 'fa-solid fa-cloud-showers-heavy' },
    66: { text: 'Light freezing rain', icon: 'fa-solid fa-cloud-showers-heavy' },
    67: { text: 'Heavy freezing rain', icon: 'fa-solid fa-cloud-showers-heavy' },
    71: { text: 'Slight snow', icon: 'fa-solid fa-snowflake' },
    73: { text: 'Moderate snow', icon: 'fa-solid fa-snowflake' },
    75: { text: 'Heavy snow', icon: 'fa-solid fa-snowflake' },
    77: { text: 'Snow grains', icon: 'fa-solid fa-snowflake' },
    80: { text: 'Rain showers', icon: 'fa-solid fa-cloud-showers-heavy' },
    81: { text: 'Heavy rain showers', icon: 'fa-solid fa-cloud-showers-heavy' },
    82: { text: 'Violent rain showers', icon: 'fa-solid fa-cloud-showers-heavy' },
    85: { text: 'Snow showers', icon: 'fa-solid fa-cloud-meatball' },
    86: { text: 'Heavy snow showers', icon: 'fa-solid fa-cloud-meatball' },
    95: { text: 'Thunderstorm', icon: 'fa-solid fa-cloud-bolt' },
    96: { text: 'Thunderstorm with hail', icon: 'fa-solid fa-cloud-bolt' },
    99: { text: 'Severe thunderstorm', icon: 'fa-solid fa-cloud-bolt' }
};

function showError(message) {
    errorMessage.textContent = message;
    weatherInfo.classList.add('hidden');
}

function formatLocalDateTime(weatherData) {
    if (!weatherData.dt) {
        return 'Date unavailable';
    }

    const date = new Date(weatherData.dt * 1000);

    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    return formatter.format(date);
}

function normalizeIslamicMonthName(dateText) {
    return dateText.replace(
        /Rabi(?:\s|[-_])(?:ul|al)(?:\s|[-_])?(?:Sani|Thani|Aakhir|Akhir)/gi,
        'Rabi-ul-Akhir'
    );
}

function formatQamariDate(weatherData) {
    if (!weatherData.dt) {
        return 'Qamari date unavailable';
    }

    const date = new Date(weatherData.dt * 1000);
    const locales = [
        'ar-SA-u-ca-islamic',
        'ur-PK-u-ca-islamic-umalqura',
        'ur-PK-u-ca-islamic',
        'en-US-u-ca-islamic'
    ];
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    for (const locale of locales) {
        try {
            const formatter = new Intl.DateTimeFormat(locale, options);
            const resolvedCalendar = formatter.resolvedOptions().calendar;

            if (resolvedCalendar && resolvedCalendar.toLowerCase().includes('islamic')) {
                return normalizeIslamicMonthName(formatter.format(date));
            }
        } catch (error) {
            // Ignore unsupported locale combinations and continue to the next one.
        }
    }

    return 'Qamari date unavailable';
}

function formatHinduDate(weatherData) {
    if (!weatherData.dt) {
        return 'Hindu/Indian date unavailable';
    }

    const date = new Date(weatherData.dt * 1000);

    const formatter = new Intl.DateTimeFormat('en-IN-u-ca-indian', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    return `Hindu/Indian Date: ${formatter.format(date)}`;
}

function formatClockTime(timestamp) {
    if (!timestamp) {
        return '--:--';
    }

    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
}
//adding Event Listener to button.

// function shareOnWhatsApp() {
//     const message = encodeURIComponent('Check this useful weather and date page: ' + window.location.href);
//     window.open(`https://wa.me/?text=${message}`, '_blank');
// }

// // async function copyLink() {
// //     const link = window.location.href;

// //     try {
// //         await navigator.clipboard.writeText(link);
// //         copyLinkBtn.textContent = 'Link Copied';
// //     } catch {
// //         const tempInput = document.createElement('input');
// //         tempInput.value = link;
// //         document.body.appendChild(tempInput);
// //         tempInput.select();
//         // document.execCommand('copy');
//         // tempInput.remove();
//         // copyLinkBtn.textContent = 'Link Copied';
//     }

//     setTimeout(() => {
//         copyLinkBtn.innerHTML = '<i class="fa-solid fa-link"></i> Copy Link';
//     }, 1500);
// }

function updateWeather(weatherData, locationName, countryName) {
    const mainCondition = (weatherData.weather?.[0]?.main || 'Clear').toLowerCase();
    const iconMap = {
        clear: 'fa-solid fa-sun',
        clouds: 'fa-solid fa-cloud',
        rain: 'fa-solid fa-cloud-rain',
        drizzle: 'fa-solid fa-cloud-rain',
        thunderstorm: 'fa-solid fa-cloud-bolt',
        snow: 'fa-solid fa-snowflake',
        mist: 'fa-solid fa-smog',
        fog: 'fa-solid fa-smog',
        haze: 'fa-solid fa-smog'
    };

    const detail = {
        text: weatherData.weather?.[0]?.main || 'Unknown condition',
        icon: iconMap[mainCondition] || 'fa-solid fa-cloud'
    };

    cityName.textContent = `${locationName || weatherData.name}, ${countryName || weatherData.sys?.country || ''}`.trim();
    dateTime.textContent = formatLocalDateTime(weatherData);
    qamariDate.textContent = formatQamariDate(weatherData);
    hinduDate.textContent = formatHinduDate(weatherData);
    condition.innerHTML = `${detail.text} <i class="${detail.icon}"></i>`;
    temperatur.textContent = `${Math.round(weatherData.main?.temp ?? 0)}°C`;
    windSpeed.textContent = `${Math.round(weatherData.wind?.speed ?? 0)}`;
    humidity.textContent = `${Math.round(weatherData.main?.humidity ?? 0)}`;
    sunrise.textContent = `Sunrise: ${formatClockTime(weatherData.sys?.sunrise)}`;
    sunset.textContent = `Sunset: ${formatClockTime(weatherData.sys?.sunset)}`;

    errorMessage.textContent = '';
    weatherInfo.classList.remove('hidden');
}

async function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    try {
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );
        const weatherData = await weatherResponse.json();

        if (weatherData.cod && weatherData.cod !== 200) {
            showError(weatherData.message || 'City not found. Please try another city.');
            return;
        }

        updateWeather(weatherData, weatherData.name, weatherData.sys?.country || '');
    } catch (error) {
        showError('Unable to fetch weather data right now. Please try again.');
    }
}

// const STORAGE_KEY = 'dailyCommunityPosts';

// const defaultPosts = [
//     {
//         id: 1,
//         author: 'Agha Raza',
//         text: 'Welcome to our daily community page! Share your thoughts, likes, and remarks with everyone.',
//         likes: 12,
//         comments: [
//             { author: 'Hina', text: 'Beautiful page! Keep it up.' },
//             { author: 'Bilal', text: 'Nice idea for daily posts.' }
//         ],
//         createdAt: new Date().toISOString()
//     }
// ];

// function getSavedPosts() {
//     try {
//         const savedPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
//         return Array.isArray(savedPosts) && savedPosts.length ? savedPosts : defaultPosts;
//     } catch {
//         return defaultPosts;
//     }
// }

// let posts = getSavedPosts();

// function savePosts() {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
// }

// function escapeHtml(text) {
//     return String(text)
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#039;');
// }

// function formatDate(dateString) {
//     return new Intl.DateTimeFormat('en-PK', {
//         dateStyle: 'medium',
//         timeStyle: 'short'
//     }).format(new Date(dateString));
// }

// function renderPosts() {
//     if (!postsContainer) return;

//     if (!posts.length) {
//         postsContainer.innerHTML = '<div class="empty-state">No posts yet. Be the first one to share!</div>';
//         return;
//     }

//     postsContainer.innerHTML = posts.map((post) => `
//         <article class="post-card">
//             <div class="post-header">
//                 <div>
//                     <h4>${escapeHtml(post.author || 'Anonymous')}</h4>
//                     <span>${formatDate(post.createdAt)}</span>
//                 </div>
//             </div>
//             <p class="post-text">${escapeHtml(post.text || '')}</p>
//             <div class="post-actions">
//                 <button class="mini-btn like-btn" data-action="like" data-id="${post.id}">
//                     <i class="fa-solid fa-heart"></i> Like (${post.likes || 0})
//                 </button>
//             </div>
//             <div class="comments-block">
//                 <h5>Remarks</h5>
//                 ${post.comments && post.comments.length ? `
//                     <ul class="comments-list">
//                         ${post.comments.map((comment) => `
//                             <li>
//                                 <strong>${escapeHtml(comment.author || 'User')}</strong>
//                                 <span>${escapeHtml(comment.text)}</span>
//                             </li>
//                         `).join('')}
//                     </ul>
//                 ` : '<p class="no-comments">No remarks yet.</p>'}
//                 <div class="comment-box">
//                     <input type="text" class="comment-input" data-id="${post.id}" placeholder="Write your remark">
//                     <button class="mini-btn comment-btn" data-action="addComment" data-id="${post.id}">Comment</button>
//                 </div>
//             </div>
//         </article>
//     `).join('');
// }

// function addNewPost(event) {
//     event.preventDefault();

//     const author = (postAuthor.value || 'Anonymous').trim();
//     const text = postText.value.trim();

//     if (!text) {
//         return;
//     }

//     posts.unshift({
//         id: Date.now(),
//         author,
//         text,
//         likes: 0,
//         comments: [],
//         createdAt: new Date().toISOString()
//     });

//     savePosts();
//     renderPosts();

//     postForm.reset();
//     postAuthor.focus();
// }

// function addComment(postId, commentText) {
//     if (!commentText) return;

//     const targetPost = posts.find((post) => post.id === postId);

//     if (!targetPost) return;

//     targetPost.comments.push({
//         author: (postAuthor.value || 'Anonymous').trim() || 'User',
//         text: commentText
//     });

//     savePosts();
//     renderPosts();
// }

// function handlePostActions(event) {
//     const button = event.target.closest('button');

//     if (!button) return;

//     const action = button.dataset.action;
//     const postId = Number(button.dataset.id);

//     if (action === 'like') {
//         const targetPost = posts.find((post) => post.id === postId);
//         if (targetPost) {
//             targetPost.likes = (targetPost.likes || 0) + 1;
//             savePosts();
//             renderPosts();
//         }
//     }

//     if (action === 'addComment') {
//         const input = postsContainer.querySelector(`.comment-input[data-id="${postId}"]`);
//         const commentText = input ? input.value.trim() : '';

//         if (commentText) {
//             addComment(postId, commentText);
//         }
//     }
// }

searchBtn.addEventListener('click', searchWeather);

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchWeather();
    }
});
