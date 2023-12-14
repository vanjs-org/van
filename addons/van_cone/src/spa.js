import van from "vanjs-core";
const { a } = van.tags;

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

function createRoute(name, path, backend, handler) {
	const matcher = new RegExp(path.replace(parametersPattern, '([^\/]+)') + '$');
	const params = (path.match(parametersPattern) || []).map(x => x.substring(1));
	return {name, path, handler, backend, matcher, params};
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

const stripPrefix = (url, prefix) => url.replace(new RegExp('^' + prefix), '');

class Router {

	constructor(config) {
		this.routes = [];
		this.prefix = config && config.prefix || '';
        this.backendPrefix = config && config.backendPrefix || '';
	}

	add(name, path, backend, handler) {
		this.routes.push(createRoute(name, path, backend, handler));
		return this;
	}

	dispatch(url, context) {
        console.debug('Router.dispatching', url)
		const {path, queryString} = parseUrl(stripPrefix(url, this.prefix));
        console.debug(path, queryString)
		const query = getQueryParams(queryString || '');
		const {route, params} = findRouteParams(this.routes, path);

		if (route) {
			route.handler({params, query, context});
			return route;
		}

		return false;
	}

	getRoute(url) {
		const {path, queryString} = parseUrl(stripPrefix(url, this.prefix));
		const rp = findRouteParams(this.routes, path);
		return rp && rp.route;
	}

	_formatUrl(routeName, isBackend, params = {}, query = {}) {
		const route = this.routes.find(r => r.name === routeName);

		if (!route) {
			throw new Error(`Route ${routeName} not found`);
		}

		const queryString = Object.keys(query)
				  .map(k => [k, query[k]])
				  .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
				  .join('&');


        const prefix = (isBackend === true) ? this.backendPrefix : this.prefix
        const routePath = (isBackend && route.backend) ? route.backend : route.path

		const path = prefix + routePath.replace(parametersPattern, function(match) {
			return params[match.substring(1)];
		});

		return queryString.length ? path + '?' + queryString : path;
	}

    navUrl(routeName, params = {}, query = {}) {
		return this._formatUrl(routeName, false, params, query)
	}

    backendUrl(routeName, params = {}, query = {}) {
		return this._formatUrl(routeName, true, params, query)
	}
};


function createCone(routerElement, routes, defaultNavState, routerConfig) {

    const currentPage = van.state("")

    const isCurrentPage = (pageName) => van.derive(() => currentPage.val === pageName)

    // router
    const router = new Router(routerConfig);

    routes.forEach(route => {
        router.add(route.name, route.path, route.backend, function({params, query, context}) {
            console.debug("VanSpa.router.action to " + route.name)

            currentPage.val = route.name
            if (route.title) window.document.title = route.title

            const _params = params || {}
            const _query = query || {}
            const _context = context || {} 

            route.callable()
                .then((page) => {
                    if ('default' in page) {
                        return routerElement.replaceChildren(page.default(_params, _query, _context)())
                    }else{
                        return routerElement.replaceChildren(page(_params, _query, _context))
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
        console.debug("VanSpa.popstate:", event.target.location.href)
        router.dispatch(event.target.location.href)
    };

    window.onload = (event) => {
        console.debug("window.onload", event.target.location.href, window.history.state)
        setNavState(window.history.state)
        router.dispatch(event.target.location.href)
    }

    // navigation functions
    const navigate = (url, context) => {
        console.debug("VanSpa.navigate", url)
        history.pushState(getNavState(), "", url);
        router.dispatch(url, context)
    } 

    const pushHistory = (url) => {
        console.debug("VanSpa.pushHistory", url)
        history.pushState(getNavState(), "", url)
    } 
      
    const handleNav = (event, context) => {
        event.preventDefault();
        console.debug("VanSpa.handleNav", event.target.href)
        navigate(event.target.href, context)
    }

    // nav link component
    function navLink(props, ...children) {
        const { target, name, params, query, context, ...otherProps } = props;

        return a(
            {
                "aria-current": van.derive(() => (isCurrentPage(name).val ? "page" : "")),
                href: router.navUrl(name, params, query),
                target: target || "_self",
                role: "link",
                class: otherProps.class || 'router-link',
                onclick: (event) => handleNav(event, context),
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
        pushHistory,
        handleNav,
        isCurrentPage,
        navLink
    }
}

export default createCone