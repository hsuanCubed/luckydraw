export const prepareLuckyDraw = ({ commit, state }, prizeInfo) => {
    // 這裡放入原 GetLuckyBox.vue 內 `getLucky` 方法中的大部分邏輯 (從計算 drawCount 到 設定背景圖，但不包含 that.luckyAction())

    const drawCount = prizeInfo.drawCount || 1;
    const remainingAmount = prizeInfo.amount - prizeInfo.count;

    if (remainingAmount >= drawCount) {
        const { haveAwardCandidateSN } = state;
        let ValidateCandidateSN = [];

        state.candidateList.forEach((candidateInfo) => {
            if (candidateInfo.del === false && !haveAwardCandidateSN.includes(candidateInfo.sn)) {
                ValidateCandidateSN.push(candidateInfo.sn);
            }
        });

        if (ValidateCandidateSN.length >= drawCount) {
            // 隨機打亂候選人名單
            for (let i = ValidateCandidateSN.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [ValidateCandidateSN[i], ValidateCandidateSN[j]] = [ValidateCandidateSN[j], ValidateCandidateSN[i]];
            }
            const winnersSN = ValidateCandidateSN.slice(0, drawCount);

            // 1. 儲存準備好的抽獎資料到 Vuex State
            commit('setLuckyDrawCandidateSNs', {
                validateList: ValidateCandidateSN,
                winnerList: winnersSN
            });
            commit('setLuckyDrawRunTime', state.config.defaultRunTime);
            commit('setLuckyDrawOrgRunTime', state.config.defaultRunTime);
            commit('setLuckyDrawFocusKey', prizeInfo.prize_sn); // 設定選中的獎項

            // 2. 設定背景圖 (這是點擊後唯一可見的變化)
            if (prizeInfo.bgPic) {
                const newConfig = { backgroundImg: prizeInfo.bgPic };
                // 使用 setConfig mutation (需確保其存在)
                commit('setConfig', { config: { ...state.config, ...newConfig } });
                // commit('saveToLocalStorage'); // 如果 saveToLocalStorage 是 mutation
            }

            // 3. 設定滾動開始時顯示的候選人 (通常是第一個中獎者)
            commit('setFocusCandidateSN', "");

            // 成功準備後，回傳成功標誌，供 GetLuckyBox 關閉 Modal 使用
            return true;
        } else {
            return false;
        }
    }
    // 檢查失敗，回傳失敗標誌
    return false;
};

let luckyActionTimer = null; // 在 Action 文件頂部定義計時器變數

export const startLuckyDrawProcess = ({ commit, state }) => {
    if (state.luckyDrawFocusKey === '' || state.luckyDrawValidateCandidateSN.length < 1) {
        return;
    }

    // 必須在 Action 內部定義遞迴函數
    const luckyAction = () => {

        let runTime = state.luckyDrawRunTime;
        const ValidateCandidateSN = state.luckyDrawValidateCandidateSN;
        const getLuckyWaitTimeArr = state.getLuckyWaitTimeArr;

        // 滾動過程：隨機選取一位候選人做視覺展示
        const sn_index = parseInt((Math.random() * 100000) % ValidateCandidateSN.length);
        commit('setFocusCandidateSN', ValidateCandidateSN[sn_index]);

        // commit('setFavicon', 'run'); // 設定 Favicon

        // 播放聲音 (略)

        if (runTime > 0 && ValidateCandidateSN.length > 1) {

            // 【修正後的 waitTime 計算邏輯】
            let waitTime = 100; // 預設值 (若不符合任何區間)

            // 依據 getLuckyWaitTimeArr 判斷目前的滾動速度
            // 由於陣列是依 limit 降序排列 (500, 100, ..., 1)，
            // 我們必須從底部（最嚴格的限制，如 limit: 1）往上尋找，
            // 才能確保找到最貼近當前 runTime 的速度，實現正確的慢速效果。
            for (let i = getLuckyWaitTimeArr.length - 1; i >= 0; i--) {
                const item = getLuckyWaitTimeArr[i];
                if (runTime <= item.limit) {
                    waitTime = item.wait;
                    break; // 找到最嚴格的限制後即停止查找
                }
            }

            runTime -= 1;
            commit('setLuckyDrawRunTime', runTime); // 更新 runTime 狀態

            clearTimeout(luckyActionTimer);
            luckyActionTimer = setTimeout(() => {
                // audio.ding.pause();
                // audio.ding.currentTime = 0;
                luckyAction(); // 遞迴呼叫
            }, waitTime);

        } else {
            // 抽獎停止
            clearTimeout(luckyActionTimer);
            setTimeout(() => {

                // 設定中獎結果
                commit('setFocusCandidateSN', state.luckyDrawWinnerCandidateSNList);
                commit('setFocusPrizeSN', state.luckyDrawFocusKey);

                // audio.winner[index].play();

            }, 600);
        }
    };

    luckyAction(); // 啟動遞迴
};

export const triggerLuckyDrawProcess = ({ dispatch, commit, state }) => {
    // 1. 檢查抽獎是否已經就緒 (必須選定獎項且有合格候選人)
    if (state.luckyDrawFocusKey && state.luckyDrawValidateCandidateSN.length > 0) {

        // 2. 設置開始抽獎狀態 (供 UI 元件監聽並響應)
        commit('setTriggerLuckyDraw', true);

        // 3. 延遲啟動遞迴 Action，給 UI 渲染時間
        setTimeout(() => {
            dispatch('startLuckyDrawProcess'); // 呼叫我們寫好的遞迴 Action
        }, 100);

        return true;
    }

    // 4. 如果是隨機模式且已載入候選人名單，也允許直接啟動
    if (state.luckyDrawIsRandom && state.luckyDrawValidateCandidateSN.length > 0) {
        commit('setTriggerLuckyDraw', true);
        setTimeout(() => {
            dispatch('startLuckyDrawProcess');
        }, 100);
        return true;
    }

    // 5. 如果以上都不滿足，則無法開始
    // 您可以選擇在這裡彈出提示 Modal 告知使用者
    return false;
};