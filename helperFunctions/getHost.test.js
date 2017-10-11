const expect = require('chai').expect
const getHost = require('./getHost.js')

describe('getHost()', () => {

	it("Return the host form a url", () => {
		expect(getHost('http://www.mocky.io/v2/5808862710000087232b75ac'))
		.to.equal('http://www.mocky.io')
	})

})
