
const gender_names = {
	'f': 'feminine',
	'm': 'masculine',
	'n': 'neuter'
}

Promise.all([
	d3.json('data/nouns.json'),
]).then(data => {
	data = data[0]
	const data_orig = _.cloneDeep(data)
	console.log('pie', data)

	var width = 500
	var height = 500
	var radius = Math.min(width, height) / 2 - 60

	// set the color scale
	var colorScale = d3.scaleOrdinal()
		.domain(data)
		.range(['rgb(171, 198, 155)', 'rgb(247, 200, 200)', 'rgb(186, 211, 205)'])
		// green, pink, blue

	// compute position of each group on pie chart
	var pie = d3.pie()
		.value(d => d.value)
		
	// shape helper to build arcs
	var arcGenerator = d3.arc()
		.innerRadius(0)
		.outerRadius(radius)
	
	data = get_data()
	var data_ready = pie(d3.entries(data))

	// create svg
	var svg = d3.select('#pie')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

	// build pie chart
	svg.selectAll('g')
		.data(data_ready)
		.enter()
		.append('path')
		.attr('d', arcGenerator)
		.transition()
		.duration(300)
		// .attr('stroke', 'black') // outline
		// .style('stroke-width', '1px')
		.attr('fill', d => colorScale(d.data.key))
		.attr('fill-opacity', 1)
		.each(function(d) { this._current = d })
	
	// tooltip on hover
	svg.selectAll('path')
		.on('mouseover.tooltip', function(d) {
			tooltip.transition()
				.duration(200)
				.style('font-family', 'Nunito Sans')
				.style('padding', '10px')
				.style('opacity', .8);
			tooltip.html('Gender: ' + gender_names[d.data.key] + '<p/>' + `${f(d.data.value)} words`)
				.style('left', (d3.event.pageX) + 'px')
				.style('top', (d3.event.pageY + 10) + 'px');
		})
		.on('mouseout.tooltip', function() {
			tooltip.transition()
				.duration(200)
				.style('opacity', 0);
		})
		.on('mousemove', function() {
			tooltip.style('left', (d3.event.pageX) + 'px')
				.style('top', (d3.event.pageY + 10) + 'px');
		})
		
	// tooltip
	var tooltip = d3.select('body')
		.append('div')
		.attr('class', 'tooltip')
		.style('opacity', 0)
	
	// title
	svg.append('text')
		.attr('x', -20)
		.attr('y', -220)
		.attr('text-anchor', 'middle')
		.style('font-size', '30px')
		.style('fill', '#4d4b47')
		.text('Gender Distribution')

	// filter and format data
	function get_data() {
		data = data_orig

		// filter data to only included selected ending
		if (selected_type == 'singular' & selected_ending != '') {
			data = data.filter(word => {
				return word.suffix == selected_ending
			})
		} else if (selected_type == 'plural' & selected_ending != '') {
			data = data.filter(word => {
				return word.plural_type == selected_ending 
			})
		}
		console.log('pie', data)

		// count nouns for each gender
		var gender_count = {
			'f': 0,
			'm': 0,
			'n': 0
		}
		for (var i in data) {
			if (data[i].genus == 0) continue
			gender_count[data[i].genus] += 1
		}
		data = gender_count

		console.log('pie ', data)
		return data
	}

	// update pie chart
	function update() {
		data = get_data()
		data_ready = pie(d3.entries(data))
		console.log('pie', data_ready)

		// join new data
		var path = svg.selectAll('path')
			.data(data_ready)
		
		// update existing arcs
		path.transition()
			.duration(800)
			.attrTween('d', arcTween)

		// enter new arcs
		path.enter().append('path')
			.attr('fill', d => colorScale(d.data.key))
			.attr('d', arcGenerator)
			.attr('stroke', 'white')
			.attr('stroke-width', '6px')
			.each(function(d) { this._current = d })
	}

	function arcTween(a) {
		const i = d3.interpolate(this._current, a)
		this._current = i(1)
		return (t) => arcGenerator(i(t))
	}

	// update()

	$('.sankey-node').on('click', () => {
		update()
	})
	
})


