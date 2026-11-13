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
const installAppBtn = document.getElementById('installAppBtn');
const installMessage = document.getElementById('installMessage');
const prayerTimesDate = document.getElementById('prayerTimesDate');
const prayerTimesStatus = document.getElementById('prayerTimesStatus');
const prayerTimeElements = {
    Fajr: document.getElementById('fajrTime'),
    Dhuhr: document.getElementById('dhuhrTime'),
    Asr: document.getElementById('asrTime'),
    Maghrib: document.getElementById('maghribTime'),
    Isha: document.getElementById('ishaTime')
};
let deferredInstallPrompt = null;
let latestSearchId = 0;

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

function getCityDate(weatherData) {
    if (!Number.isFinite(Number(weatherData?.dt))) {
        return null;
    }

    const timezoneOffset = Number(weatherData.timezone || 0);
    return new Date((weatherData.dt + timezoneOffset) * 1000);
}

function getTimezoneLabel(timezoneSeconds) {
    if (!Number.isFinite(timezoneSeconds)) {
        return 'GMT';
    }

    const totalMinutes = Math.abs(Math.round(timezoneSeconds / 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const sign = timezoneSeconds >= 0 ? '+' : '-';

    return `GMT${sign}${hours}${minutes ? ':' + String(minutes).padStart(2, '0') : ''}`;
}

function formatLocalDateTime(weatherData) {
    if (!weatherData.dt) {
        return 'Date unavailable';
    }

    const date = getCityDate(weatherData);

    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
        hour12: true
    });

    return `${formatter.format(date)} ${getTimezoneLabel(weatherData.timezone)}`;
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

    const date = getCityDate(weatherData);
    const countryCode = (weatherData.sys?.country || '').toUpperCase();
    const localAdjustmentDays = countryCode === 'PK' ? 2 : 0;
    const adjustedDate = new Date(date.getTime() - (localAdjustmentDays * 24 * 60 * 60 * 1000));

    const locales = [
        'ar-SA-u-ca-islamic',
        'ur-PK-u-ca-islamic-umalqura',
        'ur-PK-u-ca-islamic',
        'en-US-u-ca-islamic'
    ];
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    };

    for (const locale of locales) {
        try {
            const formatter = new Intl.DateTimeFormat(locale, options);
            const resolvedCalendar = formatter.resolvedOptions().calendar;

            if (resolvedCalendar && resolvedCalendar.toLowerCase().includes('islamic')) {
                return normalizeIslamicMonthName(formatter.format(adjustedDate));
            }
        } catch (error) {
            // Ignore unsupported locale combinations and continue to the next one.
        }
    }

    return 'Qamari date unavailable';
}

function formatHinduDate(weatherData) {
    if (!weatherData.dt) {
        return 'Hindu/Regional date unavailable';
    }

    const localDate = getCityDate(weatherData);
    const currentLocalDay = Date.UTC(
        localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getUTCDate()
    );

    const months = [
        { name: 'Magh', month: 0, day: 13 },
        { name: 'Phagun', month: 1, day: 12 },
        { name: 'Chet', month: 2, day: 14 },
        { name: 'Vaisakh', month: 3, day: 14 },
        { name: 'Jeth', month: 4, day: 15 },
        { name: 'Harh', month: 5, day: 15 },
        { name: 'Sawan', month: 6, day: 16 },
        { name: 'Bhadon', month: 7, day: 16 },
        { name: 'Assu', month: 8, day: 15 },
        { name: 'Katak', month: 9, day: 15 },
        { name: 'Maghar', month: 10, day: 14 },
        { name: 'Poh', month: 11, day: 14 }
    ];
    const calendarYear = localDate.getUTCFullYear();
    const monthStarts = months.flatMap((month) =>
        [calendarYear - 1, calendarYear].map((year) => ({
            ...month,
            year,
            timestamp: Date.UTC(year, month.month, month.day)
        }))
    );
    const currentMonth = monthStarts
        .filter((month) => month.timestamp <= currentLocalDay)
        .sort((first, second) => second.timestamp - first.timestamp)[0];

    if (!currentMonth) {
        return 'Hindu/Regional date unavailable';
    }

    const monthDay = Math.floor((currentLocalDay - currentMonth.timestamp) / 86400000) + 1;
    const calendarYearLabel = currentMonth.year + 57 - (currentMonth.month < 2 ? 1 : 0);

    return `${currentMonth.name} ${monthDay}, ${calendarYearLabel}`;
}

