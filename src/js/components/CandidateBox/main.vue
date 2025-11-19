<template>
    <div v-if="!!candidateInfo" class="candidate-box" :class="{
        // 檢查 SN 陣列是否包含當前候選人的 SN
        focus: Array.isArray(focusCandidateSN) && focusCandidateSN.includes(candidateInfo.sn),
    }" :data-index="candidateIndex">
        <div class="candidate-wrapper" :style="{
            width: config.boxWidth + 'px',
            height: config.boxHeight + 'px',
            margin: `${config.boxMV}px ${config.boxMH}px`,
            background: boxColor
        }">
            <div class="candidate-name" :style="{
                'font-size': config.titleSize + 'px'
            }">
                {{ candidateInfo.name }}
            </div>
            <div class="candidate-pos" :style="{
                'font-size': config.subtitleSize + 'px'
            }">
                {{ candidateInfo.pos }}
            </div>
        </div>
    </div>
</template>
<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';

// import $ from 'jquery';
// import 'bootstrap';

// import 'app';
// import { string, jsVars, popup, trackJS, localStorage, ppPanel } from 'lib/common/util';

export default {
    components: {},
    filters: {},
    props: {
        candidateIndex: {
            type: [Number],
            default: null,
        },
        candidateInfo: {
            type: [Object],
            default: null,
        },
    },
    data() {
        return {};
    },
    computed: {
        ...mapGetters([
            'focusCandidateSN',
            'haveAwardCandidateSN',
            'config',
        ]),

        boxColor() {
            const that = this;
            let color = that.config.defaultColor;

            if (that.haveAwardCandidateSN.includes(that.candidateInfo.sn)) {
                color = that.config.doneColor;
            }

            // 【檢查 focusCandidateSN 是否包含當前 SN】
            else if (Array.isArray(that.focusCandidateSN) && that.focusCandidateSN.includes(that.candidateInfo.sn)) {
                color = that.config.focusColor;
            }

            return color;
        },
    },
    watch: {
    },
    created() { },
    mounted() {
    },
    updated() { },
    destroyed() { },
    methods: {
        ...mapActions({}),
        ...mapMutations({}),
    },
};
</script>
<style lang="scss" scoped></style>