import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveSlug, transformHtml, routeHref, routes, LANGS } from '../lib/site.js'

test('slug → jazyk a trasa', () => {
  assert.deepEqual(resolveSlug([]), { lang: 'sk', route: '' })
  assert.deepEqual(resolveSlug(['en']), { lang: 'en', route: '' })
  assert.deepEqual(resolveSlug(['de', 'sprava']), { lang: 'de', route: 'sprava' })
  assert.deepEqual(resolveSlug(['kalkulacka']), { lang: 'sk', route: 'kalkulacka' })
  assert.deepEqual(resolveSlug(['vypocet']), { lang: 'sk', route: 'kalkulacka' })
  assert.equal(resolveSlug(['neexistuje']), null)
  assert.equal(resolveSlug(['en', 'sprava', 'x']), null)
})

test('odkazy: tlačidlá data-route → <a href>', () => {
  const html = '<p><button type="button" class="btn line" data-route="kratkodoba">Preskúmať</button></p><a href="#clanok-skypark">x</a><img src="/livein-release-20261013/live-in-assets/hero.jpg">'
  const out = transformHtml(html, 'sk')
  assert.match(out, /<a class="btn line" data-route="kratkodoba" href="\/kratkodoba">Preskúmať<\/a>/)
  assert.match(out, /href="\/clanok-skypark"/)
  assert.match(out, /src="\/assets\/hero.jpg"/)
  assert.ok(!out.includes('<button'))
  const en = transformHtml(html, 'en')
  assert.match(en, /href="\/en\/kratkodoba"/)
  const rel = transformHtml('<a href="spolupraca.html">x</a><a href="index.html#kontakt">y</a>', 'de')
  assert.match(rel, /href="\/de\/spolupraca"/)
  assert.match(rel, /href="\/de\/kontakt"/)
})

test('hrefy a aliasy', () => {
  assert.equal(routeHref('sk', 'home'), '/')
  assert.equal(routeHref('en', 'home'), '/en')
  assert.equal(routeHref('cz', 'vypocet'), '/cz/kalkulacka')
  for (const l of LANGS) assert.ok(routes(l).includes('kontakt') && routes(l).includes('kalkulacka'))
})
