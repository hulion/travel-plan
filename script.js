// 天氣功能：模擬 API 請求
async function fetchWeather() {
    const weatherDesc = document.getElementById('weather-desc');
    const weatherTemp = document.getElementById('weather-temp');
    const rainChance = document.getElementById('rain-chance');
    const weatherDate = document.getElementById('weather-date');

    // 設定今天日期
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = now.getDay(); // 0-6
    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];

    if (weatherDate) {
        weatherDate.innerText = `${month}/${date} (${dayNames[day]})`;
    }

    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.69&longitude=135.19&current=temperature_2m,weather_code&hourly=precipitation_probability&timezone=Asia%2FTokyo&forecast_days=1');
        const data = await response.json();

        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;

        // 取得當前小時的降雨機率
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
        weatherTemp.innerText = "15°C";
        weatherDesc.innerText = "晴時多雲";
        rainChance.innerText = "10%";
    }
}

fetchWeather();

// 展開/收合功能
function toggleCollapsible(id) {
    const content = document.getElementById(`${id}-content`);
    const icon = document.getElementById(`${id}-icon`);

    content.classList.toggle('expanded');
    icon.classList.toggle('rotated');

    const isDesktop = window.innerWidth >= 1024;

    // 住宿和機票的聯動行為
    if (id === 'hotel' || id === 'flight') {
        const otherContentId = id === 'hotel' ? 'flight-content' : 'hotel-content';
        const otherIconId = id === 'hotel' ? 'flight-icon' : 'hotel-icon';
        const otherContent = document.getElementById(otherContentId);
        const otherIcon = document.getElementById(otherIconId);

        if (otherContent && otherIcon) {
            if (isDesktop) {
                // 電腦版：同步展開/收合
                if (content.classList.contains('expanded')) {
                    otherContent.classList.add('expanded');
                    otherIcon.classList.add('rotated');
                } else {
                    otherContent.classList.remove('expanded');
                    otherIcon.classList.remove('rotated');
                }
            } else {
                // 手機版：互斥（展開一個就關閉另一個）
                if (content.classList.contains('expanded')) {
                    otherContent.classList.remove('expanded');
                    otherIcon.classList.remove('rotated');
                }
            }
        }
    }
}

// 圖片輪播功能
function initCarousel() {
    const images = [
        'https://i.meee.com.tw/BzqG7iP.png',
        'https://i.meee.com.tw/r7Pkhh1.png'
    ];
    const imgElement = document.getElementById('mosaic-img');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    let currentIndex = 0;

    // 自動輪播
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;

        // 淡出效果
        imgElement.style.opacity = '0';

        setTimeout(() => {
            imgElement.src = images[currentIndex];
            imgElement.style.opacity = '1';

            // 更新指示器
            indicators.forEach((ind, idx) => {
                ind.classList.toggle('active', idx === currentIndex);
            });
        }, 250);
    }, 4000); // 每 4 秒切換

    // 點擊指示器手動切換
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            imgElement.style.opacity = '0';

            setTimeout(() => {
                imgElement.src = images[currentIndex];
                imgElement.style.opacity = '1';

                indicators.forEach((ind, idx) => {
                    ind.classList.toggle('active', idx === currentIndex);
                });
            }, 250);
        });
    });
}

// 啟動輪播
initCarousel();

// Day Navigation功能
function scrollToDay(dayId) {
    const element = document.getElementById(dayId);
    if (element) {
        const yOffset = -80; // 偏移量，讓元素不會被 sticky tab 遮住
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });

        // 更新按鈕狀態
        updateActiveDay(dayId);
    }
}

