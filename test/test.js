void function () {
	var _actionList = action.__actionList
	var _getActionName = action.__getActionName
	var _formatActionName = action.__formatActionName

	var testKey = ''

	function buildActionElem(action, href) {
		var html = [
			'<a href="',
			href ? href : '#',
			'" data-action',
			action ? '="' + action + '"' : '',
			'>Action Element</a>'
		].join('')
		return $(html)
			.css({position: 'absolute', top: '-50px'})
			.appendTo('body')
	}

	afterEach(function () {
		testKey = ''
		delete _actionList.foo
		delete _actionList.bar
	})

	describe('Util', function () {
		describe('_getActionName()', function () {
			var $link
			afterEach(function () {
				$link.remove()
			})
			it('gets action name from `href`', function () {
				var href = Math.random().toString(36).slice(2)
				$link = buildActionElem('', '#' + href)
				expect(_getActionName($link)).to.equal(href)
			})
			it('gets action name from `data-action`', function () {
				var action = Math.random().toString(36).slice(2)
				$link = buildActionElem(action)
				expect(_getActionName($link)).to.equal(action)
			})
			it('gets from `data-action` first', function () {
				var action = Math.random().toString(36).slice(2)
				var href = Math.random().toString(36).slice(2)
				$link = buildActionElem(action, '#' + href)
				expect(_getActionName($link)).to.equal(action)
			})
			it('returns empty if `href` is not hash', function () {
				var href = Math.random().toString(36).slice(2)
				$link = buildActionElem('', href)
				expect(_getActionName($link)).to.equal('')
			})
		})
		describe('_formatActionName()', function () {
			it('returns directly if initial character is not space, `#` or `!`', function () {
				var arg
				arg = 'foobar'
				expect(_formatActionName(arg)).to.equal(arg)
			})
			it('removes all initial `#` and `!` characters', function () {
				var arg
				arg = '#foo'
				expect(_formatActionName(arg)).to.equal('foo')
				arg = '###bar'
				expect(_formatActionName(arg)).to.equal('bar')
				arg = '###foo#bar'
				expect(_formatActionName(arg)).to.equal('foo#bar')
				arg = '!foo'
				expect(_formatActionName(arg)).to.equal('foo')
				arg = '!!!bar'
				expect(_formatActionName(arg)).to.equal('bar')
				arg = '!!!foo#bar'
				expect(_formatActionName(arg)).to.equal('foo#bar')
				arg = '#!foobar'
				expect(_formatActionName(arg)).to.equal('foobar')
				arg = '#!!foo!bar'
				expect(_formatActionName(arg)).to.equal('foo!bar')
			})
			it('ignores initial and ending spaces', function () {
				var arg
				arg = '    '
				expect(_formatActionName(arg)).to.equal('')
				arg = '  foo  '
				expect(_formatActionName(arg)).to.equal('foo')
				arg = '  #foo  '
				expect(_formatActionName(arg)).to.equal('foo')
				arg = '  ###bar  '
				expect(_formatActionName(arg)).to.equal('bar')
				arg = '  #!foobar  '
				expect(_formatActionName(arg)).to.equal('foobar')
				arg = '  #! ##!!foobar  '
				expect(_formatActionName(arg)).to.equal('foobar')
			})
			it('converts falsy value to empty string', function () {
				var arg
				arg = undefined
				expect(_formatActionName(arg)).to.equal('')
				arg = null
				expect(_formatActionName(arg)).to.equal('')
				arg = false
				expect(_formatActionName(arg)).to.equal('')
				arg = NaN
				expect(_formatActionName(arg)).to.equal('')
			})
		})
	})

	describe('APIs', function () {
		var actionSet = {}
		var fnFoo = function () {}
		var fnBar = function () {}

		describe('action.define()', function () {
			it('does basic functionality', function () {
				expect(_actionList).to.deep.equal({})
				actionSet = {
					foo: fnFoo,
					bar: fnBar
				}
				action.define(actionSet)
				expect(_actionList).to.deep.equal(actionSet)
			})
			it('formats keys of the input object', function () {
				expect(_actionList).to.deep.equal({})
				actionSet = {
					foo: fnFoo,
					bar: fnBar
				}
				action.define(actionSet)
				expect(_actionList).to.deep.equal(actionSet)
			})
			it('does nothing if param is not a plain object', function () {
				expect(_actionList).to.deep.equal({})
				action.define('foo')
				expect(_actionList).to.deep.equal({})
				action.define(1)
				expect(_actionList).to.deep.equal({})
				action.define(new Date())
				expect(_actionList).to.deep.equal({})
			})
		})

		describe('action.trigger()', function () {
			it('does basic functionality', function () {
				actionSet = {
					foo: function () {
						testKey = 'test-foo'
					},
					bar: function () {
						testKey = 'test-bar'
					}
				}
				action.define(actionSet)
				action.trigger('foo')
				expect(testKey).to.equal('test-foo')
				action.trigger('bar')
				expect(testKey).to.equal('test-bar')
			})
			it('calls action function on the specified context', function () {
				var context = {}
				actionSet = {
					foo: function () {
						expect(this).to.equal(context)
					},
					bar: function () {
						expect(this).to.equal(mocha)
					}
				}
				action.define(actionSet)
				action.trigger('foo', context)
				action.trigger('bar', mocha)
			})
			it('returns return value of action function', function () {
				testKey = Math.random().toString(36).slice(2)
				actionSet = {
					foo: function () {
						return testKey
					},
					bar: function () {
						return mocha
					}
				}
				action.define(actionSet)
				expect(action.trigger('foo')).to.equal(testKey)
				expect(action.trigger('bar')).to.equal(mocha)
			})
		})
	})

	describe('DOM binding', function () {
		var $link, context
		afterEach(function () {
			$link.remove()
		})
		it('gets action name from `href`', function (done) {
			$link = buildActionElem('', '#foo')
			_actionList.foo = function () {
				testKey = 'test-foo'
			}
			$link.click()
			setTimeout(function () {
				expect(testKey).to.equal('test-foo')
				done()
			}, 0)
		})
		it('gets action name from `href` - context points to the link', function (done) {
			$link = buildActionElem('', '#foo')
			_actionList.foo = function () {
				context = this
			}
			$link.click()
			setTimeout(function () {
				expect(context).to.equal($link[0])
				done()
			}, 0)
		})
		it('gets action name from `data-action`', function (done) {
			$link = buildActionElem('bar')
			_actionList.bar = function () {
				testKey = 'test-bar'
			}
			$link.click()
			setTimeout(function () {
				expect(testKey).to.equal('test-bar')
				done()
			}, 0)
		})
		it('gets action name from `data-action` - context points to the link', function (done) {
			$link = buildActionElem('bar')
			_actionList.bar = function () {
				context = this
			}
			$link.click()
			setTimeout(function () {
				expect(context).to.equal($link[0])
				done()
			}, 0)
		})
		it('accepts `data-action` value as a hash', function (done) {
			$link = buildActionElem('#bar')
			_actionList.bar = function () {
				testKey = 'test-bar'
			}
			$link.click()
			setTimeout(function () {
				expect(testKey).to.equal('test-bar')
				done()
			}, 0)
		})

		it('triggers new action if action name modified', function (done) {
			$link = buildActionElem('foo')
			_actionList.foo = function () {
				testKey = 'test-foo'
			}
			$link.click()
			setTimeout(function () {
				expect(testKey).to.equal('test-foo')

				// modify action name and test again
				$link.attr('data-action', 'bar')
				_actionList.bar = function () {
					testKey = 'test-bar'
				}
				$link.click()
				setTimeout(function () {
					expect(testKey).to.equal('test-bar')
					done()
				}, 0)

			}, 0)

		})
	})
}()
