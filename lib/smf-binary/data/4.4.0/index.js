exports.json_attr = require('./attributes.json');

exports.PLAYER_VERSION = '4.4.0';

exports.getSmfBinaryStructure = function() {
	return [{ // 0
		'data': '000F42400000000A020B0C06080B08080808',
		'splash': '000F424000000005020B0C0608'
	}, { // 1
		//this is actually skipped, here for reference. This part is dynamically created
		'both': '0017687474703A2F2F7777772E736D617274666163652E696F000E536D617274666163652044656D6F0001300005312E302E3000000000000000000027303175383165336350356C69646C3148524A3535686F4248304E355F4B6D6C766B753445495967000000000000000000023530000000',
		'data': '1E323738384638464135444534333632423344413232453339454245393744',
		'splash': '1F38394542303439413342333439393639433931424444393931454343443741'
		//these are different why?
		//'data': '1E323738384638464135444534333632423344413232453339454245393744',
		//'splash': '1F38394542303439413342333439393639433931424444393931454343443741'
	}, { // 2
		'data': '00000000000000000000000000000000FFFFFFFF656D614E000002EE00000536000001460000001E000000004400000000000000000000000000000000000000000000000300000000020000000800000009000000000000000000000002000000010000000500000000',
		'splash': '00000000000000000000000000000000FFFFFFFF656D614E000002EE00000536000001460000001E000000004400000000000000000000000000000000000000000000000300000000000000000000000000000000010000000100000000'
	}, { // 3
		//starting with SplashPage
		'both': '000A53706C61736850616765001164656661756C7473706C6173682E706E6700CCC243000000000000000000000000000002EE00000536114003020000000100000002000000010000000400094C6F676F496D616765000000640000000000000000200003E8200001F40000000000000003C80F0100000000000000030000000100147265736F75726365733A2F2F6C6F676F2E706E670000000000000001070000000000000001001A53706C617368506167655F53656C665F4F6E53686F772865293B000000010A00000000'
	}, { // 4
		//data.smf specific
		'data': '0005506167653100000021C1B1000000000000000000000000000002EE00000536305803200000000000000002000000060000000700000001001550616765315F53656C665F4F6E53686F772865293B000000010A0000000000000001001950616765315F53656C665F4F6E4B657950726573732865293B000000021E0000000000000000010019476C6F62616C5F4576656E74735F4F6E53746172742865293B000000011200000000000000010019476C6F62616C5F4576656E74735F4F6E4572726F722865293B000000015700000000'
	}];
}

exports.createConfObject = require('../4.3.1/index').createConfObject;