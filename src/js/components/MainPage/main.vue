<template>
    <div class="main-page">
        <header-bar></header-bar>

        <main style="padding: 0px 10px">
            <div class="row justify-content-center">
                <div class="col-12 col-md-9 mx-auto mt-3">
                    <div v-if="candidateList.length > 0" class="shortlist-box">
                        <transition-group name="shortlist" class="shortlist" tag="div" enter-active-class="fadeInUp"
                            leave-active-class="fadeOutDown">
                            <candidate-box v-for="(candidateInfo, candidateIndex) in candidateListBySort"
                                :key="candidateInfo.sn" :candidate-index="candidateIndex"
                                :candidate-info="candidateInfo"></candidate-box>
                        </transition-group>
                    </div>
                    <template v-else>
                        <div class="shortlist-empty-box">
                            <div class="shortlist-empty-info text-left">
                                <p>
                                    尚未建立抽獎名單 <br>
                                    您可以：
                                </p>
                                <ol>
                                    <li class="mb-2">
                                        <a href="javascript:;" @click="editCandidateList">輸入抽獎名單</a>
                                    </li>
                                    <li class="mb-2">
                                        <a href="javascript:;" @click="triggerTutorial">觀看教學導覽</a>
                                    </li>
                                    <li class="mb-2">
                                        <a href="javascript:;" @click="createRandomLuckyDrawAct">隨機建立範例測試</a>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </main>

        <div v-if="config.backgroundImg" class="bg-img" :style="{
            'background-image': 'url(' + config.backgroundImg + ')',
            opacity: config.backgroundOpacity,
        }"></div>


        <lucky-draw-storage-box></lucky-draw-storage-box>
    </div>
</template>
<script>
import { detectAnyAdblocker } from 'just-detect-adblock';

import { localStorage, string, trackJS, Tutorial } from 'lib/common/util';
import { mapActions, mapMutations, mapGetters } from 'vuex';

// import $ from 'jquery';
// import 'bootstrap';

// import 'app';
// import { string, jsVars, popup, trackJS, localStorage, ppPanel } from 'lib/common/util';

