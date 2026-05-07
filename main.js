// State Management
class AppState {
    constructor() {
        this.questions = JSON.parse(localStorage.getItem('questions')) || [];
        // Track IDs of questions created on this device/browser
        this.myQuestionIds = JSON.parse(localStorage.getItem('myQuestionIds')) || [];
        this.listeners = [];
    }

    addQuestion(context, situationA, situationB, showGender, genderA, genderB) {
        const newQuestion = {
            id: crypto.randomUUID(),
            context,
            situationA,
            situationB,
            showGender,
            genderA,
            genderB,
            votesA: 0,
            votesB: 0,
            totalVotes: 0,
            createdAt: new Date().toISOString(),
            voted: false
        };
        this.questions.unshift(newQuestion);
        this.myQuestionIds.push(newQuestion.id);
        this.save();
        this.notify();
    }

    vote(questionId, option) {
        const index = this.questions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            if (this.questions[index].voted) return; // Already voted
            
            if (option === 'A') this.questions[index].votesA++;
            else this.questions[index].votesB++;
            this.questions[index].totalVotes++;
            this.questions[index].voted = true;
            this.save();
            this.notify();
        }
    }

    deleteQuestion(questionId) {
        this.questions = this.questions.filter(q => q.id !== questionId);
        this.myQuestionIds = this.myQuestionIds.filter(id => id !== questionId);
        this.save();
        this.notify();
    }

    isMyQuestion(questionId) {
        return this.myQuestionIds.includes(questionId);
    }

    save() {
        localStorage.setItem('questions', JSON.stringify(this.questions));
        localStorage.setItem('myQuestionIds', JSON.stringify(this.myQuestionIds));
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(l => l(this.questions));
    }
}

const state = new AppState();

// Web Components
class AppHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const template = document.getElementById('app-header-template');
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewId = e.currentTarget.dataset.view;
                this.switchView(viewId);
            });
        });
    }

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.remove('hidden');
        
        this.shadowRoot.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.view === viewId);
        });

        if (viewId === 'vote-view') {
            const voteList = document.querySelector('vote-list');
            if (voteList && typeof voteList.render === 'function') {
                voteList.render();
            }
        }
    }
}

class QuestionForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const template = document.getElementById('question-form-template');
        const styleLink = document.createElement('link');
        styleLink.setAttribute('rel', 'stylesheet');
        styleLink.setAttribute('href', 'style.css');
        this.shadowRoot.appendChild(styleLink);
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
        this.genderA = null;
        this.genderB = null;
    }

    connectedCallback() {
        const showGenderCheckbox = this.shadowRoot.getElementById('show-gender');
        const wrapperA = this.shadowRoot.getElementById('gender-a-wrapper');
        const wrapperB = this.shadowRoot.getElementById('gender-b-wrapper');

        showGenderCheckbox.addEventListener('change', () => {
            const isChecked = showGenderCheckbox.checked;
            wrapperA.classList.toggle('hidden-feature', !isChecked);
            wrapperB.classList.toggle('hidden-feature', !isChecked);
            if (!isChecked) {
                this.genderA = null;
                this.genderB = null;
                this.shadowRoot.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
            }
        });

        this.shadowRoot.querySelectorAll('.gender-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const isPartyA = btn.parentElement.id === 'gender-a-wrapper';
                const gender = btn.dataset.gender;

                btn.parentElement.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (isPartyA) this.genderA = gender;
                else this.genderB = gender;
            });
        });

        this.shadowRoot.getElementById('submit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const context = this.shadowRoot.getElementById('situation-context').value;
            const situationA = this.shadowRoot.getElementById('situation-a').value;
            const situationB = this.shadowRoot.getElementById('situation-b').value;
            const showGender = showGenderCheckbox.checked;

            if (showGender && (!this.genderA || !this.genderB)) {
                alert('A와 B의 성별을 모두 선택해주세요!');
                return;
            }

            state.addQuestion(context, situationA, situationB, showGender, this.genderA, this.genderB);
            
            this.shadowRoot.getElementById('submit-form').reset();
            this.genderA = null;
            this.genderB = null;
            this.shadowRoot.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
            wrapperA.classList.add('hidden-feature');
            wrapperB.classList.add('hidden-feature');
            
            document.querySelector('app-header').switchView('vote-view');
        });
    }
}

class VoteList extends HTMLElement {
    constructor() {
        super();
        this.cardMap = new Map();
    }

    connectedCallback() {
        state.subscribe(() => this.render());
        this.render();
    }

