// Weather: Tokyo Disney area (Urayasu)
async function fetchWeather() {
    const weatherDesc = document.getElementById('weather-desc');
    const weatherTemp = document.getElementById('weather-temp');
    const rainChance = document.getElementById('rain-chance');
    const weatherDate = document.getElementById('weather-date');

    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = now.getDay();
    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

    if (weatherDate) {
        weatherDate.innerText = `${month}/${date} (${dayNames[day]})`;
    }

    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.63&longitude=139.88&current=temperature_2m,weather_code&hourly=precipitation_probability&timezone=Asia%2FTokyo&forecast_days=1');
        const data = await response.json();

        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const currentHour = now.getHours();
        const rain = data.hourly.precipitation_probability[currentHour] || 0;

        let status = "晴朗";
        if (code >= 1 && code <= 3) status = "多雲";
        if (code > 50) status = "有雨";
        if (code === 0) status = "晴天";

        weatherTemp.innerText = `${temp}°C`;
        weatherDesc.innerText = status;
        rainChance.innerText = `${rain}%`;
    } catch (e) {
        console.error('天氣 API 錯誤:', e);
        weatherTemp.innerText = "8°C";
        weatherDesc.innerText = "晴時多雲";
        rainChance.innerText = "15%";
    }
}

fetchWeather();

// Collapsible
function toggleCollapsible(id) {
    const content = document.getElementById(`${id}-content`);
    const icon = document.getElementById(`${id}-icon`);

    content.classList.toggle('expanded');
    icon.classList.toggle('rotated');

    const isDesktop = window.innerWidth >= 1024;

    if (id === 'hotel' || id === 'flight') {
        const otherContentId = id === 'hotel' ? 'flight-content' : 'hotel-content';
        const otherIconId = id === 'hotel' ? 'flight-icon' : 'hotel-icon';
        const otherContent = document.getElementById(otherContentId);
        const otherIcon = document.getElementById(otherIconId);

        if (otherContent && otherIcon) {
            if (isDesktop) {
                if (content.classList.contains('expanded')) {
                    otherContent.classList.add('expanded');
                    otherIcon.classList.add('rotated');
                } else {
                    otherContent.classList.remove('expanded');
                    otherIcon.classList.remove('rotated');
                }
            } else {
                if (content.classList.contains('expanded')) {
                    otherContent.classList.remove('expanded');
                    otherIcon.classList.remove('rotated');
                }
            }
        }
    }
}

// Day Navigation
function scrollToDay(dayId) {
    const element = document.getElementById(dayId);
    if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        updateActiveDay(dayId);
    }
}

function updateActiveDay(dayId) {
    document.querySelectorAll('.day-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeButton = document.querySelector(`button[onclick*="${dayId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        activeButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

// Scroll Spy
function initScrollSpy() {
    const days = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9', 'day10', 'day11'];
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (isScrolling) return;
        isScrolling = true;
        setTimeout(() => { isScrolling = false; }, 100);

        let currentDay = null;
        const scrollPosition = window.scrollY + 200;
        const atBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 100);

        if (atBottom) {
            currentDay = days[days.length - 1];
        } else {
            for (let i = days.length - 1; i >= 0; i--) {
                const element = document.getElementById(days[i]);
                if (element && element.offsetTop <= scrollPosition) {
                    currentDay = days[i];
                    break;
                }
            }
        }

        if (currentDay) {
            updateActiveDay(currentDay);
        }
    });
}

initScrollSpy();
updateActiveDay('day1');

// Scroll Animation
function initScrollAnimation() {
    const elements = document.querySelectorAll('.card, .section-title, .feature-card');
    elements.forEach(el => { el.classList.add('fade-in-up'); });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => { observer.observe(el); });
}

// Back to Top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { updateActiveDay('day1'); }, 500);
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
}

initScrollAnimation();
initBackToTop();

// Random Restaurant Picker
const selectionStates = {};

function pickRandom(containerId) {
    const container = document.getElementById(containerId);
    const items = container.querySelectorAll('.rec-item');
    if (items.length < 2) return;

    const button = document.querySelector(`button[onclick*="${containerId}"]`);
    if (!button) return;

    const isSelected = selectionStates[containerId] || false;

    if (isSelected) {
        items.forEach(item => {
            item.classList.remove('selected-highlight', 'dimmed');
            item.style.opacity = '';
            const cupid = item.querySelector('.cupid-icon');
            if (cupid) cupid.remove();
        });
        button.innerHTML = '<i class="fas fa-dice"></i> 交給命運之神';
        selectionStates[containerId] = false;
    } else {
        items.forEach(item => {
            item.classList.remove('selected-highlight', 'dimmed');
            item.style.opacity = '0.5';
        });

        const cupid = document.createElement('img');
        cupid.src = '../images/cupid.png';
        cupid.className = 'cupid-icon cupid-icon-large';
        cupid.alt = '命運之神';

        let count = 0;
        const maxCount = 15;
        const interval = setInterval(() => {
            items.forEach(item => {
                item.classList.remove('selected-highlight');
                item.style.opacity = '0.5';
                const existingCupid = item.querySelector('.cupid-icon');
                if (existingCupid) existingCupid.remove();
            });

            const randomIndex = Math.floor(Math.random() * items.length);
            const selected = items[randomIndex];
            selected.style.opacity = '1';
            selected.classList.add('selected-highlight');
            selected.appendChild(cupid.cloneNode(true));

            count++;
            if (count >= maxCount) {
                clearInterval(interval);
                items.forEach(item => {
                    item.classList.add('dimmed');
                    item.style.opacity = '';
                    const existingCupid = item.querySelector('.cupid-icon');
                    if (existingCupid) existingCupid.remove();
                });
                selected.classList.remove('dimmed');
                selected.classList.add('selected-highlight');

                cupid.classList.remove('cupid-icon-large');
                selected.appendChild(cupid);

                selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                button.innerHTML = '<i class="fas fa-undo"></i> 恢復';
                selectionStates[containerId] = true;
            }
        }, 100);
    }
}