function formatClockTime(timestamp, timezoneSeconds) {
    if (!timestamp) {
        return '--:--';
    }

    const adjustedDate = new Date((timestamp + Number(timezoneSeconds || 0)) * 1000);
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    }).format(adjustedDate);
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

function getWeatherDetail(weatherData) {
    const code = Number(weatherData.weather?.[0]?.id ?? 800);
    const cloudCoverage = Number(weatherData.clouds?.all ?? 0);
    const main = (weatherData.weather?.[0]?.main || '').toLowerCase();

    if (code >= 200 && code < 300) {
        return { text: 'Thunderstorm', icon: 'fa-solid fa-cloud-bolt' };
    }

    if (code >= 300 && code < 600) {
        return { text: 'Rain', icon: 'fa-solid fa-cloud-rain' };
    }

    if (code >= 600 && code < 700) {
        return { text: 'Snow', icon: 'fa-solid fa-snowflake' };
    }

    if (code >= 700 && code < 782) {
        return { text: 'Mist', icon: 'fa-solid fa-smog' };
    }

    if (code === 800) {
        if (cloudCoverage >= 60) {
            return { text: 'Clouds', icon: 'fa-solid fa-cloud' };
        }
        return { text: 'Clear', icon: 'fa-solid fa-sun' };
    }

    if (code >= 801 && code <= 804) {
        return { text: 'Clouds', icon: 'fa-solid fa-cloud' };
    }

    if (main.includes('clear')) {
        return { text: 'Clear', icon: 'fa-solid fa-sun' };
    }

    if (main.includes('cloud')) {
        return { text: 'Clouds', icon: 'fa-solid fa-cloud' };
    }

    if (main.includes('rain')) {
        return { text: 'Rain', icon: 'fa-solid fa-cloud-rain' };
    }

    if (main.includes('snow')) {
        return { text: 'Snow', icon: 'fa-solid fa-snowflake' };
    }

    if (main.includes('mist') || main.includes('fog') || main.includes('haze')) {
        return { text: 'Mist', icon: 'fa-solid fa-smog' };
    }

    return {
        text: weatherData.weather?.[0]?.main || 'Clouds',
        icon: 'fa-solid fa-cloud'
    };
}

function updateWeather(weatherData, locationName, countryName) {
    const detail = getWeatherDetail(weatherData);

    cityName.textContent = `${locationName || weatherData.name}, ${countryName || weatherData.sys?.country || ''}`.trim();
    dateTime.textContent = formatLocalDateTime(weatherData);
    qamariDate.textContent = formatQamariDate(weatherData);
    hinduDate.textContent = formatHinduDate(weatherData);
    condition.innerHTML = `${detail.text} <i class="${detail.icon}"></i>`;
    temperatur.textContent = `${Math.round(weatherData.main?.temp ?? 0)}°C`;
    windSpeed.textContent = `${Math.round((weatherData.wind?.speed ?? 0) * 3.6)}`;
    humidity.textContent = `${Math.round(weatherData.main?.humidity ?? 0)}`;
    sunrise.textContent = `Sunrise: ${formatClockTime(weatherData.sys?.sunrise, weatherData.timezone)}`;
    sunset.textContent = `Sunset: ${formatClockTime(weatherData.sys?.sunset, weatherData.timezone)}`;

    errorMessage.textContent = '';
    weatherInfo.classList.remove('hidden');
}

function formatPrayerTime(value) {
    const match = typeof value === 'string' ? value.match(/^(\d{1,2}):(\d{2})/) : null;
    if (!match) {
        return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) {
        return null;
    }

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
    }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}

function formatApiQamariDate(hijriDate) {
    const day = Number(hijriDate?.day);
    const month = hijriDate?.month?.en;
    const year = Number(hijriDate?.year);

    if (!Number.isInteger(day) || day < 1 || day > 30
        || typeof month !== 'string' || !month.trim()
        || !Number.isInteger(year) || year < 1) {
        return null;
    }

    return `${day} ${month} ${year} AH`;
}

