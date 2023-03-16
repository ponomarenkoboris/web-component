const debounceCreator = (callback, ms = 200) => {
    let timeout;

    return function(e) {
        clearTimeout(timeout)
        timeout = setTimeout(() => callback(e), ms)
    }
}

const findCompany = (companies, inn) => {
    const company = companies.find(company => company.data.inn === inn)
    return company ?
        { 
            company: company?.value || '', 
            inn: company?.data.inn || '', 
            kpp: company?.data.kpp || '', 
            address: company?.data.address.value || '', 
            fullName: company?.data.name.full || '', 
            shortName: company?.data.name.short || ''
        } 
        : null
}

const searchCompany = async (value, searchType = 'name') => {
    if (!value) return

    let query = searchType === 'inn' && value.includes('/') ? value.split('/')[0].trim() : value.trim()

    const url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party'
    const token = '2b7399d89cc77f97542981593a92c0352c8e34fc'
    const config = {
        method: 'POST',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Token " + token
        },
        body: JSON.stringify({ query })
    }

    try {
        
        const response = await fetch(url, config)
        const data = await response.json()

        if (searchType === 'inn') {
            return findCompany(data.suggestions, query)
        } else {
            return data.suggestions
        }


    } catch (error) {
        throw new Error(error)
    }
}

export {
    debounceCreator,
    searchCompany,
    findCompany
}