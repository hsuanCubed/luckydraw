<template>
    <div id="GetLuckyBox" ref="box" class="modal" tabindex="-1" role="dialog" data-backdrop="static"
        data-keyboard="false">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-vote-yea"></i>
                        選取獎項
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div v-if="needSetWebTitle" role="alert" class="alert alert-primary" style="flex: 0 0 auto;">
                        請先設定屬於您的抽獎活動名稱
                        <button class="btn btn-success btn-sm" @click="gotoSetWebTitle">立刻去</button>
                    </div>
                    <div class="get-lucky-list" :class="{ disabled: needSetWebTitle }">
                        <template v-if="prizeListByAward.length > 0">
                            <button v-for="prizeInfo in prizeListByAward" :key="prizeInfo.prize_sn" type="button"
                                class="btn btn-success btn-lg btn-block mb-3 prizeInfo"
                                :disabled="prizeInfo.amount <= prizeInfo.count" @click="getLucky(prizeInfo)">
                                <div class="row">
                                    <div class="col-9">
                                        {{ prizeInfo.title }} (每次{{ prizeInfo.drawCount || 1 }}人)
                                    </div>
                                    <div class="col-3">
                                        [{{ prizeInfo.count }} / {{ prizeInfo.amount }}]
                                    </div>
                                </div>
                            </button>
                        </template>
                        <template v-else>
                            <h4 class="text-center p-3">
                                您尚未建立獎項，無法進行抽獎
                            </h4>
                            <button class="btn btn-warning btn-block btn-lg" @click="editPrizeList">
                                建立獎項
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';
import { Tutorial, popup, trackJS } from 'lib/common/util';

const audio = {
    ding: new Audio('./dist/mp3/ding.mp3'),
    winner: [
        // new Audio("./dist/mp3/winner1.mp3"),
        new Audio('./dist/mp3/winner2.mp3'),
    ],
};

// import $ from 'jquery';
// import 'bootstrap';

// import 'app';
// import { string, jsVars, popup, trackJS, localStorage, ppPanel } from 'lib/common/util';

