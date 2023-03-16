import { debounceCreator, findCompany, searchCompany } from './utils.js'

class TipsForOrganizations extends HTMLElement {
    constructor() {
        super()
        
        this.attachShadow({ mode: 'open' })
        
        const template = document.createElement('template')
        template.innerHTML = `
            <link rel="stylesheet" href="./tipsForOrganizations/tipsForOrganizations.css" />
            <fieldset class="company-information__container">
                <label class="field">
                    Компания или ИП
                    <div class="field__company">
                        <input class="filed__input" type="text" name="company" id="company">
                        <div class="field__company-dropdown"></div>
                    </div>
                </label>
                <p>Организация (LEGAL)</p>
                <label class="field">
                    Краткое нименование
                    <input class="filed__input" type="text" name="shortName" id="short-name">
                </label>
                <label class="field"> 
                    Полное наименование
                    <input class="filed__input" type="text" name="fullName" id="full-name">
                </label>
                <label class="field">
                    ИНН / КПП
                    <input class="filed__input" type="text" name="inn" id="inn">
                </label>
                <label class="field">
                    Адрес
                    <input class="filed__input" type="text" name="address" id="address">
                </label>
            </fieldset>
        `
        
        this.shadowRoot.appendChild(template.content.cloneNode(true))
    }

    connectedCallback() {
        this.inputsList = this.shadowRoot.querySelectorAll('.filed__input')
        this.dropdown = this.shadowRoot.querySelector('.field__company-dropdown')
        this.innInput = this.shadowRoot.querySelector('#inn')
        this.companyInput = this.shadowRoot.querySelector('#company')

        // привязка контекста
        this.dropdownClickHandler = this.dropdownClickHandler.bind(this)
        this.findOrganizationsByInn = this.findOrganizationsByInn.bind(this)
        this.findOrganizationsByName = this.findOrganizationsByName.bind(this)


        const companyEventHandler = debounceCreator(this.findOrganizationsByName)

        this.innInput.addEventListener('keydown', this.findOrganizationsByInn)
        this.companyInput.addEventListener('input', e => companyEventHandler(e.target.value))
    }

    async findOrganizationsByInn(event) {
        if (event.key === 'Enter') {
            try {
                const result = await searchCompany(event.target.value, 'inn')
                if (result) this.pasteResults(result)
            } catch (error) {
                throw new Error(error)
            }
        }
    }

    async findOrganizationsByName(value) {
        if (!value) {
            this.hideCompanyTips()
            return
        }
        try {
            this.companies = await searchCompany(value)
            if (this.companies.length) this.showCompanyTips()
        } catch (error) {
            throw new Error(error)
        }
    }

    pasteResults(result) {
        for (let i = 0; i < this.inputsList.length; i++) {
            if (this.inputsList[i].name === 'inn' && result.kpp) {
                this.inputsList[i].value = `${result.inn} / ${result.kpp}`
            } else {
                this.inputsList[i].value = result[this.inputsList[i].name]
            }
        }
    }

    showCompanyTips() {
        this.dropdown.style.display = 'block'
        this.dropdown.innerHTML = ''
        document.addEventListener('click', this.dropdownClickHandler)
        for (let i = 0; i < this.companies.length; i++) {
            this.dropdown.insertAdjacentHTML(
                'beforeend', 
                `<button class="dropdown__item" data-inn="${this.companies[i].data.inn}">${this.companies[i].value}</button>`
            )
        }
    }

    dropdownClickHandler(event) {
        const target = event.composedPath()[0];
        if (target.dataset.inn) {
            const company = findCompany(this.companies, target.dataset.inn)
            this.pasteResults(company)
        }
        
        this.hideCompanyTips()
    }

    hideCompanyTips() {
        this.dropdown.style.display = 'none'
        document.removeEventListener('click', this.dropdownClickHandler)
    }
}

customElements.define('tips-for-organizations', TipsForOrganizations)