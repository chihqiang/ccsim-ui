// Common utility functions for ccsim-ui examples
window.ExampleUtils = {
  tests: {},
  logEl: null,
  testPassEl: null,
  testFailEl: null,
  testTotalEl: null,

  init(config) {
    ExampleUtils.logEl = document.getElementById('logEl')
    ExampleUtils.testPassEl = document.getElementById('testPass')
    ExampleUtils.testFailEl = document.getElementById('testFail')
    ExampleUtils.testTotalEl = document.getElementById('testTotal')

    ExampleUtils.tests = {}
    config.testIds.forEach((id) => {
      ExampleUtils.tests[id] = { el: document.getElementById(id), passed: false }
    })
    ExampleUtils.updateSummary()
  },

  setTestStatus(id, status) {
    const t = ExampleUtils.tests[id]
    if (!t) return
    t.el.className = 'status status-' + status
    const labels = { pass: '通过', fail: '失败', wait: '等待', progress: '进行中' }
    t.el.textContent = labels[status] || status
    if (status === 'pass') t.passed = true
    if (status === 'fail') t.passed = false
    ExampleUtils.updateSummary()
  },

  updateSummary() {
    let pass = 0,
      fail = 0,
      total = 0
    for (const key of Object.keys(ExampleUtils.tests)) {
      total++
      if (ExampleUtils.tests[key].passed) pass++
      else fail++
    }
    ExampleUtils.testPassEl.textContent = pass
    ExampleUtils.testFailEl.textContent = fail
    ExampleUtils.testTotalEl.textContent = total
  },

  log(msg, type) {
    const d = document.createElement('div')
    d.className = 't-' + (type || 'info')
    d.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg
    ExampleUtils.logEl.appendChild(d)
    ExampleUtils.logEl.scrollTop = ExampleUtils.logEl.scrollHeight
  },

  updateConnInfo(key, val) {
    const el = document.getElementById(key)
    if (el) el.textContent = String(val ?? '-')
  },
}