    render() {
        const questions = state.questions;
        
        if (questions.length === 0) {
            this.innerHTML = '<div class="card text-center"><p>아직 등록된 질문이 없습니다. 첫 번째 질문을 남겨보세요!</p></div>';
            this.cardMap.clear();
            return;
        }

        // Remove the empty message if it exists
        if (this.querySelector('.card.text-center')) {
            this.innerHTML = '';
        }

        const currentIds = new Set(questions.map(q => q.id));

        // Remove cards that are no longer in state
        for (const [id, card] of this.cardMap.entries()) {
            if (!currentIds.has(id)) {
                card.remove();
                this.cardMap.delete(id);
            }
        }

        // Add or update cards
        questions.forEach((q, index) => {
            let card = this.cardMap.get(q.id);
            if (!card) {
                card = document.createElement('vote-card');
                this.cardMap.set(q.id, card);
                card.classList.add('fade-in');
            }
            
            // Only update if data changed or it's new
            if (card.question !== q) {
                card.question = q;
            }

            // Maintain order: move to correct position if needed
            const expectedChild = this.children[index];
            if (expectedChild !== card) {
                this.insertBefore(card, expectedChild || null);
            }
        });
    }
}

class VoteCard extends HTMLElement {
    get question() {
        return this._question;
    }

    set question(val) {
        const oldVoted = this._question?.voted;
        this._question = val;
        this.render(oldVoted);
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const template = document.getElementById('vote-card-template');
        const styleLink = document.createElement('link');
        styleLink.setAttribute('rel', 'stylesheet');
        styleLink.setAttribute('href', 'style.css');
        this.shadowRoot.appendChild(styleLink);
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    render(oldVoted = false) {
        const q = this._question;
        if (!q) return;

        this.shadowRoot.querySelector('.text-context').textContent = q.context || '상황 설명 없음';
        this.shadowRoot.querySelector('.text-a').textContent = q.situationA;
        this.shadowRoot.querySelector('.text-b').textContent = q.situationB;
        this.shadowRoot.querySelector('.gender-info').textContent = q.showGender ? '성별 정보 공개됨' : '익명';

        const tagA = this.shadowRoot.querySelector('.tag-a');
        const tagB = this.shadowRoot.querySelector('.tag-b');

        if (q.showGender) {
            tagA.textContent = q.genderA;
            tagA.classList.remove('hidden');
            tagB.textContent = q.genderB;
            tagB.classList.remove('hidden');
        } else {
            tagA.classList.add('hidden');
            tagB.classList.add('hidden');
        }

        const btnA = this.shadowRoot.querySelector('.btn-vote-a');
        const btnB = this.shadowRoot.querySelector('.btn-vote-b');

        if (q.voted) {
            // Only animate if it's the first time voting or if we are re-rendering a voted card
            this.showResults(!oldVoted);
        } else {
            this.shadowRoot.querySelector('.vote-actions').classList.remove('hidden');
            this.shadowRoot.querySelector('.results-container').classList.add('hidden');
            btnA.onclick = () => this.handleVote('A');
            btnB.onclick = () => this.handleVote('B');
        }

        // Ownership-based delete visibility
        const deleteBtn = this.shadowRoot.querySelector('.delete-btn');
        if (state.isMyQuestion(q.id)) {
            deleteBtn.classList.remove('hidden');
            deleteBtn.onclick = () => {
                if (confirm('이 질문을 정말 삭제하시겠습니까?')) {
                    state.deleteQuestion(q.id);
                }
            };
        } else {
            deleteBtn.classList.add('hidden');
        }
    }

    handleVote(option) {
        state.vote(this._question.id, option);
    }

    showResults(animate = true) {
        const q = this._question;
        const results = this.shadowRoot.querySelector('.results-container');
        const actions = this.shadowRoot.querySelector('.vote-actions');
        
        actions.classList.add('hidden');
        results.classList.remove('hidden');

        const percA = q.totalVotes > 0 ? Math.round((q.votesA / q.totalVotes) * 100) : 0;
        const percB = 100 - percA;

        const barA = this.shadowRoot.querySelector('.bar-a');
        const barB = this.shadowRoot.querySelector('.bar-b');
        
        if (animate) {
            barA.style.width = '0%';
            barB.style.width = '0%';
            setTimeout(() => {
                this.updateBar(barA, percA);
                this.updateBar(barB, percB);
            }, 50);
        } else {
            this.updateBar(barA, percA);
            this.updateBar(barB, percB);
        }

        this.shadowRoot.querySelector('.total-votes-text').textContent = `총 투표 수: ${q.totalVotes}`;
    }

    updateBar(bar, percentage) {
        bar.style.width = `${percentage}%`;
        bar.textContent = percentage > 0 ? `${percentage}%` : '';
        // Add accessibility label
        bar.setAttribute('aria-valuenow', percentage);
    }
}

customElements.define('app-header', AppHeader);
customElements.define('question-form', QuestionForm);
customElements.define('vote-list', VoteList);
customElements.define('vote-card', VoteCard);
