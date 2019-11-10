(function start() {
    const min_latency_ms = 40
    const max_latency_ms = 300
    const update_throttle_ms = 10
    const progress_bar = document.querySelector('.AsyncProgress__Bar')
    const progress_brink = document.querySelector('.AsyncProgress__Brink')
    let queue = []

    progress_bar.addEventListener('mousedown', progress_bar_mousedown)

    run_updates()

    function progress_bar_mousedown (event) {
        const progress = event.target
        const [rect] = progress.getClientRects()

        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)

        function mouseup (event) {
            document.removeEventListener('mousemove', mousemove)
            document.removeEventListener('mouseup', mouseup)
            mousemove(event)
        }

        function mousemove (event) {
            const x = event.pageX
            const y = event.pageY
            const in_bounds = is_in_bounds(rect, x, y)
            if (in_bounds) {
                progress_bar_value(progress, x)
            }
        }

        progress_bar_value(progress, event.pageX)
    }

    function is_in_bounds({left, top, bottom, right}, x, y) {
        return x >= left && right >= x /* && y >= top && bottom >= y */
    }

    function progress_bar_value (progress, x) {
        const value = (x / progress.offsetWidth).toPrecision(2)
        request_progress_update(value, progress)
    }

    function request_progress_update (value, progress) {
        const increase = value > progress.value
        const same = value === progress.value
        const latency = Math.round(Math.random() * (max_latency_ms - min_latency_ms) + min_latency_ms)

        if (same) {
            progress_brink.classList.remove('AsyncProgress__Brink--increase')
            progress_brink.classList.remove('AsyncProgress__Brink--decrease')
        }
        else if (increase) {
            progress_brink.classList.remove('AsyncProgress__Brink--decrease')
            progress_brink.classList.add('AsyncProgress__Brink--increase')
            progress_brink.style.right = ''
            progress_brink.style.left = Math.round(progress.value * 100) + '%'
            progress_brink.style.width = Math.round((value - progress.value) * 100) + '%'
        }
        else {
            progress_brink.classList.remove('AsyncProgress__Brink--increase')
            progress_brink.classList.add('AsyncProgress__Brink--decrease')
            progress_brink.style.left = ''
            progress_brink.style.right = Math.round((1 - progress.value) * 100) + '%'
            progress_brink.style.width = Math.round((progress.value - value) * 100) + '%'
        }

        make_update((done) => {
            progress.value = value
            progress_brink.classList.remove('AsyncProgress__Brink--increase')
            progress_brink.classList.remove('AsyncProgress__Brink--decrease')
            done()
        }, latency)
    }

    function make_update(callback, when) {
        const from_time = queue.length ? queue[queue.length - 1].when : Date.now()
        if (queue.length === 0 || (when - from_time) > update_throttle_ms) {
            queue.push({callback, when: from_time + when})
        }
    }

    function run_updates() {
        if (queue.length) {
            const now = Date.now()
            if (queue[0].when < now) {
                const task = queue.shift()
                task.callback(() => requestAnimationFrame(() => run_updates()))
                return
            }
        }
        requestAnimationFrame(() => run_updates())
    }
})()
