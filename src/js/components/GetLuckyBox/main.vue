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
        return {};
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
            that.triggerModal({ key: 'GetLucky', close: true });
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
            setConfig: 'setConfig',
            saveToLocalStorage: 'saveToLocalStorage',
        }),
        ...mapActions(['prepareLuckyDraw']),
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

            // 呼叫 Action 執行所有檢查和狀態準備
            const result = that.prepareLuckyDraw(prizeInfo);

            if (result === true) {
                // 準備成功，關閉 Modal，等待 Enter 鍵
                that.triggerModal({ key: 'GetLucky', close: true });
            } else {
                // 準備失敗 (數量不足等)，Popup 警告訊息已在 prepareLuckyDraw Action 內處理 (或在組件內處理)
                // 這裡不再需要多餘的錯誤處理，因為 prepareLuckyDraw 會返回 false
            }
        },
    },
};
</script>
<style lang="scss" scoped></style>
