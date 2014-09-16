$(document).ready(function () {
	
	// Set up namespace for data to pass
	localhost = {}; // global namspace
	localhost.dateArray = [];
	localhost.chart = {xAxisMin : null, xAxisMax : null}
	localhost.data = {num_contributors : [], ip : [], fpu : [], civpol : [], eom : [], troops : [], all : []}
	// localhost.type = '';
	// localhost.values = [];


	// var url = 'http://localhost:8080/ppp_api/aggregates';
	// var url = 'http://ec2-54-208-218-182.compute-1.amazonaws.com:8080/ppp_api/aggregates';
	var url = 'test.json';
	// var url = 'http://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote?format=json&vew=basic';
	var eom = url + '/eom';
	var police = url + '/police';
	var troops = url + '/troops';
	var allCont = url + '/all';

	///// Utility funciotns
	//gets data from dataIn object array and pushes to dataOut array
	function getData(dataIn, dataOut) {
		for (var i = 0; i < dataIn.length; i++) {
			dataOut.push(dataIn[i].value);
		};
		return dataOut;
	}

	$.ajax({
		url: url,
		cache: false,
		// dataType: 'jsonp',
		dataType: 'json',
		context: localhost,
		success: function(outputfromserver) {

			// get and format date array
			for (var i = 0; i < outputfromserver[0]['values'].length; i++) {
				var year = outputfromserver[0]['values'][i]['date'].slice(0, 4);
				var month = outputfromserver[0]['values'][i]['date'].slice(5, 7);
				var day = outputfromserver[0]['values'][i]['date'].slice(8, 10);
				var d = new Date(year,month,day);
				this.dateArray .push(d);
			};

			maxDate = new Date(Math.max.apply(null,this.dateArray));
			minDate = new Date(Math.min.apply(null,this.dateArray));
			localhost.chart.xAxisMax = maxDate.getFullYear();
			localhost.chart.xAxisMin = minDate.getFullYear();
			localhost.xAxisCategories = [localhost.minYear,localhost.maxYear]

			
			// parse in data from api
			for (var i = 0; i < outputfromserver.length; i++) {
				switch(outputfromserver[i].cont_type) {
					case 'num_contributors':
						getData(outputfromserver[i].values, this.data.num_contributors);
						break;
					case 'ip':
						getData(outputfromserver[i].values, this.data.ip);
						break;
					case 'fpu':
						getData(outputfromserver[i].values, this.data.fpu);
						break;
					case 'civpol':
						getData(outputfromserver[i].values, this.data.civpol);
						break;
					case 'eom':
						getData(outputfromserver[i].values, this.data.eom);
						break;
					case 'troops':
						getData(outputfromserver[i].values, this.data.troops);
						break;
					case 'all':
						getData(outputfromserver[i].values, this.data.all);
						break;
					default:
						console.log('key not found');
				}
			};
			// data format for each category - array of arrays with data folowed by value
			// data: [
   //              [Date.UTC(1970,  9, 27), 0   ],
   //              [Date.UTC(1970, 10, 10), 0.6 ],
   //              [Date.UTC(1970, 10, 18), 0.7 ],
   //              [Date.UTC(1970, 11,  2), 0.8 ],
   //              [Date.UTC(1970, 11,  9), 0.6 ],
   //              [Date.UTC(1970, 11, 16), 0.6 ],
   //              [Date.UTC(1970, 11, 28), 0.67],
   //              [Date.UTC(1971,  0,  1), 0.81],
   //              [Date.UTC(1971,  0,  8), 0.78],
   //              [Date.UTC(1971,  0, 12), 0.98],
   //              [Date.UTC(1971,  0, 27), 1.84],
   //              [Date.UTC(1971,  1, 10), 1.80],
   //              [Date.UTC(1971,  1, 18), 1.80],
   //              [Date.UTC(1971,  1, 24), 1.92],
   //              [Date.UTC(1971,  2,  4), 2.49],
   //              [Date.UTC(1971,  2, 11), 2.79],
   //              [Date.UTC(1971,  2, 15), 2.73],
   //              [Date.UTC(1971,  2, 25), 2.61],
   //              [Date.UTC(1971,  3,  2), 2.76],
   //              [Date.UTC(1971,  3,  6), 2.82],
   //              [Date.UTC(1971,  3, 13), 2.8 ],
   //              [Date.UTC(1971,  4,  3), 2.1 ],
   //              [Date.UTC(1971,  4, 26), 1.1 ],
   //              [Date.UTC(1971,  5,  9), 0.25],
   //              [Date.UTC(1971,  5, 12), 0   ]
   //          ]

			this.chart.data.series.push({name : 'Troops', data : this.data.troops});
			this.chart.data.series.push({name : 'Experts on mission', data : this.data.eom});
			this.chart.data.series.push({name : 'Police', data : this.data.civpol});
			// this.chart.data.xAxis.categories = this.dateArray;
			chart = new Highcharts.Chart(this.chart.data);
		}
	});	

	localhost.chart.data = {
		chart: {
			renderTo: 'chart',
			type: 'area'
		},
		title: {
			text: 'United Nations peacekeeping personnel contributions over time'
		},
		subtitle: {
			text: 'Source: <a href="http://www.providingforpeacekeeping.org/contributions/">IPI Peacekeeping Database</a>'
		},
		// format for xaxis data
		// xAxis: {
  //           type: 'datetime',
  //           dateTimeLabelFormats: { // don't display the dummy year
  //               month: '%e. %b',
  //               year: '%b'
  //           },
  //           title: {
  //               text: 'Date'
  //           }
  //       },
		xAxis: {
			categories: null, //set to null and get from api and push to array
			tickmarkPlacement: 'on',
			title: {
				enabled: false
			}
		},
		yAxis: {
			title: {
				text: 'Personnel contributions' // change text and formatter to match
			},
			max: 100500,
			labels: {
				formatter: function () {
					return this.value;
				}
			}
		},
		tooltip: {
			shared: true
		},
		plotOptions: {
			area: {
				stacking: 'normal',
				lineColor: '#666666',
				lineWidth: 1,
				marker: {
					lineWidth: 1,
					lineColor: '#666666'
				}
			}
		},
		series: []
	}
});

