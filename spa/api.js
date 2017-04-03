import axios from 'axios' 

export async function createApiCall(url, method, data) {
	let tokenResponse = await axios.post('/auth/token')
	let config = { headers: { Authorization: `JWT ${tokenResponse.data.token}`} }

	switch (method) {
		case 'post':
		case 'put':
		case 'patch':
			return axios[method](url, data, config)
			break;
	
		default:
			return axios[method](url, config)
			break;
	}
}

export async function submitForm(args) {
	let url = args.target.action
	let method = args.target.getAttribute('data-method')
	let data = {}

	for(var el of args.target.elements) {
		if(el.name.endsWith('[]')) {
			let arr = data[el.name.replace('[]', '')]
			if(!arr)
				arr = data[el.name.replace('[]', '')] = []

			arr.push(el.value)
		} else {
			data[el.name] = el.value
		}
	}
			
	let axiosAction = await createApiCall(url, method, data)

	return axiosAction
}