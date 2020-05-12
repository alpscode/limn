const { VueHammer } = window.vue2Hammer;

Vue.use(Vuex);
Vue.use(VueLazyload);
Vue.use(VueHammer);

const store = new Vuex.Store({
    state: {
        history: [],
        location: "/usermedia",
        members: [],
        ordered: [],
        currentVal: 0,
        maxw: 0,
        maxh: 0
    },
    getters: {
        history: state => state.history,
        location: state => state.location,
        members: state => state.members,
        ordered: state => state.ordered,
        currentVal: state => state.currentVal,
        maxw: state => state.maxw,
        maxh: state => state.maxh,
        image: state => {
            if (state.members.length > 0) {
                if (state.members[state.currentVal]['type'] == 'file') {
                    return state.members[state.currentVal]['src'] + '&width=' + state.maxw + '&height=' + state.maxh
                }
                else {
                    return ''
                }
            }
            else {
                return ''
            }
        },
        imgdetails: state => {
            if (store.getters.image !== "") {
                return 'Image Index: ' + state.currentVal + ', src: ' + state.members[state.currentVal]['src']
            }
            else { return '' }
        }
    },
    mutations: {
        setLocation(state, value) {
            state.history.push(state.location);
            state.location = value;
            state.currentVal = 0;
        },
        updateMembers(state, size) {
            axios({
                method: 'get',
                url: '/content?dir=' + state.location + '&size=' + size
            })
                .then((response) => {
                    if (response.status === 200) {
                        state.members = response.data;
                        state.ordered = response.data;
                    }
                })
            state.currentVal = 0;
        },
        goBack(state) {
            if (state.history.length >= 1) {
                parent = state.history.pop();
                state.location = parent;
            }
            state.currentVal = 0;
        },
        shuffleMembers(state) {
            arr = [...state.members];
            for (let i = arr.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            state.members = arr;
        },
        setImage(state, payload) {
            state.currentVal = parseInt(payload.index);
            state.maxw = payload.w;
            state.maxh = payload.h;
        },
        showPrev(state) {
            newval = parseInt(state.currentVal) - 1;
            if (newval < 0) {
                newval = state.members.length - 1;
            }
            state.currentVal = newval;
        },
        showNext(state) {
            newval = parseInt(state.currentVal) + 1;
            if (newval >= state.members.length) {
                newval = 0;
            }
            state.currentVal = newval;
        }
    },
    actions: {}
});

var breadcrumb = new Vue({
    el: "#breadcrumbs",
    store
});

var imgViewer = new Vue({
    el: "#img-viewer",
    store,
    data: {
        isHidden: true,
    },
    created() {
        window.addEventListener('keydown', this.handleKeys);
    },
    destroyed() {
        window.removeEventListener('keydown', this.handleKeys);
    },
    methods: {
        openModal: function (event) {
            this.isHidden = false;
        },
        closeModal: function (event) {
            this.isHidden = true;
        },
        handleKeys: function (event) {
            if (!this.isHidden) {
                if (event.keyCode == 39) { // right arrow
                    this.$store.commit("showNext");
                    this.$forceUpdate();
                } else if (event.keyCode == 37) { // left arrow
                    this.$store.commit("showPrev");
                    this.$forceUpdate();
                } else if (event.keyCode == 27) { // ESC key
                    this.closeModal();
                }
            }

        },
        onSwipe(e) {
            console.log(e);
            if (e.direction === 2){
                this.$store.commit("showNext");
                this.$forceUpdate();
            }
            else if (e.direction === 4) {
                this.$store.commit("showPrev");
                this.$forceUpdate();
            }
        }
        // ,
        // onSwipeRight() {
        //     this.$store.commit("showPrev");
        //     this.$forceUpdate();
        // }
    }
})

var appArea = new Vue({
    el: "#vueapp",
    store,
    created: function () {
        var maxw = document.getElementsByClassName('container')[0].clientWidth;
        this.$store.commit("updateMembers", maxw);
    },
    methods: {
        navigate: (event) => {
            box = event.target.closest(".imgcard-directory");
            maxw = box.clientWidth;
            if (box.dataset.type == "directory") {
                store.commit("setLocation", box.dataset.loc);
                store.commit("updateMembers", maxw);
            } else {
                console.log("it is a file!")
            }
        },
        openImg: function (event) {
            index = event.target.closest('.imgcard-content').dataset.index;
            maxw = document.getElementsByClassName('container')[0].clientWidth
            maxh = window.innerHeight;
            this.$store.commit("setImage", { index: index, w: maxw, h: maxh });
            imgViewer.openModal();
            imgViewer.$forceUpdate();
        }
    }
});

var buttonArea = new Vue({
    el: "#topbar",
    store,
    methods: {
        goBack: () => {
            store.commit("goBack");
            maxw = document.getElementsByClassName('imgcard')[0].clientWidth;
            store.commit("updateMembers", maxw);
        },
        shuffleMembers: () => {
            store.commit("shuffleMembers");
            appArea.$forceUpdate();
        },
        startViewer: function () {
            if (this.$store.getters.maxw === undefined || this.$store.getters.maxw === 0) {
                maxw = document.getElementsByClassName('container')[0].clientWidth
                maxh = window.innerHeight;
                this.$store.commit("setImage", { index: 0, w: maxw, h: maxh });
            }
            imgViewer.openModal();
        }
    }
})


