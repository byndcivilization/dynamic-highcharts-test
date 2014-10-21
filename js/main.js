$(document).ready(function () {
	
	// Set up namespace for data to pass
	chartNS = {}; // global namspace
	chartNS.dateArray = [];
	chartNS.chart = {xAxisMin : null, xAxisMax : null}
	chartNS.data = {num_contributors : [], ip : [], fpu : [], civpol : [], eom : [], troops : [], all : []}


	var url = 'http://localhost:8080/ppp_api';
	// var url = 'http://ec2-54-208-218-182.compute-1.amazonaws.com:8080/ppp_api/aggregates';
	var eom = url + '/eom';
	var police = url + '/police';
	var troops = url + '/troops';
	var allCont = url + '/all';
	var aggregates = url + '/aggregates';

	///// Utility funciotns
	//gets data from dataIn object array and pushes to dataOut array
	function fetchData(dataIn, dataOut) {
		for (var i = 0; i < dataIn.length; i++) {
			var year = dataIn[i]['date'].slice(0, 4);
			var month = dataIn[i]['date'].slice(5, 7);
			var day = dataIn[i]['date'].slice(8, 10);
			var d = Date.UTC(year, month, day);
			var value = [d, dataIn[i].value];
			dataOut.push(value);
		};
		return dataOut;
	}
// var urls = ['/url/one','/url/two', ....];

// $.each(urls, function(i,u){ 
//      $.ajax(u, 
//        { type: 'POST',
//          data: {
//             answer_service: answer,
//             expertise_service: expertise,
//             email_service: email,
//          },
//          success: function (data) {
//              $(".error_msg").text(data);
//          } 
//        }
//      );
// });
	$.ajax({
		url: aggregates,
		cache: false,
		// dataType: 'json',
		dataType: 'jsonp',
		context: chartNS,
		success: function(outputfromserver) {

			fetchData(outputfromserver[0].values, this.data.num_contributors);

			maxDate = new Date(Math.max.apply(null,this.dateArray));
			minDate = new Date(Math.min.apply(null,this.dateArray));
			chartNS.chart.xAxisMax = maxDate.getFullYear();
			chartNS.chart.xAxisMin = minDate.getFullYear();

			// parse in data from api
			for (var i = 0; i < outputfromserver.length; i++) {
				switch(outputfromserver[i].cont_type) {
					case 'num_contributors':
						fetchData(outputfromserver[i].values, this.data.num_contributors);
						break;
					case 'ip':
						fetchData(outputfromserver[i].values, this.data.ip);
						break;
					case 'fpu':
						fetchData(outputfromserver[i].values, this.data.fpu);
						break;
					case 'civpol':
						fetchData(outputfromserver[i].values, this.data.civpol);
						break;
					case 'eom':
						fetchData(outputfromserver[i].values, this.data.eom);
						break;
					case 'troops':
						fetchData(outputfromserver[i].values, this.data.troops);
						break;
					case 'all':
						fetchData(outputfromserver[i].values, this.data.all);
						break;
					default:
						console.log('key not found');
				}
			};

			this.chart.data.series.push({name : 'Troops', data : this.data.troops, drilldown: 'troops'});
			this.chart.data.series.push({name : 'Experts on mission', data : this.data.eom});
			this.chart.data.series.push({name : 'Police', data : this.data.civpol});
			chart = new Highcharts.Chart(this.chart.data);
	console.log(this.chart.data.series);
		}
	});	

	chartNS.chart.data = {
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
		xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                // month: '%e. %b',
                year: '%Y'
            },
            title: {
                text: 'Year'
            }
        },
		yAxis: {
			title: {
				text: 'Personnel contributions' // change text and formatter to match
			},
			// max: 100500,
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

