import van from "vanjs-core";
const { a } = van.tags;

console.log('spa.js')

const parametersPattern = /(:[^\/]+)/g;

function getMatchedParams(route, path) {
	const matches = path.match(route.matcher);

	if (!matches) {
		return false;
	}

	return route.params.reduce((acc, param, idx) => {
		acc[param] = decodeURIComponent(matches[idx + 1]);
		return acc;
	}, {});
};

function getQueryParams(query) {
	return query.split('&')
		.filter(p => p.length)
		.reduce((acc, part) => {
			const [key, value] = part.split('=');
			acc[decodeURIComponent(key)] = decodeURIComponent(value);
			return acc;
		}, {});
};

function createRoute(name, path, handler) {
	const matcher = new RegExp(path.replace(parametersPattern, '([^\/]+)') + '$');
	const params = (path.match(parametersPattern) || []).map(x => x.substring(1));

	return {name, path, handler, matcher, params};
};

const findRouteParams = (routes, path) => {
	let params;
	const route = routes.find(r => params = getMatchedParams(r, path));
	return {route, params};
};

const parseUrl = (url) => {
	const [path, queryString] = url.split('?');
	return {path, queryString};
};

const stripPrefix = (url ,prefix) => url.replace(new RegExp('^' + prefix), '');

class Router {
	constructor() {
		this.routes = [];
		this.prefix = '';
	}

	add(name, path, handler) {
		this.routes.push(createRoute(name, path, handler));
		return this;
	}

	setPrefix(prefix) {
		this.prefix = prefix;
		return this;
	}

	dispatch(url) {
        console.log('Router.dispatching', url)
		const {path, queryString} = parseUrl(stripPrefix(url, this.prefix));
        console.log(path, queryString)
		const query = getQueryParams(queryString || '');
		const {route, params} = findRouteParams(this.routes, path);

		if (route) {
			route.handler({params, query});
			return route;
		}

		return false;
	}

	getRoute(url) {
		const {path, queryString} = parseUrl(stripPrefix(url, this.prefix));
		const rp = findRouteParams(this.routes, path);
		return rp && rp.route;
	}

	formatUrl(routeName, params = {}, query = {}) {
		const route = this.routes.find(r => r.name === routeName);

		if (!route) {
			return '';
		}

		const queryString = Object.keys(query)
				  .map(k => [k, query[k]])
				  .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
				  .join('&');

		const path = this.prefix + route.path.replace(parametersPattern, function(match) {
			return params[match.substring(1)];
		});

		return queryString.length ? path + '?' + queryString : path;
	}
};


function createVanSpa(routerElement, routes, defaultNavState) {

    const currentPage = van.state("")

    const isCurrentPage = (pageName) => van.derive(() => currentPage.val === pageName)

    // router
    const router = new Router();

    routes.forEach(route => {
        router.add(route.name, route.path, function({params, query}) {
            console.log("VanSpa.router.action to " + route.name)

            currentPage.val = route.name
            if (route.title) window.document.title = route.title

            route.callable()
                .then((page) => {
                    if ('default' in page) {
                        return routerElement.replaceChildren(page.default(params, query)())
                    }else{
                        return routerElement.replaceChildren(page(params, query))
                    }
                }).catch((error) => console.error('error changing page', error))
        });
    })

    // nav state
    const _defaultNavState = typeof defaultNavState === 'undefined' ? null : defaultNavState
    const navState = van.state(_defaultNavState)

    const getNavState = () => navState.val

    const setNavState = (newState) => {
        if(newState === null) {
            navState.val = defaultNavState
        }else{
            navState.val = newState
        }
    }

    // window navigation events
    window.onpopstate = (event) => {
        console.log("VanSpa.popstate:", event.target.location.href)
        router.dispatch(event.target.location.href)
    };

    window.onload = (event) => {
        console.log("window.onload", event.target.location.href, window.history.state)
        setNavState(window.history.state)
        router.dispatch(event.target.location.href)
    }

    // navigation functions
    const navigate = (url) => {
        console.log("VanSpa.navigate", url)
        history.pushState(getNavState(), "", url);
        router.dispatch(url)
    } 
      
    const handleNav = (event) => {
        event.preventDefault();
        console.log("VanSpa.handleNav", event.target.href)
        navigate(event.target.href)
    }

    // nav link component
    function navLink(props, ...children) {
        const { target, name, params, query, ...otherProps } = props;

        console.log("VanSpa.navLink", props)

        return a(
            {
                "aria-current": van.derive(() => (isCurrentPage(name).val ? "page" : "")),
                href: router.formatUrl(name, params, query),
                target: target || "_self",
                role: "link",
                class: otherProps.class || 'router-link',
                onclick: handleNav,
                ...otherProps,
            },
            children
        );
    };

    return {
        routerElement,
        currentPage,
        router,
        navState,
        getNavState,
        setNavState,
        navigate,
        handleNav,
        isCurrentPage,
        navLink
    }
}

export default createVanSpa