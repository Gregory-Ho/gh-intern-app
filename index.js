const VARIANT_LIST_URL = 'https://cfw-takehome.developers.workers.dev/api/variants';
const COOKIE_NAME = 'variant_url'
const COOKIE_AGE = 120;	// Seconds

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  let cookies = request.headers.get('Cookie');
  let url = cookies ? parseCookieValue(cookies, COOKIE_NAME) : null;
  
  // No cookie, so randomly select variant
  if (!url) {
	let variants = await fetch(VARIANT_LIST_URL).then((response) => {
	  return response.json();
	}).then(json => {
	  return json.variants;
	});

	let variantNumber = Math.round(Math.random());
	url = variants[variantNumber];
  }

  // Fetch and add cookie
  let variantPageReponse = await fetch(url);
  variantPageReponse = new Response(variantPageReponse.body, variantPageReponse);
  variantPageReponse.headers.set('Set-Cookie', `${COOKIE_NAME}=${url}; Max-Age=COOKIE_AGE`);

  return new HTMLRewriter().on('title, h1#title, p#description, a#url', new ElementHandler()).transform(variantPageReponse);
}

class ElementHandler {
	element(element) {
		if (element.tagName === 'title') {
			element.setInnerContent('Cloudflare Internship App')
		} else if (element.getAttribute('id') === 'title') {
			element.append(`
			<p class='text-lg leading-5 text-gray-500' id='description'>
                Modified By Gregory Ho
			</p>
			`, {html: true});
		} else if (element.getAttribute('id') === 'description') {
			element.setInnerContent('This site uses cookies.');
		} else if (element.getAttribute('id') === 'url') {
			element.setInnerContent('Check out my Github');
			element.setAttribute('href', 'https://github.com/gregory-ho');
		}
	}
}

function parseCookieValue(cookies, key) {
	for (let cookie of cookies.split(';')) {
      let kv = cookie.split('=');
      if (kv[0].trim() === key) {
        return kv[1].trim();
        break;
      }
    }
	return null;
}
