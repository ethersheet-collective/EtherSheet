jQuery.sheet.financefn = {
	NPV: function(i, v) {
		var values =arrHelpers.foldPrepare(v, arguments);
		var result = 0;
		
		for (var t = 0; t < values.length; t++) {
			result += values[t] / Math.pow((i / 100) + 1, t + 1);
		}
		
		return result;
	},
	PMT: function(rate, nper, pv, fv, type){
		fv = (fv ? fv : 0);
		type = (type ? type : 0);
		var invert = (pv < 0 ? true : false);
		pv = Math.abs(pv);
		
		var v = ((-rate * (pv * Math.pow(1.0 + rate, nper) + fv)) /
				((1.0 + rate * type) * (Math.pow(1.0 + rate, nper) - 1))
			);
		
		return (invert ? -v : v);
	},
	NPER: function(rate, payment, pv, fv, type) { //not working yet
		fv = (fv ? fv : 0);
		type = (type ? type : 0);
		var invert = (payment < 0 ? true : false);
		payment = Math.abs(payment);
		
		var v = (
			Math.log(
				(-payment * (1.0 + rate * type) + (-1.0 / rate) * fv) /
				(pv * rate + -payment * (1.0 + rate * type))
			) /
			Math.log(1.0 + rate)
		);

		return (invert ? v : -v);
	},
	FV: function(rate, nper, pmt, pv, type) { //not working yet
		pv = (pv ? pv : 0);
		type = (type ? type : 0);
		return -(
			pv*Math.pow(1.0+rate, nper)
			+ pmt * (1.0 + rate*type)
				* (Math.pow(1.0+rate, nper) - 1.0) / rate
		);
	}
}; 