// 更新日期按鈕的 active 狀態
function updateActiveDay(dayId) {
    // 移除所有按鈕的 active class
    document.querySelectorAll('.day-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 為對應的按鈕添加 active class
    const activeButton = document.querySelector(`button[onclick*="${dayId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// 滾動監聽器：根據可見區域更新按鈕狀態
function initScrollSpy() {
    const days = ['day1', 'day2', 'day3', 'day4'];
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (isScrolling) return;

        isScrolling = true;
        setTimeout(() => {
            isScrolling = false;
        }, 100);

        // 找出目前可見的日期區塊
        let currentDay = null;
        const scrollPosition = window.scrollY + 200; // 加上偏移量

        for (let i = days.length - 1; i >= 0; i--) {
            const element = document.getElementById(days[i]);
            if (element && element.offsetTop <= scrollPosition) {
                currentDay = days[i];
                break;
            }
        }

        if (currentDay) {
            updateActiveDay(currentDay);
        }
    });
}

// 初始化滾動監聽
initScrollSpy();

// 設定初始的 active 狀態
updateActiveDay('day1');

// 滾動進場動畫
function initScrollAnimation() {
    // 為所有卡片和區塊標題添加 fade-in-up class
    const elements = document.querySelectorAll('.card, .section-title, .feature-card');
    elements.forEach(el => {
        el.classList.add('fade-in-up');
    });

    // 使用 Intersection Observer 監聽元素進入視口
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 元素顯示後就不再監聽，提升性能
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // 當元素 10% 進入視口時觸發
        rootMargin: '0px 0px -50px 0px' // 提前一點觸發
    });

    // 監聽所有需要動畫的元素
    elements.forEach(el => {
        observer.observe(el);
    });
}

// 回到頂部功能
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // 滾動完成後更新按鈕狀態為 D1
    setTimeout(() => {
        updateActiveDay('day1');
    }, 500); // 等待滾動動畫完成
}

// 顯示/隱藏回到頂部按鈕
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

// 初始化所有功能
initScrollAnimation();
initBackToTop();

// 追蹤每個容器的選擇狀態
const selectionStates = {};

function pickRandom(containerId) {
    const container = document.getElementById(containerId);
    const items = container.querySelectorAll('.rec-item');
    if (items.length < 2) return;

    // 找到對應的按鈕
    const button = document.querySelector(`button[onclick*="${containerId}"]`);
    if (!button) return;

    // 檢查當前狀態
    const isSelected = selectionStates[containerId] || false;

    if (isSelected) {
        // 恢復狀態：清除所有效果
        items.forEach(item => {
            item.classList.remove('selected-highlight', 'dimmed');
            item.style.opacity = '';
            // 移除邱比特圖片
            const cupid = item.querySelector('.cupid-icon');
            if (cupid) {
                cupid.remove();
            }
        });

        // 恢復按鈕文字
        button.innerHTML = '<i class="fas fa-dice"></i> 交給命運之神';
        selectionStates[containerId] = false;
    } else {
        // 選擇狀態：執行隨機選擇
        items.forEach(item => {
            item.classList.remove('selected-highlight', 'dimmed');
            item.style.opacity = '0.5';
        });

        // 創建邱比特圖片
        const cupid = document.createElement('img');
        cupid.src = 'images/cupid.png';
        cupid.className = 'cupid-icon cupid-icon-large'; // 動畫中使用大尺寸
        cupid.alt = '邱比特';

        let count = 0;
        const maxCount = 15;
        const interval = setInterval(() => {
            items.forEach(item => {
                item.classList.remove('selected-highlight');
                item.style.opacity = '0.5';
                // 移除邱比特（如果存在）
                const existingCupid = item.querySelector('.cupid-icon');
                if (existingCupid) {
                    existingCupid.remove();
                }
            });

            const randomIndex = Math.floor(Math.random() * items.length);
            const selected = items[randomIndex];
            selected.style.opacity = '1';
            selected.classList.add('selected-highlight');

            // 將大尺寸邱比特添加到當前高亮的項目
            selected.appendChild(cupid.cloneNode(true));

            count++;
            if (count >= maxCount) {
                clearInterval(interval);
                items.forEach(item => {
                     item.classList.add('dimmed');
                     item.style.opacity = '';
                     // 清理所有邱比特
                     const existingCupid = item.querySelector('.cupid-icon');
                     if (existingCupid) {
                         existingCupid.remove();
                     }
                });
                selected.classList.remove('dimmed');
                selected.classList.add('selected-highlight');

                // 移除大尺寸 class，恢復正常大小
                cupid.classList.remove('cupid-icon-large');

                // 在最終選中的項目添加邱比特（正常尺寸）
                selected.appendChild(cupid);

                selected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                // 改變按鈕文字為「恢復」
                button.innerHTML = '<i class="fas fa-undo"></i> 恢復';
                selectionStates[containerId] = true;
            }
        }, 100);
    }
}