export default {
    components: {
        HeaderBar: () => import('components/HeaderBar/main.vue'),
        LuckyDrawStorageBox: () => import('components/LuckyDrawStorageBox/main.vue'),
        CandidateBox: () => import('components/CandidateBox/main.vue'),
    },
    filters: {},
    props: {},
    data() {
        return {};
    },
    computed: {
        ...mapGetters([
            'luckyDrawFocusKey',
            'triggerOpenGetLucky',
            'luckyDrawIsRandom',
            'config',

            'candidateList',
            'candidateListBySort',
            'candidateList_sort',

            'prizeList',


            'randomCandidateNames',
            'randomCandidatePos',
            'randomPrize',
        ]),
    },
    watch: {
        config: {
            deep: true,
            handler() {
                const that = this;
                that.saveToLocalStorageAct();
            },
        },
        candidateList: {
            deep: true,
            handler(val, oldVal) {
                const that = this;
                that.saveToLocalStorageAct();
            },
        },
        candidateList_sort: {
            deep: true,
            handler(val, oldVal) {
                const that = this;
                that.saveToLocalStorageAct();
            },
        },
        candidateListInput: {
            deep: true,
            handler(val, oldVal) {
                const that = this;
                that.saveToLocalStorageAct();
            },
        },
        prizeList: {
            deep: true,
            handler(val, oldVal) {
                const that = this;
                that.saveToLocalStorageAct();
            },
        },
        luckyDrawFocusKey: {
            deep: true,
            handler() {
                // this.triggerTutorial();
            },
        },
        luckyDrawIsRandom: {
            deep: true,
            handler() {
                this.triggerRandomTutorial();
            },
        },
    },
    created() { },
    mounted() {
        const that = this;
        that.init();
        /** 監聽 Enter 鍵開始抽獎 */
        document.addEventListener('keyup', that.enterToLuckyDraw);
    },
    updated() { },
    destroyed() {
        // 在組件銷毀時移除事件監聽
        const that = this;
        document.removeEventListener('keyup', that.enterToLuckyDraw);
    },
    methods: {
        ...mapActions({
            // 假設這個 Action 負責啟動實際的滾動抽獎邏輯
            triggerLuckyDrawProcess: 'triggerLuckyDrawProcess', // 確保這個 Action 名稱與您的 Vuex Actions 匹配
        }),
        ...mapMutations({
            setFavicon: 'setFavicon',
            initSystem: 'initSystem',
            saveToLocalStorage: 'saveToLocalStorage',
            listenLocalStorageChange: 'listenLocalStorageChange',

            createRandomLuckyDraw: 'createRandomLuckyDraw',
            triggerModal: 'triggerModal',
            CheckAdBlock: 'CheckAdBlock',

            setIsTutorial: 'setIsTutorial',
        }),
        init() {
            const that = this;
            that.setFavicon('default');
            trackJS.mixpanel('LuckyDraw_view', {});
            trackJS.gtag('event', 'page_view');
            that.initSystem();

            /**
             * 同步開兩個頁面的資料
             */
            localStorage.listen('luckyDrawStorage', (data) => {
                that.listenLocalStorageChange();
            });

            /* 偵測 adblocker */
            detectAnyAdblocker().then((detected) => {
                that.CheckAdBlock(detected);
            });
        },
        saveToLocalStorageAct() {
            const that = this;
            clearTimeout(that.saveToLocalStorageTimer);
            that.saveToLocalStorageTimer = setTimeout(() => {
                that.saveToLocalStorage();
            }, 500);
        },
        editCandidateList() {
            const that = this;
            that.triggerModal({ key: 'CandidateList' });
        },
        /**
         * 監聽鍵盤 Enter 鍵，如果已選定抽獎項目，則啟動抽獎
         */
        enterToLuckyDraw(event) {
            const that = this;
            
            // 檢查是否為 Enter 鍵
            if (event.key === 'Enter' || event.keyCode === 13) {
                console.log('Enter key detected!');

                console.log('FocusKey:', that.luckyDrawFocusKey);
                console.log('IsRandom:', that.luckyDrawIsRandom);
                console.log('ModalOpen:', that.triggerOpenGetLucky);
                // 檢查條件：
                // 1. 已選定 focus key (非隨機模式) 或 2. 為隨機模式
                // 3. GetLuckyBox Modal 必須已關閉 (以免在 Modal 中誤觸)
                const isReadyToDraw = (that.luckyDrawFocusKey !== '' || that.luckyDrawIsRandom) &&
                    that.triggerOpenGetLucky === false;

                if (isReadyToDraw) {
                    console.log('Conditions met. Starting Draw Process...'); // 👈 新增此行
                    event.preventDefault();
                    that.triggerLuckyDrawProcess(); // 或是您實際呼叫的抽獎方法名

                    // 🎯 檢查抽獎方法是否真的存在
                    if (typeof that.triggerLuckyDrawProcess === 'function') {
                        console.log('Function exists and was called.'); // 👈 新增此行
                    } else {
                        console.error('triggerLuckyDrawProcess function is MISSING or undefined!'); // 👈 新增此行
                    }

                } else {
                    console.log('Conditions NOT met.');
                }
            }
        },
        createRandomLuckyDrawAct() {
            const that = this;
            that.createRandomLuckyDraw();
            trackJS.mixpanel('LuckyDrawRandom_click', {
                config: JSON.parse(JSON.stringify(that.config)),
                candidateList: JSON.parse(JSON.stringify(that.candidateList)),
                candidateList_sort: JSON.parse(JSON.stringify(that.candidateList_sort)),
                prizeList: JSON.parse(JSON.stringify(that.prizeList)),
            });
            trackJS.gtag('event', 'LuckyDrawRandom_click', {
                config: JSON.parse(JSON.stringify(that.config)),
                candidateList: JSON.parse(JSON.stringify(that.candidateList)),
                candidateList_sort: JSON.parse(JSON.stringify(that.candidateList_sort)),
                prizeList: JSON.parse(JSON.stringify(that.prizeList)),
            });
        },
        gotoDemoVideo() {
            trackJS.mixpanel('LuckyDrawDemoVideo_click');
            trackJS.gtag('event', 'LuckyDrawDemoVideo_click');
        },
        triggerRandomTutorial() {
            const that = this;
            if (this.luckyDrawIsRandom) {
                const config = {
                    offset: {
                        top: 60,
                        bottom: 60,
                    },
                    startCallback() {
                        that.setIsTutorial(true);
                        trackJS.mixpanel('TutorialStart_trigger', { type: 'RandomTutorial' });
                        trackJS.gtag('event', 'TutorialStart_trigger', { type: 'RandomTutorial' });
                    },
                    closeCallback() {
                        that.setIsTutorial(false);
                        trackJS.mixpanel('TutorialEnd_trigger', { type: 'RandomTutorial' });
                        trackJS.gtag('event', 'TutorialEnd_trigger', { type: 'RandomTutorial' });
                    },
                    step_callback(node, IntroInfo) {
                        trackJS.mixpanel('TutorialStep_trigger', { type: 'RandomTutorial', index: IntroInfo.index });
                        trackJS.gtag('event', 'TutorialStep_trigger', { type: 'RandomTutorial', index: IntroInfo.index });
                    },
                };
                const step = [
                    {
                        // target: '.shortlist-box',
                        title: '新手教學',
                        intro: '恭喜您建立了一個範例抽獎活動',
                    },
                    {
                        target: '.candidate-box[data-index="5"] .candidate-wrapper',
                        title: '候選人',
                        intro: '每一個框框都是一個候選人',
                    },
                    {
                        target: '.candidate-box[data-index="5"] .candidate-wrapper .candidate-name',
                        title: '候選人是誰',
                        intro: '在這裡你可以呈現他的名字',
                    },
                    {
                        target: '.candidate-box[data-index="5"] .candidate-wrapper .candidate-pos',
                        title: '豐富他的資料',
                        intro: '雖然是非必要，但加上職稱感覺會更豐富',
                        beforeAction(Element, TutorialNode, $next) {
                            that.triggerModal({ key: 'Setting', close: true });
                            setTimeout(() => {
                                $next();
                            }, 10);
                        },
                    },
                    {
                        target: '.nav-link[rel="setting"]',
                        title: '你可以有你的風格',
                        intro: '在設定裡面可以設定屬於你的風格，接下來跟你介紹可以做得多客製化',
                        beforeAction(Element, TutorialNode, $next) {
                            $('#navbarCollapse').addClass('show');
                            setTimeout(() => {
                                $next();
                            }, 10);
                        },
                        afterAction(Element, TutorialNode, $next) {
                            $('#navbarCollapse').removeClass('show');
                            setTimeout(() => {
                                $next();
                            }, 10);
                        },
                    },
                    {
                        target: '#SettingBox .box-setting[rel="boxSize"]',
                        scrollTarget: '#SettingBox',
                        title: '候選區塊不滿意',
                        intro: '您可以在這邊設定區塊的寬高與間距',
                        beforeAction(Element, TutorialNode, $next) {
                            that.triggerModal({ key: 'Setting' });
                            setTimeout(() => {
                                document.querySelector('#SettingBox').scroll({ top: 0 });
                                $next();
                            }, 100);
                        },
                    },
                    {
                        target: '#SettingBox .box-setting[rel="fontSize"]',
                        scrollTarget: '#SettingBox',
                        title: '字太小嗎？',
                        intro: '人名與職稱都是文字大小都可以改',
                        beforeAction(Element, TutorialNode, $next) {
                            // that.triggerModal({ key: 'Setting' });
                            setTimeout(() => {
                                document.querySelector('#SettingBox').scroll({ top: 0 });
                                $next();
                            }, 100);
                        },
                    },
                    {
                        target: '#SettingBox .box-setting[rel="boxColor"]',
                        scrollTarget: '#SettingBox',
                        title: '顏色太醜',
                        intro: '區塊總共有三種狀態，每種狀態都有自己的顏色，當然您可以自由設定',
                        beforeAction(Element, TutorialNode, $next) {
                            // that.triggerModal({ key: 'Setting' });
                            setTimeout(() => {
                                document.querySelector('#SettingBox').scroll({ top: 0 });
                                $next();
                            }, 100);
                        },
                    },
                    {
                        target: '#SettingBox .clearAllBtn',
                        scrollTarget: '#SettingBox',
                        title: '玩夠了？',
                        intro: '如果你玩夠了我們呈現的範例抽獎，可以點擊這裡清楚所有資料重新開始',
                        beforeAction(Element, TutorialNode, $next) {
                            that.triggerModal({ key: 'Setting' });
                            setTimeout(() => {
                                document.querySelector('#SettingBox').scroll({ top: 0 });
                                $next();
                            }, 100);
                        },
                    },
                    {
                        title: '開放想法',
                        intro: '當然你也可以不用抽人，不侷限讓抽獎更多變化，一場有趣的抽獎活動就由你來建立。',
                        beforeAction(Element, TutorialNode, $next) {
                            that.triggerModal({ key: 'Setting', close: false });
                            setTimeout(() => {
                                $next();
                            }, 100);
                        },
                    },
                ];
                const tutorial1 = new Tutorial(step, config);
                tutorial1.run();
            }
        },
        triggerTutorial() {
            const that = this;
            const config = {
                offset: {
                    top: 60,
                    bottom: 60,
                },
                startCallback() {
                    that.setIsTutorial(true);
                    trackJS.mixpanel('TutorialStart_trigger', { type: 'Tutorial' });
                    trackJS.gtag('event', 'TutorialStart_trigger', { type: 'Tutorial' });
                },
                closeCallback() {
                    that.setIsTutorial(false);
                    trackJS.mixpanel('TutorialEnd_trigger', { type: 'Tutorial' });
                    trackJS.gtag('event', 'TutorialEnd_trigger', { type: 'Tutorial' });
                },
                step_callback(node, IntroInfo) {
                    trackJS.mixpanel('TutorialStep_trigger', { type: 'Tutorial', index: IntroInfo.index });
                    trackJS.gtag('event', 'TutorialStep_trigger', { type: 'Tutorial', index: IntroInfo.index });
                },
            };

            const randomCandidateNames = that.randomCandidateNames.split(',');
            const randomCandidatePos = that.randomCandidatePos.split(',');
            const randomPrize = that.randomPrize.split(',');

            const getRandomCandidateName = () => {
                const index = string.randRange(0, randomCandidateNames.length - 1);
                const name = randomCandidateNames.splice(index, 1);
                return name[0];
            };
            const getRandomCandidatePos = () => {
                const index = string.randRange(0, randomCandidatePos.length - 1);
                let pos = randomCandidatePos[index];
                if (pos.includes('_o')) {
                    pos = pos.replace('_o', '');
                    randomCandidatePos.splice(index, 1);
                }
                return pos;
            };

            const getRandomPrize = () => {
                const index = string.randRange(0, randomPrize.length - 1);
                const name = randomPrize.splice(index, 1);
                return name[0];
            };

            const step = [
                {
                    target: '',
                    title: '新手教學',
                    intro: '歡迎您使用 LuckyDraw 抽獎機，這是一個有趣又高彈性的抽獎機器，適合用在 公司活動尾牙也適合各大社群抽獎，到底該如何使用接下來告訴您。',
                },
                {
                    target: '',
                    title: '總是需要有人',
                    intro: '抽獎最重要的就是人，您的檯面上一個人都沒有怎麼抽呢？',
                },
                {
                    target: '.navbar .navbar-nav .nav-item .nav-link[rel="CandidateList"]',
                    title: '候選名單',
                    intro: '來這裡建立一批候選名單吧！',
                    beforeAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').addClass('show');
                        that.triggerModal({ key: 'CandidateList', close: false });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').removeClass('show');
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#CandidateListBox textarea[name="candidateListTextarea"]',
                    title: '輸入候選名單',
                    intro: '來這裡建立一批候選名單吧！<br>一行一個候選人，您可以輸入他的姓名與職稱（非必填）',
                    beforeAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').removeClass('show');
                        that.triggerModal({ key: 'CandidateList' });
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                    afterAction(Element, TutorialNode, $next) {
                    },
                },
                {
                    target: '#CandidateListBox textarea[name="candidateListTextarea"]',
                    title: '輸入候選名單',
                    intro: '就像這樣',
                    beforeAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            let candidateList = [];
                            for (let i = 0; i < string.randRange(10, 15); i += 1) {
                                candidateList.push(`${getRandomCandidateName()},${getRandomCandidatePos()}`);
                            }
                            candidateList = candidateList.join('\n');
                            $('#CandidateListBox textarea[name="candidateListTextarea"]').val(candidateList);
                            $('#CandidateListBox textarea[name="candidateListTextarea"]')[0].dispatchEvent(new Event('input'));
                            $next();
                        }, 100);
                    },
                    afterAction(Element, TutorialNode, $next) {
                    },
                },
                {
                    target: '#CandidateListBox .btn-primary',
                    title: '存起來吧',
                    intro: '既然寫好了存起來試試看',
                    beforeAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        $('#CandidateListBox .btn-primary').trigger('click');
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                },
                {
                    target: '.shortlist-box',
                    title: '候選名單',
                    intro: '候選名單建立好了，這些就是即將要被抽選的對象',
                    beforeAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                },
                {
                    target: '',
                    title: '獎品勒！？',
                    intro: '候選人建立好了，接下來我們要抽什麼呢？',
                },
                {
                    target: '.navbar .navbar-nav .nav-item .nav-link[rel="PrizeList"]',
                    title: '獎項名單',
                    intro: '你的活動想抽什麼都可以在這邊建立',
                    beforeAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').addClass('show');
                        that.triggerModal({ key: 'PrizeList', close: false });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').removeClass('show');
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#PrizeListBox #AddPrizeGroup',
                    title: '獎項名單',
                    intro: '需要建立一筆獎項資訊，除了獎項名稱外也可以設定此獎項的數量。',
                    scrollTarget: '#PrizeListBox',
                    beforeAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').removeClass('show');
                        document.querySelector('#PrizeListBox').scroll({ top: 0 });
                        that.triggerModal({ key: 'PrizeList' });
                        setTimeout(() => {
                            const AddButton = $('#PrizeListBox #AddPrize');
                            if (AddButton) {
                                AddButton.trigger('click');
                            }
                            $next();
                        }, 100);
                    },

                },
                {
                    target: '#PrizeListBox #AddPrizeGroup',
                    title: '獎項名單',
                    intro: '我來示範一次',
                    scrollTarget: '#PrizeListBox',
                    beforeAction(Element, TutorialNode, $next) {
                        document.querySelector('#PrizeListBox').scroll({ top: 0 });
                        const input = {
                            title: getRandomPrize(),
                            amount: string.randRange(3, 5),
                        };

                        for (const key in input) {
                            $(`#PrizeListBox #AddPrizeGroup input[name="${key}"]`).val(input[key]);
                            $(`#PrizeListBox #AddPrizeGroup input[name="${key}"]`)[0].dispatchEvent(new Event('input'));
                        }
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        $('#PrizeListBox #AddPrizeGroup .input-group-text').trigger('click');
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#PrizeListBox .prizeListGroup .handler',
                    title: '獎項名單',
                    intro: '你可以透過這個拖拉調整順序',
                    scrollTarget: '#PrizeListBox',
                    beforeAction(Element, TutorialNode, $next) {
                        document.querySelector('#PrizeListBox').scroll({ top: 0 });
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#PrizeListBox #AddPrize',
                    title: '獎項名單',
                    intro: '如果你還有其他獎項，可以點擊這邊再新增',
                    scrollTarget: '#PrizeListBox',
                    beforeAction(Element, TutorialNode, $next) {
                        document.querySelector('#PrizeListBox').scroll({ top: 0 });
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        that.triggerModal({ key: 'PrizeList', close: true });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '',
                    title: '刺激的來了',
                    intro: '候選項目跟獎項都設定好了，當然接下來是重頭戲抽獎！',
                    beforeAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '.navbar .navbar-nav .nav-item .nav-link[rel="GetLucky"]',
                    title: '該要抽獎',
                    intro: '點擊這邊選擇你的抽獎項目',
                    beforeAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').addClass('show');
                        that.triggerModal({ key: 'GetLucky', close: false });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').removeClass('show');
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#GetLuckyBox .get-lucky-list',
                    title: '選一個',
                    intro: '這裡是所有獎項的列表，包含了可抽數量與已抽數量',
                    scrollTarget: '#GetLuckyBox',
                    beforeAction(Element, TutorialNode, $next) {
                        that.triggerModal({ key: 'GetLucky' });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#GetLuckyBox .get-lucky-list .prizeInfo',
                    title: '選一個',
                    intro: '我們選這個來抽獎吧，用力抽下去',
                    scrollTarget: '#GetLuckyBox',
                    beforeAction(Element, TutorialNode, $next) {
                        that.triggerModal({ key: 'GetLucky' });
                        document.querySelector('#GetLuckyBox').scroll({ top: 0 });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        $('#GetLuckyBox .get-lucky-list .prizeInfo').trigger('click');
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '.shortlist',
                    title: '抽獎中',
                    intro: '動畫呈現抽獎情況，隨機選擇保證公平',
                    beforeAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                    waitToNextAction(Element, $next) {
                        that.waitToNextActionTimer = null;
                        that.waitToNextActionTimer = setInterval(() => {
                            if ($('#LuckyBox').is(':visible')) {
                                clearInterval(that.waitToNextActionTimer);
                                $next();
                            }
                        }, 500);
                    },
                },
                {
                    target: '#LuckyBox .lucky-info',
                    title: '抽中了！',
                    intro: '這裡呈現被抽中的候選人與中獎資訊',
                    scrollTarget: '#LuckyBox',
                    beforeAction(Element, TutorialNode, $next) {
                        document.querySelector('#LuckyBox').scroll({ top: 0 });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#LuckyBox .cancel',
                    title: '人不在',
                    intro: '抽到歸抽到，這人卻不在現場怎麼辦，點擊這裡取消這次抽獎',
                    scrollTarget: '#LuckyBox',
                    beforeAction(Element, TutorialNode, $next) {
                        document.querySelector('#LuckyBox').scroll({ top: 0 });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#LuckyBox .save',
                    title: '天選之人！',
                    intro: '確定就是這人了，把這候選人儲存起來！',
                    scrollTarget: '#LuckyBox',
                    beforeAction(Element, TutorialNode, $next) {
                        document.querySelector('#LuckyBox').scroll({ top: 0 });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        $('#LuckyBox .save').trigger('click');
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '.shortlist',
                    title: '完成',
                    intro: '您已經完成了一次抽獎，感覺很不錯吧！',
                },
                {
                    target: '.navbar .navbar-nav .nav-item .nav-link[rel="Result"]',
                    title: '抽獎結果',
                    intro: '很難統計抽獎結果嗎？點擊這裡來看抽獎結果',
                    beforeAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').addClass('show');
                        that.triggerModal({ key: 'Result', close: false });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').removeClass('show');
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#ResultBox .table tbody tr',
                    title: '中獎人',
                    intro: '這裡可以呈現中獎人資訊與得獎資訊！',
                    scrollTarget: '#ResultBox',
                    beforeAction(Element, TutorialNode, $next) {
                        that.triggerModal({ key: 'Result' });
                        setTimeout(() => {
                            document.querySelector('#ResultBox').scroll({ top: 0 });
                            $next();
                        }, 10);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#ResultBox .download-btn',
                    title: '下載',
                    intro: '中獎人太多不好管理，那就下載成為檔案吧！',
                    scrollTarget: '#ResultBox',
                    beforeAction(Element, TutorialNode, $next) {
                        document.querySelector('#ResultBox').scroll({ top: 0 });
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        that.triggerModal({ key: 'Result', close: true });
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    title: '接近尾聲',
                    intro: 'Lucky Draw 抽獎機的介紹也到了尾聲了，很開心你看到這邊。啊！突然想到似乎還有一些事情沒介紹',
                    beforeAction(Element, TutorialNode, $next) {
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                },
                {
                    target: '.nav-link[rel="setting"]',
                    title: '你可以有你的風格',
                    intro: '在設定裡面可以設定屬於你的風格，接下來跟你介紹可以做得多客製化',
                    beforeAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').addClass('show');
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                    afterAction(Element, TutorialNode, $next) {
                        $('#navbarCollapse').removeClass('show');
                        setTimeout(() => {
                            $next();
                        }, 10);
                    },
                },
                {
                    target: '#SettingBox .box-setting[rel="boxSize"]',
                    scrollTarget: '#SettingBox',
                    title: '候選區塊不滿意',
                    intro: '您可以在這邊設定區塊的寬高與間距',
                    beforeAction(Element, TutorialNode, $next) {
                        that.triggerModal({ key: 'Setting' });
                        setTimeout(() => {
                            document.querySelector('#SettingBox').scroll({ top: 0 });
                            $next();
                        }, 100);
                    },
                },
                {
                    target: '#SettingBox .box-setting[rel="fontSize"]',
                    scrollTarget: '#SettingBox',
                    title: '字太小嗎？',
                    intro: '人名與職稱都是文字大小都可以改',
                    beforeAction(Element, TutorialNode, $next) {
                        // that.triggerModal({ key: 'Setting' });
                        setTimeout(() => {
                            document.querySelector('#SettingBox').scroll({ top: 0 });
                            $next();
                        }, 100);
                    },
                },
                {
                    target: '#SettingBox .box-setting[rel="boxColor"]',
                    scrollTarget: '#SettingBox',
                    title: '顏色太醜',
                    intro: '區塊總共有三種狀態，每種狀態都有自己的顏色，當然您可以自由設定',
                    beforeAction(Element, TutorialNode, $next) {
                        // that.triggerModal({ key: 'Setting' });
                        setTimeout(() => {
                            document.querySelector('#SettingBox').scroll({ top: 0 });
                            $next();
                        }, 100);
                    },
                },
                {
                    target: '#SettingBox .clearAllBtn',
                    scrollTarget: '#SettingBox',
                    title: '展示即將結束',
                    intro: '可以點擊這裡清楚所有資料重新開始',
                    beforeAction(Element, TutorialNode, $next) {
                        that.triggerModal({ key: 'Setting' });
                        setTimeout(() => {
                            document.querySelector('#SettingBox').scroll({ top: 0 });
                            $next();
                        }, 100);
                    },
                },
                {
                    title: '開放想法',
                    intro: '當然你也可以不用抽人，不侷限讓抽獎更多變化，一場有趣的抽獎活動就由你來建立。',
                    beforeAction(Element, TutorialNode, $next) {
                        that.triggerModal({ key: 'Setting', close: false });
                        setTimeout(() => {
                            $next();
                        }, 100);
                    },
                },

            ];
            const tutorial1 = new Tutorial(step, config);
            tutorial1.run();
        },
    },
};
</script>
<style lang="scss" scoped></style>