export default {
    components: {},
    filters: {},
    props: {},
    data() {
        return {
            ValidateCandidateSN: null,
            ValidSNRandomRange: 0,

            defaultRunTime: 50,
            runTime: 0,
            orgRunTime: 0,

            // 用於儲存多個中獎者的 SN
            winnerCandidateSNList: [],
        };
    },
    computed: {
        ...mapGetters([
            'config',
            'triggerOpenGetLucky',
            'prizeListByAward',
            'candidateList',
            'haveAwardCandidateSN',
            'getLuckyWaitTimeArr',
        ]),
        needSetWebTitle() {
            const that = this;
            let needSetWebTitle = false;
            if (!that.config.isTutorial && (!that.config.webTitle || ['Lucky Draw', 'LuckyDraw', 'luckydraw'].includes(that.config.webTitle))) {
                needSetWebTitle = true;
            }
            return needSetWebTitle;
        },
    },
    watch: {
        triggerOpenGetLucky: {
            immediate: true,
            handler() {
                const that = this;
                if (that.triggerOpenGetLucky) {
                    $(that.$refs.box).modal('show');
                } else {
                    $(that.$refs.box).modal('hide');
                }
            },
        },
    },
    created() { },
    mounted() {
        const that = this;
        $(that.$refs.box).bind('shown.bs.modal', () => {
            that.award = '';
            trackJS.mixpanel('GetLuckyOpen_click');
            trackJS.gtag('event', 'GetLuckyOpen_click');
        });
        $(that.$refs.box).bind('hidden.bs.modal', () => {
            trackJS.mixpanel('GetLuckyClose_click');
            trackJS.gtag('event', 'GetLuckyClose_click');
        });

        if (that.triggerOpenGetLucky) {
            $(that.$refs.box).modal('show');
        } else {
            $(that.$refs.box).modal('hide');
        }
    },
    updated() { },
    destroyed() { },
    methods: {
        ...mapMutations({
            setFavicon: 'setFavicon',
            setFocusCandidateSN: 'setFocusCandidateSN',
            setFocusPrizeSN: 'setFocusPrizeSN',
            triggerModal: 'triggerModal',
        }),
        gotoSetWebTitle() {
            const that = this;
            // that.triggerModal({ key: 'GetLucky', close: true });
            // setTimeout(() => {
            //     that.triggerModal({ key: 'Setting' });
            // }, 100);

            that.triggerModal({ key: 'GetLucky', close: true });
            const config = {
                offset: {
                    top: 60,
                    bottom: 60,
                },
                startCallback() {
                    trackJS.mixpanel('TutorialStart_trigger', { type: 'WebsiteTitle' });
                    trackJS.gtag('event', 'TutorialStart_trigger', { type: 'WebsiteTitle' });
                },
                closeCallback() {
                    trackJS.mixpanel('TutorialEnd_trigger', { type: 'WebsiteTitle' });
                    trackJS.gtag('event', 'TutorialEnd_trigger', { type: 'WebsiteTitle' });
                },
                step_callback(node, IntroInfo) {
                    trackJS.mixpanel('TutorialStep_trigger', { type: 'WebsiteTitle', index: IntroInfo.index });
                    trackJS.gtag('event', 'TutorialStep_trigger', { type: 'WebsiteTitle', index: IntroInfo.index });
                },
            };

            const step = [
                {
                    target: '#SettingBox input[name="webTitle"]',
                    title: '獨特的抽獎',
                    intro: '在抽獎前，設定一個屬於您的獨特抽獎活動名稱。',
                    beforeAction(Element, TutorialNode, $next) {
                        that.triggerModal({ key: 'Setting' });
                        setTimeout(() => {
                            $next();
                        }, 500);
                    },
                },
            ];
            const tutorial1 = new Tutorial(step, config);
            tutorial1.run();
        },
        editPrizeList() {
            const that = this;
            $(this.$refs.box).modal('hide');
            that.triggerModal({ key: 'PrizeList' });
        },
        getLucky(prizeInfo) {
            const that = this;
            trackJS.mixpanel('GetLuckyChoosePrize_click', prizeInfo);
            trackJS.gtag('event', 'GetLuckyChoosePrize_click', prizeInfo);

            const drawCount = prizeInfo.drawCount || 1;
            const remainingAmount = prizeInfo.amount - prizeInfo.count;

            if (remainingAmount >= drawCount) {
                const { haveAwardCandidateSN } = that;
                let ValidateCandidateSN = []; // 所有合法候選人的 SN

                that.candidateList.forEach((candidateInfo) => {
                    if (candidateInfo.del === false && !haveAwardCandidateSN.includes(candidateInfo.sn)) {
                        ValidateCandidateSN.push(candidateInfo.sn);
                    }
                });

                if (ValidateCandidateSN.length >= drawCount) {

                    // 隨機打亂候選人名單
                    // 使用 Fisher-Yates (Knuth) shuffle 算法打亂陣列，確保隨機性
                    for (let i = ValidateCandidateSN.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [ValidateCandidateSN[i], ValidateCandidateSN[j]] = [ValidateCandidateSN[j], ValidateCandidateSN[i]];
                    }

                    // 從打亂後的名單中取出 drawCount 數量的得獎者
                    const winnersSN = ValidateCandidateSN.slice(0, drawCount);

                    // 將抽出的多個得獎者 SN 存入 data 屬性
                    that.winnerCandidateSNList = winnersSN;

                    // 將所有合法的候選人（用於滾動視覺效果）存入
                    that.ValidateCandidateSN = ValidateCandidateSN;
                    that.ValidSNRandomRange = Math.pow(10, (`${that.ValidateCandidateSN.length}`).length);

                    $(that.$refs.box).modal('hide');

                    that.runTime = that.config.defaultRunTime;
                    that.orgRunTime = that.config.defaultRunTime;
                    trackJS.mixpanel('GetLuckyChoosePrizeRun_trigger', prizeInfo);
                    trackJS.gtag('event', 'GetLuckyChoosePrizeRun_trigger', prizeInfo);

                    // 在開始滾動前，先將 FocusCandidateSN 設為第一個抽中的人 (用於滾動結束後的第一個結果)
                    that.setFocusCandidateSN(winnersSN[0]);
                    that.setFocusPrizeSN(prizeInfo.prize_sn);

                    // 開始滾動
                    that.luckyAction();

                } else {
                    // ... (候選人不足的錯誤訊息保持不變)
                    trackJS.mixpanel('GetLuckyChoosePrizeError_trigger', { error: 'not enough candidates' });
                    trackJS.gtag('event', 'GetLuckyChoosePrizeError_trigger', { error: 'not enough candidates' });
                    popup.warning({
                        html: `候選人不足，此獎項需要 ${drawCount} 人，目前只有 ${ValidateCandidateSN.length} 人可抽`,
                    });
                }
            } else {
                // ... (剩餘數量不足的錯誤訊息保持不變)
                trackJS.mixpanel('GetLuckyChoosePrizeError_trigger', { error: 'not enough' });
                trackJS.gtag('event', 'GetLuckyChoosePrizeError_trigger', { error: 'not enough' });
                popup.warning({
                    html: `此獎項剩餘數量不足，需要 ${drawCount} 個名額，但只剩 ${remainingAmount} 個`,
                });
            }
        },
        luckyAction() {
            const that = this;

            // 滾動過程依然隨機選取一位候選人來做視覺展示
            const sn_index = parseInt((Math.random() * 100000) % that.ValidateCandidateSN.length);
            that.setFocusCandidateSN(that.ValidateCandidateSN[sn_index]); // 滾動過程中的隨機顯示

            audio.ding.play();
            that.setFavicon('run');
            const { getLuckyWaitTimeArr } = that;

            if (that.runTime > 0 && that.ValidateCandidateSN.length > 1) {
                // ... (滾動計時邏輯保持不變)
                let waitTime = 0;
                if (that.orgRunTime < 10) {
                    waitTime = 100;
                } else {
                    for (const index in getLuckyWaitTimeArr) {
                        if (that.runTime >= getLuckyWaitTimeArr[index].limit) {
                            waitTime = getLuckyWaitTimeArr[index].wait;
                            break;
                        }
                    }
                }
                console.log('waitTime', waitTime);
                that.runTime -= 1;
                clearTimeout(that.luckyActionTimer);
                that.luckyActionTimer = setTimeout(() => {
                    audio.ding.pause();
                    audio.ding.currentTime = 0;
                    that.luckyAction();
                }, waitTime);
            } else {
                setTimeout(() => {
                    trackJS.mixpanel('GetLuckyChoosePrizeStop_trigger');
                    trackJS.gtag('event', 'GetLuckyChoosePrizeStop_trigger');

                    // 停止滾動時，將 focus Candidate SN 設定為所有抽中的人
                    that.setFocusCandidateSN(that.winnerCandidateSNList);

                    that.triggerModal({ key: 'Lucky' });

                    const index = parseInt((Math.random() * 10) % audio.winner.length);
                    // audio.winner[index].play();
                }, 600);
            }
        },
    },
};
</script>
<style lang="scss" scoped></style>
