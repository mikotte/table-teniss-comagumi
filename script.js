let previousPairs = [];
let lastPairs = [];

function createPairs() {
    const namesInput = document.getElementById('namesInput').value.trim();
    const pairCount = parseInt(document.getElementById('pairCount').value);
    const generationCount = parseInt(document.getElementById('generationCount').value);
    const pairsList = document.getElementById('pairsList');
    
    const names = namesInput.split('\n').filter(name => name.trim() !== '');
    
    function generatePairs(names, pairCount) {
        const shuffledNames = names.sort(() => Math.random() - 0.5);
        const pairs = [];
        const usedNames = new Set();
        
        let remainingNames = shuffledNames.slice();
        while (remainingNames.length >= 2 && pairs.length < pairCount) {
            const pair = remainingNames.splice(0, 2);
            if (pair.every(name => !usedNames.has(name)) && isUniquePair(pair, previousPairs) && !isLastPair(pair, lastPairs)) {
                pairs.push(pair);
                pair.forEach(name => usedNames.add(name));
            } else {
                remainingNames.push(...pair);
                remainingNames = remainingNames.sort(() => Math.random() - 0.5);
            }
        }
        
        while (remainingNames.length > 0) {
            let added = false;
            for (let pair of pairs) {
                if (pair.length === 2) {
                    const name = remainingNames.splice(0, 1)[0];
                    if (!usedNames.has(name) && isUniquePair([...pair, name], previousPairs) && !isLastPair([...pair, name], lastPairs)) {
                        pair.push(name);
                        usedNames.add(name);
                        added = true;
                        break;
                    }
                }
            }
            if (!added) {
                let index = pairs.length - 1;
                const name = remainingNames.splice(0, 1)[0];
                if (!usedNames.has(name)) {
                    pairs[index].push(name);
                    usedNames.add(name);
                    if (pairs[index].length > 3) {
                        console.log('4人以上のグループができたため無効');
                        return null;
                    }
                    index = (index - 1 + pairs.length) % pairs.length;
                }
            }
        }
        
        if (pairs.length > pairCount) {
            console.log('ペア数が指定した数を超えたため無効');
            return null;
        }
        
        return pairs;
    }
    
    function isUniquePair(pair, previousPairs) {
        const pairCountMap = {};
        
        for (let prevPair of previousPairs) {
            for (let name of prevPair) {
                if (!pairCountMap[name]) {
                    pairCountMap[name] = {};
                }
                for (let otherName of prevPair) {
                    if (name !== otherName) {
                        if (!pairCountMap[name][otherName]) {
                            pairCountMap[name][otherName] = 0;
                        }
                        pairCountMap[name][otherName]++;
                    }
                }
            }
        }
        
        for (let name of pair) {
            for (let otherName of pair) {
                if (name !== otherName && pairCountMap[name] && pairCountMap[name][otherName] >= 3) {
                    console.log(`特定の人物が同じ人と3回以上当たったため無効: ${name} - ${otherName}`);
                    return false;
                }
            }
        }
        
        return true;
    }
    
    function isLastPair(pair, lastPairs) {
        for (let lastPair of lastPairs) {
            if (lastPair.includes(pair[0]) && lastPair.includes(pair[1])) {
                console.log(`同じペアが2回連続になったため無効: ${pair[0]} - ${pair[1]}`);
                return true;
            }
        }
        return false;
    }
    
    pairsList.innerHTML = '';
    for (let i = 0; i < generationCount; i++) {
        let pairs;
        let attempts = 0;
        const maxAttempts = 10000;
        do {
            pairs = generatePairs(names, pairCount);
            attempts++;
            console.log(`試行回数: ${attempts}, ペア数: ${pairs ? pairs.length : 'null'}, ペア: ${pairs ? JSON.stringify(pairs) : 'null'}`);
            if (pairs === null) {
                console.log('ペアの生成に失敗しました。再試行します。');
            } else if (pairs.some(pair => pair.length > 3)) {
                console.log('4人以上のグループができました。再試行します。');
            } else if (pairs.some(pair => !isUniquePair(pair, previousPairs))) {
                console.log('特定の人物が同じ人と3回以上当たりました。再試行します。');
            } else if (pairs.some(pair => new Set(pair).size !== pair.length)) {
                console.log('同じ人が2回登場しました。再試行します。');
            } else if (pairs.some(pair => isLastPair(pair, lastPairs))) {
                console.log('同じペアが2回連続になりました。再試行します。');
            }
        } while ((pairs === null || pairs.some(pair => pair.length > 3) || pairs.some(pair => !isUniquePair(pair, previousPairs)) || pairs.some(pair => new Set(pair).size !== pair.length) || pairs.some(pair => isLastPair(pair, lastPairs))) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            console.error('ペアの生成に失敗しました。条件を満たすペアを生成できませんでした。');
            break;
        }
        
        lastPairs = pairs;
        previousPairs.push(...pairs);
        
        const listItem = document.createElement('li');
        listItem.textContent = `生成 ${i + 1}: ${pairs.map(pair => pair.join(', ')).join(' | ')}`;
        pairsList.appendChild(listItem);
    }
}