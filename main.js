// State Management
class AppState {
    constructor() {
        this.questions = JSON.parse(localStorage.getItem('questions')) || [];
        this.listeners = [];
    }

    addQuestion(context, situationA, situationB, showGender) {
        const newQuestion = {
            id: crypto.randomUUID(),
            context,
            situationA,
            situationB,
            showGender,
            votesA: 0,
            votesB: 0,
            totalVotes: 0,
            createdAt: new Date().toISOString(),
            voted: false
        };
        this.questions.unshift(newQuestion);
        this.save();
        this.notify();
    }

    vote(questionId, option) {
        const index = this.questions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            if (option === 'A') this.questions[index].votesA++;
            else this.questions[index].votesB++;
            this.questions[index].totalVotes++;
            this.questions[index].voted = true;
            this.save();
            this.notify();
        }
    }

    save() {
        localStorage.setItem('questions', JSON.stringify(this.questions));
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
                const viewId = e.target.dataset.view;
                this.switchView(viewId);
                
                this.shadowRoot.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    switchView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
        
        if (viewId === 'vote-view') {
            document.querySelector('vote-list').render();
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
    }

    connectedCallback() {
        this.shadowRoot.getElementById('submit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const context = this.shadowRoot.getElementById('situation-context').value;
            const situationA = this.shadowRoot.getElementById('situation-a').value;
            const situationB = this.shadowRoot.getElementById('situation-b').value;
            const showGender = this.shadowRoot.getElementById('show-gender').checked;

            state.addQuestion(context, situationA, situationB, showGender);
            
            this.shadowRoot.getElementById('submit-form').reset();
            
            document.querySelector('app-header').switchView('vote-view');
            const navBtn = document.querySelector('app-header').shadowRoot.querySelector('[data-view="vote-view"]');
            navBtn.click();
        });
    }
}

class VoteList extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        state.subscribe(() => this.render());
        this.render();
    }

    render() {
        this.innerHTML = '';
        if (state.questions.length === 0) {
            this.innerHTML = '<div class="card text-center"><p>아직 등록된 질문이 없습니다. 첫 번째 질문을 남겨보세요!</p></div>';
            return;
        }

        state.questions.forEach(q => {
            const card = document.createElement('vote-card');
            card.question = q;
            card.classList.add('fade-in');
            this.appendChild(card);
        });
    }
}

class VoteCard extends HTMLElement {
    set question(val) {
        this._question = val;
        this.render();
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

    render() {
        const q = this._question;
        this.shadowRoot.querySelector('.text-context').textContent = q.context || '상황 설명 없음';
        this.shadowRoot.querySelector('.text-a').textContent = q.situationA;
        this.shadowRoot.querySelector('.text-b').textContent = q.situationB;
        this.shadowRoot.querySelector('.gender-info').textContent = q.showGender ? '성별 정보 공개됨' : '익명';

        const btnA = this.shadowRoot.querySelector('.btn-vote-a');
        const btnB = this.shadowRoot.querySelector('.btn-vote-b');

        if (q.voted) {
            this.showResults();
        } else {
            btnA.onclick = () => this.handleVote('A');
            btnB.onclick = () => this.handleVote('B');
        }
    }

    handleVote(option) {
        state.vote(this._question.id, option);
        this.showResults();
    }

    showResults() {
        const q = this._question;
        const results = this.shadowRoot.querySelector('.results-container');
        const actions = this.shadowRoot.querySelector('.vote-actions');
        
        actions.classList.add('hidden');
        results.classList.remove('hidden');

        const percA = q.totalVotes > 0 ? Math.round((q.votesA / q.totalVotes) * 100) : 0;
        const percB = 100 - percA;

        const barA = this.shadowRoot.querySelector('.bar-a');
        const barB = this.shadowRoot.querySelector('.bar-b');
        
        setTimeout(() => {
            barA.style.width = `${percA}%`;
            barA.textContent = `${percA}%`;
            barB.style.width = `${percB}%`;
            barB.textContent = `${percB}%`;
        }, 50);

        this.shadowRoot.querySelector('.total-votes-text').textContent = `총 투표 수: ${q.totalVotes}`;
    }
}

customElements.define('app-header', AppHeader);
customElements.define('question-form', QuestionForm);
customElements.define('vote-list', VoteList);
customElements.define('vote-card', VoteCard);
