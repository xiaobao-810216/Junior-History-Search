async function loadEvents() {
    try {
        const fileInput = document.getElementById('csvFile');
        const file = fileInput.files[0];
        if (!file) {
            throw new Error('请先选择 CSV 文件');
        }
        
        const text = await file.text(); // 使用现代File API读取文件
        const events = parseCSV(text);
        return events;
    } catch (error) {
        console.error('无法加载事件数据：', error);
        throw error;
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const events = [];

    for (let line of lines) {
        if (!line.trim()) continue; // 跳过空行
        
        const [year, description] = line.split(',').map(v => v.trim());
        if (year && description) {
            events.push({
                year: parseInt(year, 10),
                event: description
            });
        } else {
            console.warn(`跳过不完整的行: ${line}`);
        }
    }
    return events;
}

function formatYear(year) {
    return year < 0 ? `公元前${-year}年` : `${year}年`;
}

async function calculateAnniversaries() {
    try {
        const events = await loadEvents();
        const targetYear = parseInt(document.getElementById('yearInput').value, 10);
        const interval = parseInt(document.getElementById('intervalInput').value, 10);
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        if (isNaN(targetYear) || isNaN(interval) || interval <= 0) {
            resultsDiv.innerHTML = '<p style="color: red;">请输入有效的年份和周年间隔。</p>';
            return;
        }

        const matchingEvents = [];

        events.forEach(event => {
            let anniversary;
            // 正确计算公元前和公元后的周年
            if (event.year < 0) {
                anniversary = targetYear - event.year - 1;
            } else {
                anniversary = targetYear - event.year;
            }


            if (anniversary > 0 && anniversary % interval === 0) {
                matchingEvents.push({
                    name: event.event,
                    year: event.year,
                    anniversary: anniversary
                });
            }
        });

        if (matchingEvents.length > 0) {
            matchingEvents.sort((a, b) => b.anniversary - a.anniversary);
            const list = document.createElement('ul');
            matchingEvents.forEach(event => {
                const listItem = document.createElement('li');
                listItem.textContent = `${event.name}（${formatYear(event.year)}发生），在${targetYear}年是第${event.anniversary}周年。`;
                list.appendChild(listItem);
            });
            resultsDiv.appendChild(list);
        } else {
            resultsDiv.innerHTML = `<p>在${targetYear}年，没有符合条件的历史事件周年纪念。</p>`;
        }
    } catch (error) {
        document.getElementById('results').innerHTML = 
            `<p style="color: red;">错误：${error.message}</p>`;
    }
}

// 添加文件选择监听器
document.getElementById('csvFile').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || '';
    if (fileName) {
        document.getElementById('fileName').textContent = `已选择: ${fileName}`;
    }
});