async function loadPrayerTimes(weatherData, searchId) {
    const cityDate = getCityDate(weatherData);
    const latitude = Number(weatherData.coord?.lat);
    const longitude = Number(weatherData.coord?.lon);

    Object.values(prayerTimeElements).forEach((element) => {
        element.textContent = '--';
    });
    prayerTimesDate.textContent = cityDate
        ? `For ${new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(cityDate)}`
        : '';
    prayerTimesStatus.textContent = 'Loading prayer times...';

    if (!cityDate || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        prayerTimesStatus.textContent = 'Prayer times are unavailable for this location.';
        return;
    }

    const date = [
        String(cityDate.getUTCDate()).padStart(2, '0'),
        String(cityDate.getUTCMonth() + 1).padStart(2, '0'),
        cityDate.getUTCFullYear()
    ].join('-');
    const parameters = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        method: '1',
        school: '1'
    });

    try {
        const response = await fetch(`https://api.aladhan.com/v1/timings/${date}?${parameters}`);
        const result = await response.json();

        if (!response.ok || Number(result.code) !== 200 || !result.data?.timings) {
            throw new Error(result.status || `Prayer service returned HTTP ${response.status}`);
        }

        if (searchId !== latestSearchId) {
            return;
        }

        const apiQamariDate = formatApiQamariDate(result.data.date?.hijri);
        if (apiQamariDate) {
            qamariDate.textContent = apiQamariDate;
        }

        for (const [prayer, element] of Object.entries(prayerTimeElements)) {
            const time = formatPrayerTime(result.data.timings[prayer]);
            if (!time) {
                throw new Error(`Prayer service returned an invalid ${prayer} time`);
            }
            element.textContent = time;
        }
        prayerTimesStatus.textContent = 'Times can vary slightly by local mosque and moon sighting.';
    } catch (error) {
        if (searchId !== latestSearchId) {
            return;
        }

        console.error('Prayer times could not be loaded:', error);
        prayerTimesStatus.textContent = 'Prayer times could not be loaded. Check your connection and try again.';
    }
}

async function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    const searchId = ++latestSearchId;
    searchBtn.disabled = true;
    errorMessage.textContent = '';

    try {
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );
        const weatherData = await weatherResponse.json();
        const statusCode = Number(weatherData.cod || weatherResponse.status);

        if (!weatherResponse.ok || (weatherData.cod && statusCode !== 200)) {
            const message = statusCode === 401
                ? 'Weather API key was rejected. Please check that it is active.'
                : statusCode === 404
                    ? 'City not found. Please check the spelling and try again.'
                    : statusCode === 429
                        ? 'Weather service request limit reached. Please try again later.'
                        : statusCode >= 500
                            ? 'Weather service is temporarily unavailable. Please try again later.'
                            : weatherData.message || 'Weather request failed. Please try again.';
            if (searchId === latestSearchId) {
                showError(message);
            }
            return;
        }

        if (!weatherData.main || !weatherData.sys || !weatherData.coord) {
            throw new Error('Weather service returned incomplete data');
        }

        if (searchId !== latestSearchId) {
            return;
        }
        updateWeather(weatherData, weatherData.name, weatherData.sys?.country || '');
        await loadPrayerTimes(weatherData, searchId);
    } catch (error) {
        if (searchId === latestSearchId) {
            console.error('Weather request failed:', error);
            showError('Could not load weather. Check your connection and API settings, then try again.');
        }
    } finally {
        if (searchId === latestSearchId) {
            searchBtn.disabled = false;
        }
    }
}

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
});

async function installApp() {
    if (!deferredInstallPrompt) {
        const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent)
            || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        installMessage.textContent = isAppleMobile
            ? 'To install, tap Share in your browser, then choose Add to Home Screen.'
            : 'To install, open your browser menu and choose Install app or Add to Home screen.';
        return;
    }

    const installPrompt = deferredInstallPrompt;
    deferredInstallPrompt = null;

    try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        installMessage.textContent = outcome === 'accepted'
            ? 'The app was installed.'
            : 'App installation was canceled.';
    } catch (error) {
        console.error('App installation failed:', error);
        installMessage.textContent = 'App installation failed. Please try again from your browser menu.';
    }
}

installAppBtn.addEventListener('click', installApp);

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installAppBtn.textContent = 'App Installed';
    installAppBtn.disabled = true;
    installMessage.textContent = 'The app was installed.';
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
        console.error('Service worker registration failed:', error);
        installMessage.textContent = 'App installation requires this site to be served over HTTPS.';
    });
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
