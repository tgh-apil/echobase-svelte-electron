
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function select_multiple_value(select) {
        return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const rootDirectory = writable('');
    const videoSource = writable('');
    const videoToEdit = writable('');
    const videoPathToEdit = writable('');
    const currentPage = writable('');

    /* src\components\RadioButtonGroup.components.svelte generated by Svelte v3.19.1 */

    const file = "src\\components\\RadioButtonGroup.components.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (9:0) {#each options as option}
    function create_each_block(ctx) {
    	let label_1;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*option*/ ctx[6].label + "";
    	let t1;
    	let t2;
    	let span;
    	let t3;
    	let dispose;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			span = element("span");
    			t3 = space();
    			attr_dev(input, "type", "radio");
    			input.__value = input_value_value = /*option*/ ctx[6].value;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-1cixp9u");
    			/*$$binding_groups*/ ctx[5][0].push(input);
    			add_location(input, file, 10, 8, 207);
    			attr_dev(span, "class", "checkmark svelte-1cixp9u");
    			add_location(span, file, 12, 8, 299);
    			attr_dev(label_1, "class", "container svelte-1cixp9u");
    			add_location(label_1, file, 9, 4, 172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, input);
    			input.checked = input.__value === /*group*/ ctx[0];
    			append_dev(label_1, t0);
    			append_dev(label_1, t1);
    			append_dev(label_1, t2);
    			append_dev(label_1, span);
    			append_dev(label_1, t3);
    			dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[4]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 2 && input_value_value !== (input_value_value = /*option*/ ctx[6].value)) {
    				prop_dev(input, "__value", input_value_value);
    			}

    			input.value = input.__value;

    			if (dirty & /*group*/ 1) {
    				input.checked = input.__value === /*group*/ ctx[0];
    			}

    			if (dirty & /*options*/ 2 && t1_value !== (t1_value = /*option*/ ctx[6].label + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			/*$$binding_groups*/ ctx[5][0].splice(/*$$binding_groups*/ ctx[5][0].indexOf(input), 1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:0) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let each_1_anchor;
    	let each_value = /*options*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*label*/ ctx[3]);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(h3, "for", /*id*/ ctx[2]);
    			add_location(h3, file, 7, 0, 114);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 8) set_data_dev(t0, /*label*/ ctx[3]);

    			if (dirty & /*id*/ 4) {
    				attr_dev(h3, "for", /*id*/ ctx[2]);
    			}

    			if (dirty & /*options, group*/ 3) {
    				each_value = /*options*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { options } = $$props;
    	let { id } = $$props;
    	let { label } = $$props;
    	let { group } = $$props;
    	const writable_props = ["options", "id", "label", "group"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RadioButtonGroup_components> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		group = this.__value;
    		$$invalidate(0, group);
    	}

    	$$self.$set = $$props => {
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("group" in $$props) $$invalidate(0, group = $$props.group);
    	};

    	$$self.$capture_state = () => ({ options, id, label, group });

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(1, options = $$props.options);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("group" in $$props) $$invalidate(0, group = $$props.group);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [group, options, id, label, input_change_handler, $$binding_groups];
    }

    class RadioButtonGroup_components extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { options: 1, id: 2, label: 3, group: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RadioButtonGroup_components",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[1] === undefined && !("options" in props)) {
    			console.warn("<RadioButtonGroup_components> was created without expected prop 'options'");
    		}

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console.warn("<RadioButtonGroup_components> was created without expected prop 'id'");
    		}

    		if (/*label*/ ctx[3] === undefined && !("label" in props)) {
    			console.warn("<RadioButtonGroup_components> was created without expected prop 'label'");
    		}

    		if (/*group*/ ctx[0] === undefined && !("group" in props)) {
    			console.warn("<RadioButtonGroup_components> was created without expected prop 'group'");
    		}
    	}

    	get options() {
    		throw new Error("<RadioButtonGroup_components>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<RadioButtonGroup_components>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<RadioButtonGroup_components>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<RadioButtonGroup_components>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<RadioButtonGroup_components>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<RadioButtonGroup_components>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<RadioButtonGroup_components>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<RadioButtonGroup_components>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\SelectGroup.component.svelte generated by Svelte v3.19.1 */

    const file$1 = "src\\components\\SelectGroup.component.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (10:4) {#each options as option}
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*option*/ ctx[5].label + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*option*/ ctx[5].value;
    			option.value = option.__value;
    			add_location(option, file$1, 10, 8, 206);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 4 && t0_value !== (t0_value = /*option*/ ctx[5].label + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*options*/ 4 && option_value_value !== (option_value_value = /*option*/ ctx[5].value)) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:4) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let select;
    	let dispose;
    	let each_value = /*options*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*label*/ ctx[3]);
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "for", /*id*/ ctx[1]);
    			add_location(h3, file$1, 7, 0, 114);
    			attr_dev(select, "id", /*id*/ ctx[1]);
    			attr_dev(select, "class", "svelte-ojcvm3");
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$1, 8, 0, 141);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*value*/ ctx[0]);
    			dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[4]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 8) set_data_dev(t0, /*label*/ ctx[3]);

    			if (dirty & /*id*/ 2) {
    				attr_dev(h3, "for", /*id*/ ctx[1]);
    			}

    			if (dirty & /*options*/ 4) {
    				each_value = /*options*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(select, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1) {
    				select_option(select, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	let { id } = $$props;
    	let { options } = $$props;
    	let { label } = $$props;
    	const writable_props = ["value", "id", "options", "label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectGroup_component> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(2, options);
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("options" in $$props) $$invalidate(2, options = $$props.options);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    	};

    	$$self.$capture_state = () => ({ value, id, options, label });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("options" in $$props) $$invalidate(2, options = $$props.options);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, id, options, label, select_change_handler];
    }

    class SelectGroup_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { value: 0, id: 1, options: 2, label: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectGroup_component",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<SelectGroup_component> was created without expected prop 'value'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<SelectGroup_component> was created without expected prop 'id'");
    		}

    		if (/*options*/ ctx[2] === undefined && !("options" in props)) {
    			console.warn("<SelectGroup_component> was created without expected prop 'options'");
    		}

    		if (/*label*/ ctx[3] === undefined && !("label" in props)) {
    			console.warn("<SelectGroup_component> was created without expected prop 'label'");
    		}
    	}

    	get value() {
    		throw new Error("<SelectGroup_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectGroup_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<SelectGroup_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SelectGroup_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<SelectGroup_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<SelectGroup_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<SelectGroup_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<SelectGroup_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TextInput.component.svelte generated by Svelte v3.19.1 */

    const file$2 = "src\\components\\TextInput.component.svelte";

    function create_fragment$2(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*label*/ ctx[3]);
    			t1 = space();
    			input = element("input");
    			attr_dev(h3, "for", /*id*/ ctx[2]);
    			add_location(h3, file$2, 8, 0, 140);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			attr_dev(input, "name", /*name*/ ctx[4]);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-1r9dav");
    			add_location(input, file$2, 9, 0, 167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[5]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 8) set_data_dev(t0, /*label*/ ctx[3]);

    			if (dirty & /*id*/ 4) {
    				attr_dev(h3, "for", /*id*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(input, "name", /*name*/ ctx[4]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	let { placeholder } = $$props;
    	let { id } = $$props;
    	let { label } = $$props;
    	let { name } = $$props;
    	const writable_props = ["value", "placeholder", "id", "label", "name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TextInput_component> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ value, placeholder, id, label, name });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, placeholder, id, label, name, input_input_handler];
    }

    class TextInput_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			value: 0,
    			placeholder: 1,
    			id: 2,
    			label: 3,
    			name: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextInput_component",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<TextInput_component> was created without expected prop 'value'");
    		}

    		if (/*placeholder*/ ctx[1] === undefined && !("placeholder" in props)) {
    			console.warn("<TextInput_component> was created without expected prop 'placeholder'");
    		}

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console.warn("<TextInput_component> was created without expected prop 'id'");
    		}

    		if (/*label*/ ctx[3] === undefined && !("label" in props)) {
    			console.warn("<TextInput_component> was created without expected prop 'label'");
    		}

    		if (/*name*/ ctx[4] === undefined && !("name" in props)) {
    			console.warn("<TextInput_component> was created without expected prop 'name'");
    		}
    	}

    	get value() {
    		throw new Error("<TextInput_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextInput_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextInput_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextInput_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextInput_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextInput_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<TextInput_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextInput_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<TextInput_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TextInput_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TextArea.component.svelte generated by Svelte v3.19.1 */

    const file$3 = "src\\components\\TextArea.component.svelte";

    function create_fragment$3(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let textarea;
    	let dispose;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*label*/ ctx[3]);
    			t1 = space();
    			textarea = element("textarea");
    			attr_dev(h3, "for", /*id*/ ctx[2]);
    			add_location(h3, file$3, 8, 0, 140);
    			attr_dev(textarea, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(textarea, "id", /*id*/ ctx[2]);
    			attr_dev(textarea, "name", /*name*/ ctx[4]);
    			attr_dev(textarea, "type", "text-area");
    			attr_dev(textarea, "class", "svelte-5k6yq0");
    			add_location(textarea, file$3, 9, 0, 167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[0]);
    			dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[5]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 8) set_data_dev(t0, /*label*/ ctx[3]);

    			if (dirty & /*id*/ 4) {
    				attr_dev(h3, "for", /*id*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(textarea, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*id*/ 4) {
    				attr_dev(textarea, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(textarea, "name", /*name*/ ctx[4]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(textarea);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	let { placeholder } = $$props;
    	let { id } = $$props;
    	let { label } = $$props;
    	let { name } = $$props;
    	const writable_props = ["value", "placeholder", "id", "label", "name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TextArea_component> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ value, placeholder, id, label, name });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("name" in $$props) $$invalidate(4, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, placeholder, id, label, name, textarea_input_handler];
    }

    class TextArea_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			value: 0,
    			placeholder: 1,
    			id: 2,
    			label: 3,
    			name: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextArea_component",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<TextArea_component> was created without expected prop 'value'");
    		}

    		if (/*placeholder*/ ctx[1] === undefined && !("placeholder" in props)) {
    			console.warn("<TextArea_component> was created without expected prop 'placeholder'");
    		}

    		if (/*id*/ ctx[2] === undefined && !("id" in props)) {
    			console.warn("<TextArea_component> was created without expected prop 'id'");
    		}

    		if (/*label*/ ctx[3] === undefined && !("label" in props)) {
    			console.warn("<TextArea_component> was created without expected prop 'label'");
    		}

    		if (/*name*/ ctx[4] === undefined && !("name" in props)) {
    			console.warn("<TextArea_component> was created without expected prop 'name'");
    		}
    	}

    	get value() {
    		throw new Error("<TextArea_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextArea_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextArea_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextArea_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextArea_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextArea_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<TextArea_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextArea_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<TextArea_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TextArea_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NextClip.svelte generated by Svelte v3.19.1 */

    const fs = window.require("fs");

    function nextClip(storagePath, donePath) {
    	const storageFiles = fs.readdirSync(storagePath);
    	const oldPath = storagePath + "/" + storageFiles[0];
    	const newPath = donePath + "/" + storageFiles[0];

    	fs.rename(oldPath, newPath, err => {
    		if (err) throw err;
    	});

    	if (storageFiles.length > 1) {
    		videoSource.update(src => src = storagePath + storageFiles[1]);
    	} else {
    		videoSource.update(src => src = "done");
    		console.log();
    	}

    	console.log(`moved ${storageFiles[0]} to done!`);
    }

    const fs$1 = window.require('fs');

    function jsonUpdater(filePath, fileName, objToAppend) {
            // path still not working even if i convert the object to string, so we use this ugly thing
            const dbFilePath = filePath + '/data/' + fileName;

            let dbObj = JSON.parse(fs$1.readFileSync(dbFilePath));

            dbObj = {...dbObj, ...objToAppend};

            fs$1.writeFileSync(dbFilePath, JSON.stringify(dbObj, 0, 2));

            console.log(`File: ${fileName} updated!`);
    }

    const { PythonShell } = window.require('python-shell');

    function launchPy(file_name, root_path) {

        let options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: 'src/python_scripts',
            args: [file_name, root_path]
        };

        let pyResults = [];

        PythonShell.run('imageManipulation.py', options, function(err, results) {
            // results come in as an object
            if (err) throw err;
            results.forEach(result => {
                pyResults.push(result);
            });

            console.log(results);

            const depth = parseInt(pyResults[pyResults.length - 1]);

            const fileNameObj = {'Filename': file_name.slice(8, file_name.length)};
            const depthObj = {'Depth': depth};

            jsonUpdater(root_path, file_name + '.json', fileNameObj);
            jsonUpdater(root_path, file_name + '.json', depthObj);
        });
    }

    function vidBlackBar(root_path) {

        let pyResults = [];

        let options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: 'src/python_scripts',
            args: [root_path]
        };

        PythonShell.run('video_anon.py', options, function(err, results) {
            if (err) throw err;
            results.forEach(result => {
                pyResults.push(result);
            });
            
            console.log(results);
            
            const isClean = pyResults[pyResults.length - 1];

            return isClean;
        });
    }

    /* src\components\FormTemplate.components.svelte generated by Svelte v3.19.1 */

    const { console: console_1 } = globals;

    const file$4 = "src\\components\\FormTemplate.components.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[15] = list;
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (57:49) 
    function create_if_block_3(ctx) {
    	let updating_value;
    	let current;

    	function textarea_value_binding(value) {
    		/*textarea_value_binding*/ ctx[12].call(null, value, /*field*/ ctx[14]);
    	}

    	let textarea_props = {
    		label: /*field*/ ctx[14].label,
    		placeholder: /*field*/ ctx[14].placeholder,
    		id: /*field*/ ctx[14].id,
    		name: /*field*/ ctx[14].name
    	};

    	if (/*field*/ ctx[14].value !== void 0) {
    		textarea_props.value = /*field*/ ctx[14].value;
    	}

    	const textarea = new TextArea_component({ props: textarea_props, $$inline: true });
    	binding_callbacks.push(() => bind(textarea, "value", textarea_value_binding));

    	const block = {
    		c: function create() {
    			create_component(textarea.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textarea, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const textarea_changes = {};
    			if (dirty & /*fields*/ 1) textarea_changes.label = /*field*/ ctx[14].label;
    			if (dirty & /*fields*/ 1) textarea_changes.placeholder = /*field*/ ctx[14].placeholder;
    			if (dirty & /*fields*/ 1) textarea_changes.id = /*field*/ ctx[14].id;
    			if (dirty & /*fields*/ 1) textarea_changes.name = /*field*/ ctx[14].name;

    			if (!updating_value && dirty & /*fields*/ 1) {
    				updating_value = true;
    				textarea_changes.value = /*field*/ ctx[14].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			textarea.$set(textarea_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textarea, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(57:49) ",
    		ctx
    	});

    	return block;
    }

    // (55:44) 
    function create_if_block_2(ctx) {
    	let updating_value;
    	let current;

    	function textinput_value_binding(value) {
    		/*textinput_value_binding*/ ctx[11].call(null, value, /*field*/ ctx[14]);
    	}

    	let textinput_props = {
    		label: /*field*/ ctx[14].label,
    		placeholder: /*field*/ ctx[14].placeholder,
    		id: /*field*/ ctx[14].id,
    		name: /*field*/ ctx[14].name
    	};

    	if (/*field*/ ctx[14].value !== void 0) {
    		textinput_props.value = /*field*/ ctx[14].value;
    	}

    	const textinput = new TextInput_component({ props: textinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(textinput, "value", textinput_value_binding));

    	const block = {
    		c: function create() {
    			create_component(textinput.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(textinput, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const textinput_changes = {};
    			if (dirty & /*fields*/ 1) textinput_changes.label = /*field*/ ctx[14].label;
    			if (dirty & /*fields*/ 1) textinput_changes.placeholder = /*field*/ ctx[14].placeholder;
    			if (dirty & /*fields*/ 1) textinput_changes.id = /*field*/ ctx[14].id;
    			if (dirty & /*fields*/ 1) textinput_changes.name = /*field*/ ctx[14].name;

    			if (!updating_value && dirty & /*fields*/ 1) {
    				updating_value = true;
    				textinput_changes.value = /*field*/ ctx[14].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			textinput.$set(textinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(textinput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(55:44) ",
    		ctx
    	});

    	return block;
    }

    // (53:46) 
    function create_if_block_1(ctx) {
    	let updating_value;
    	let current;

    	function selectgroup_value_binding(value) {
    		/*selectgroup_value_binding*/ ctx[10].call(null, value, /*field*/ ctx[14]);
    	}

    	let selectgroup_props = {
    		label: /*field*/ ctx[14].label,
    		options: /*field*/ ctx[14].options,
    		id: /*field*/ ctx[14].id
    	};

    	if (/*field*/ ctx[14].value !== void 0) {
    		selectgroup_props.value = /*field*/ ctx[14].value;
    	}

    	const selectgroup = new SelectGroup_component({ props: selectgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectgroup, "value", selectgroup_value_binding));

    	const block = {
    		c: function create() {
    			create_component(selectgroup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectgroup, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const selectgroup_changes = {};
    			if (dirty & /*fields*/ 1) selectgroup_changes.label = /*field*/ ctx[14].label;
    			if (dirty & /*fields*/ 1) selectgroup_changes.options = /*field*/ ctx[14].options;
    			if (dirty & /*fields*/ 1) selectgroup_changes.id = /*field*/ ctx[14].id;

    			if (!updating_value && dirty & /*fields*/ 1) {
    				updating_value = true;
    				selectgroup_changes.value = /*field*/ ctx[14].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			selectgroup.$set(selectgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(53:46) ",
    		ctx
    	});

    	return block;
    }

    // (51:12) {#if field.type === 'radio'}
    function create_if_block(ctx) {
    	let updating_group;
    	let current;

    	function radiobuttongroup_group_binding(value) {
    		/*radiobuttongroup_group_binding*/ ctx[9].call(null, value, /*field*/ ctx[14]);
    	}

    	let radiobuttongroup_props = {
    		label: /*field*/ ctx[14].label,
    		options: /*field*/ ctx[14].options,
    		id: /*field*/ ctx[14].id
    	};

    	if (/*field*/ ctx[14].value !== void 0) {
    		radiobuttongroup_props.group = /*field*/ ctx[14].value;
    	}

    	const radiobuttongroup = new RadioButtonGroup_components({
    			props: radiobuttongroup_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(radiobuttongroup, "group", radiobuttongroup_group_binding));

    	const block = {
    		c: function create() {
    			create_component(radiobuttongroup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(radiobuttongroup, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const radiobuttongroup_changes = {};
    			if (dirty & /*fields*/ 1) radiobuttongroup_changes.label = /*field*/ ctx[14].label;
    			if (dirty & /*fields*/ 1) radiobuttongroup_changes.options = /*field*/ ctx[14].options;
    			if (dirty & /*fields*/ 1) radiobuttongroup_changes.id = /*field*/ ctx[14].id;

    			if (!updating_group && dirty & /*fields*/ 1) {
    				updating_group = true;
    				radiobuttongroup_changes.group = /*field*/ ctx[14].value;
    				add_flush_callback(() => updating_group = false);
    			}

    			radiobuttongroup.$set(radiobuttongroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(radiobuttongroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(radiobuttongroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(radiobuttongroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(51:12) {#if field.type === 'radio'}",
    		ctx
    	});

    	return block;
    }

    // (50:8) {#each fields as field}
    function create_each_block$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*field*/ ctx[14].type === "radio") return 0;
    		if (/*field*/ ctx[14].type === "select") return 1;
    		if (/*field*/ ctx[14].type === "text") return 2;
    		if (/*field*/ ctx[14].type === "text-area") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(50:8) {#each fields as field}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let form;
    	let div0;
    	let t0;
    	let div1;
    	let button;
    	let current;
    	let dispose;
    	let each_value = /*fields*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Submit";
    			attr_dev(div0, "class", "formOptions");
    			add_location(div0, file$4, 48, 4, 1981);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$4, 62, 8, 2807);
    			add_location(div1, file$4, 61, 4, 2792);
    			add_location(form, file$4, 47, 0, 1915);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(form, t0);
    			append_dev(form, div1);
    			append_dev(div1, button);
    			current = true;
    			dispose = listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[13]), false, true, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fields*/ 1) {
    				each_value = /*fields*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $rootDirectory;
    	validate_store(rootDirectory, "rootDirectory");
    	component_subscribe($$self, rootDirectory, $$value => $$invalidate(3, $rootDirectory = $$value));
    	const fs = window.require("fs");
    	let { fields } = $$props;
    	let { onSubmit } = $$props;

    	// I know this is the wrong way to do this, but importing Path does not work for some stupid reason
    	let storagePath = $rootDirectory + "/storage/";

    	let donePath = $rootDirectory + "/done/";

    	// Convert fields from [ { name: 'name', value: 'Value' } ] to { name : Value } which is more useful when submitting a form
    	const fieldsToObject = fields => fields.reduce((p, c) => ({ ...p, [c.name]: c.value }), {});

    	function saveData(data) {
    		let convertedData = JSON.stringify(data, 0, 2);

    		fs.readdir($rootDirectory + "/storage", (err, files) => {
    			let currentFile = files[0] + ".json";
    			let filePath = $rootDirectory + "/data/" + currentFile;

    			// comment this line out if you don't want to run the python scripts
    			// for machine learning + digit recognition
    			launchPy(files[0], $rootDirectory);

    			fs.writeFile(filePath, convertedData, err => {
    				if (err) throw err;
    				console.log(`saved file ${currentFile}`);
    			});
    		});

    		nextClip(storagePath, donePath);
    	}

    	// When submitting, turn our fields representation into a JSON body
    	const handleSubmit = () => onSubmit(saveData(fieldsToObject(fields)));

    	const writable_props = ["fields", "onSubmit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<FormTemplate_components> was created with unknown prop '${key}'`);
    	});

    	function radiobuttongroup_group_binding(value, field) {
    		field.value = value;
    		$$invalidate(0, fields);
    	}

    	function selectgroup_value_binding(value, field) {
    		field.value = value;
    		$$invalidate(0, fields);
    	}

    	function textinput_value_binding(value, field) {
    		field.value = value;
    		$$invalidate(0, fields);
    	}

    	function textarea_value_binding(value, field) {
    		field.value = value;
    		$$invalidate(0, fields);
    	}

    	const submit_handler = () => handleSubmit();

    	$$self.$set = $$props => {
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("onSubmit" in $$props) $$invalidate(2, onSubmit = $$props.onSubmit);
    	};

    	$$self.$capture_state = () => ({
    		RadioButtonGroup: RadioButtonGroup_components,
    		SelectGroup: SelectGroup_component,
    		TextInput: TextInput_component,
    		TextArea: TextArea_component,
    		nextClip,
    		rootDirectory,
    		videoSource,
    		launchPy,
    		fs,
    		fields,
    		onSubmit,
    		storagePath,
    		donePath,
    		fieldsToObject,
    		saveData,
    		handleSubmit,
    		window,
    		$rootDirectory,
    		JSON,
    		console
    	});

    	$$self.$inject_state = $$props => {
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("onSubmit" in $$props) $$invalidate(2, onSubmit = $$props.onSubmit);
    		if ("storagePath" in $$props) storagePath = $$props.storagePath;
    		if ("donePath" in $$props) donePath = $$props.donePath;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fields,
    		handleSubmit,
    		onSubmit,
    		$rootDirectory,
    		fs,
    		storagePath,
    		donePath,
    		fieldsToObject,
    		saveData,
    		radiobuttongroup_group_binding,
    		selectgroup_value_binding,
    		textinput_value_binding,
    		textarea_value_binding,
    		submit_handler
    	];
    }

    class FormTemplate_components extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { fields: 0, onSubmit: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormTemplate_components",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fields*/ ctx[0] === undefined && !("fields" in props)) {
    			console_1.warn("<FormTemplate_components> was created without expected prop 'fields'");
    		}

    		if (/*onSubmit*/ ctx[2] === undefined && !("onSubmit" in props)) {
    			console_1.warn("<FormTemplate_components> was created without expected prop 'onSubmit'");
    		}
    	}

    	get fields() {
    		throw new Error("<FormTemplate_components>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fields(value) {
    		throw new Error("<FormTemplate_components>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSubmit() {
    		throw new Error("<FormTemplate_components>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSubmit(value) {
    		throw new Error("<FormTemplate_components>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Confetti.component.svelte generated by Svelte v3.19.1 */
    const file$5 = "src\\components\\Confetti.component.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (49:0) {#each confetti as c}
    function create_each_block$3(ctx) {
    	let span;
    	let t_value = /*c*/ ctx[2].character + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			set_style(span, "left", /*c*/ ctx[2].x + "%");
    			set_style(span, "top", /*c*/ ctx[2].y + "%");
    			set_style(span, "transform", "scale(" + /*c*/ ctx[2].r + ")");
    			attr_dev(span, "class", "svelte-5rmhoi");
    			add_location(span, file$5, 49, 1, 873);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*confetti*/ 1 && t_value !== (t_value = /*c*/ ctx[2].character + "")) set_data_dev(t, t_value);

    			if (dirty & /*confetti*/ 1) {
    				set_style(span, "left", /*c*/ ctx[2].x + "%");
    			}

    			if (dirty & /*confetti*/ 1) {
    				set_style(span, "top", /*c*/ ctx[2].y + "%");
    			}

    			if (dirty & /*confetti*/ 1) {
    				set_style(span, "transform", "scale(" + /*c*/ ctx[2].r + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(49:0) {#each confetti as c}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let each_1_anchor;
    	let each_value = /*confetti*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*confetti*/ 1) {
    				each_value = /*confetti*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { characters = [] } = $$props;

    	let confetti = new Array(100).fill().map((_, i) => {
    		return {
    			character: characters[i % characters.length],
    			x: Math.random() * 100,
    			y: -20 - Math.random() * 100,
    			r: 0.1 + Math.random() * 1
    		};
    	}).sort((a, b) => a.r - b.r);

    	onMount(() => {
    		let frame;

    		function loop() {
    			frame = requestAnimationFrame(loop);

    			$$invalidate(0, confetti = confetti.map(emoji => {
    				emoji.y += 0.7 * emoji.r;
    				if (emoji.y > 120) emoji.y = -20;
    				return emoji;
    			}));
    		}

    		loop();
    		return () => cancelAnimationFrame(frame);
    	});

    	const writable_props = ["characters"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Confetti_component> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("characters" in $$props) $$invalidate(1, characters = $$props.characters);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		characters,
    		confetti,
    		Array,
    		Math,
    		requestAnimationFrame,
    		cancelAnimationFrame
    	});

    	$$self.$inject_state = $$props => {
    		if ("characters" in $$props) $$invalidate(1, characters = $$props.characters);
    		if ("confetti" in $$props) $$invalidate(0, confetti = $$props.confetti);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [confetti, characters];
    }

    class Confetti_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { characters: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Confetti_component",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get characters() {
    		throw new Error("<Confetti_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set characters(value) {
    		throw new Error("<Confetti_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\NavBar.component.svelte generated by Svelte v3.19.1 */
    const file$6 = "src\\components\\NavBar.component.svelte";

    // (18:50) 
    function create_if_block_1$1(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "Overview";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "View and Edit";
    			attr_dev(button0, "class", "not-selected svelte-td7udn");
    			add_location(button0, file$6, 18, 12, 727);
    			attr_dev(button1, "class", "selected svelte-td7udn");
    			add_location(button1, file$6, 19, 12, 829);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler_2*/ ctx[5], false, false, false),
    				listen_dev(button1, "click", /*click_handler_3*/ ctx[6], false, false, false)
    			];
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(18:50) ",
    		ctx
    	});

    	return block;
    }

    // (16:8) {#if $currentPage != 'viewEditClip'}
    function create_if_block$1(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Overview");

    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*currentButton*/ ctx[0] === "overview"
    			? "selected"
    			: "not-selected") + " svelte-td7udn"));

    			add_location(button, file$6, 16, 12, 525);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentButton*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*currentButton*/ ctx[0] === "overview"
    			? "selected"
    			: "not-selected") + " svelte-td7udn"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(16:8) {#if $currentPage != 'viewEditClip'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let div0;
    	let button;
    	let t0;
    	let button_class_value;
    	let t1;
    	let t2;
    	let div1;
    	let p;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$currentPage*/ ctx[1] != "viewEditClip") return create_if_block$1;
    		if (/*$currentPage*/ ctx[1] === "viewEditClip") return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			button = element("button");
    			t0 = text("Main");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Echobase";

    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*currentButton*/ ctx[0] === "main"
    			? "selected"
    			: "not-selected") + " svelte-td7udn"));

    			add_location(button, file$6, 14, 8, 341);
    			attr_dev(div0, "class", "button-container");
    			add_location(div0, file$6, 13, 4, 301);
    			attr_dev(p, "class", "nav-logo svelte-td7udn");
    			add_location(p, file$6, 23, 8, 991);
    			attr_dev(div1, "class", "logo-container");
    			add_location(div1, file$6, 22, 4, 953);
    			attr_dev(main, "class", "nav-top svelte-td7udn");
    			add_location(main, file$6, 12, 0, 273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, button);
    			append_dev(button, t0);
    			append_dev(div0, t1);
    			if (if_block) if_block.m(div0, null);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			append_dev(div1, p);
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentButton*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(/*currentButton*/ ctx[0] === "main"
    			? "selected"
    			: "not-selected") + " svelte-td7udn"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (if_block) {
    				if_block.d();
    			}

    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $currentPage;
    	validate_store(currentPage, "currentPage");
    	component_subscribe($$self, currentPage, $$value => $$invalidate(1, $currentPage = $$value));
    	let currentButton = "main";

    	function changeView(pageView) {
    		currentPage.update(src => src = pageView);
    		console.log($currentPage);
    		$$invalidate(0, currentButton = pageView);
    	}

    	const click_handler = () => changeView("main");
    	const click_handler_1 = () => changeView("overview");
    	const click_handler_2 = () => changeView("overview");
    	const click_handler_3 = () => changeView("viewEditClip");

    	$$self.$capture_state = () => ({
    		currentPage,
    		currentButton,
    		changeView,
    		console,
    		$currentPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentButton" in $$props) $$invalidate(0, currentButton = $$props.currentButton);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentButton,
    		$currentPage,
    		changeView,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class NavBar_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar_component",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\SelectMultipleGroup.component.svelte generated by Svelte v3.19.1 */

    const file$7 = "src\\components\\SelectMultipleGroup.component.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (10:4) {#each options as option}
    function create_each_block$4(ctx) {
    	let option;
    	let t0_value = /*option*/ ctx[5].label + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*option*/ ctx[5].value;
    			option.value = option.__value;
    			add_location(option, file$7, 10, 8, 215);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 4 && t0_value !== (t0_value = /*option*/ ctx[5].label + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*options*/ 4 && option_value_value !== (option_value_value = /*option*/ ctx[5].value)) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(10:4) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let h3;
    	let t0;
    	let t1;
    	let select;
    	let dispose;
    	let each_value = /*options*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(/*label*/ ctx[3]);
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "for", /*id*/ ctx[1]);
    			add_location(h3, file$7, 7, 0, 114);
    			select.multiple = true;
    			attr_dev(select, "id", /*id*/ ctx[1]);
    			attr_dev(select, "class", "svelte-ojcvm3");
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$7, 8, 0, 141);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_options(select, /*value*/ ctx[0]);
    			dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[4]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 8) set_data_dev(t0, /*label*/ ctx[3]);

    			if (dirty & /*id*/ 2) {
    				attr_dev(h3, "for", /*id*/ ctx[1]);
    			}

    			if (dirty & /*options*/ 4) {
    				each_value = /*options*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(select, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1) {
    				select_options(select, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { value } = $$props;
    	let { id } = $$props;
    	let { options } = $$props;
    	let { label } = $$props;
    	const writable_props = ["value", "id", "options", "label"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectMultipleGroup_component> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		value = select_multiple_value(this);
    		$$invalidate(0, value);
    		$$invalidate(2, options);
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("options" in $$props) $$invalidate(2, options = $$props.options);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    	};

    	$$self.$capture_state = () => ({ value, id, options, label });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("options" in $$props) $$invalidate(2, options = $$props.options);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, id, options, label, select_change_handler];
    }

    class SelectMultipleGroup_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { value: 0, id: 1, options: 2, label: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectMultipleGroup_component",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<SelectMultipleGroup_component> was created without expected prop 'value'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<SelectMultipleGroup_component> was created without expected prop 'id'");
    		}

    		if (/*options*/ ctx[2] === undefined && !("options" in props)) {
    			console.warn("<SelectMultipleGroup_component> was created without expected prop 'options'");
    		}

    		if (/*label*/ ctx[3] === undefined && !("label" in props)) {
    			console.warn("<SelectMultipleGroup_component> was created without expected prop 'label'");
    		}
    	}

    	get value() {
    		throw new Error("<SelectMultipleGroup_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectMultipleGroup_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<SelectMultipleGroup_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SelectMultipleGroup_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<SelectMultipleGroup_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<SelectMultipleGroup_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<SelectMultipleGroup_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<SelectMultipleGroup_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Filters.component.svelte generated by Svelte v3.19.1 */
    const file$8 = "src\\components\\Filters.component.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[4] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (14:49) 
    function create_if_block_1$2(ctx) {
    	let div;
    	let updating_value;
    	let t;
    	let current;

    	function selectmultiplegroup_value_binding(value) {
    		/*selectmultiplegroup_value_binding*/ ctx[2].call(null, value, /*filter*/ ctx[3]);
    	}

    	let selectmultiplegroup_props = {
    		label: /*filter*/ ctx[3].label,
    		options: /*filter*/ ctx[3].options,
    		id: /*filter*/ ctx[3].id
    	};

    	if (/*filter*/ ctx[3].value !== void 0) {
    		selectmultiplegroup_props.value = /*filter*/ ctx[3].value;
    	}

    	const selectmultiplegroup = new SelectMultipleGroup_component({
    			props: selectmultiplegroup_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectmultiplegroup, "value", selectmultiplegroup_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(selectmultiplegroup.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "select-container svelte-p3g5ei");
    			add_location(div, file$8, 14, 12, 553);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(selectmultiplegroup, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const selectmultiplegroup_changes = {};
    			if (dirty & /*filters*/ 1) selectmultiplegroup_changes.label = /*filter*/ ctx[3].label;
    			if (dirty & /*filters*/ 1) selectmultiplegroup_changes.options = /*filter*/ ctx[3].options;
    			if (dirty & /*filters*/ 1) selectmultiplegroup_changes.id = /*filter*/ ctx[3].id;

    			if (!updating_value && dirty & /*filters*/ 1) {
    				updating_value = true;
    				selectmultiplegroup_changes.value = /*filter*/ ctx[3].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			selectmultiplegroup.$set(selectmultiplegroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectmultiplegroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectmultiplegroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(selectmultiplegroup);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(14:49) ",
    		ctx
    	});

    	return block;
    }

    // (10:8) {#if filter.type === 'single-select'}
    function create_if_block$2(ctx) {
    	let div;
    	let updating_value;
    	let t;
    	let current;

    	function selectgroup_value_binding(value) {
    		/*selectgroup_value_binding*/ ctx[1].call(null, value, /*filter*/ ctx[3]);
    	}

    	let selectgroup_props = {
    		label: /*filter*/ ctx[3].label,
    		options: /*filter*/ ctx[3].options,
    		id: /*filter*/ ctx[3].id
    	};

    	if (/*filter*/ ctx[3].value !== void 0) {
    		selectgroup_props.value = /*filter*/ ctx[3].value;
    	}

    	const selectgroup = new SelectGroup_component({ props: selectgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectgroup, "value", selectgroup_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(selectgroup.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "select-container svelte-p3g5ei");
    			add_location(div, file$8, 10, 12, 319);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(selectgroup, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const selectgroup_changes = {};
    			if (dirty & /*filters*/ 1) selectgroup_changes.label = /*filter*/ ctx[3].label;
    			if (dirty & /*filters*/ 1) selectgroup_changes.options = /*filter*/ ctx[3].options;
    			if (dirty & /*filters*/ 1) selectgroup_changes.id = /*filter*/ ctx[3].id;

    			if (!updating_value && dirty & /*filters*/ 1) {
    				updating_value = true;
    				selectgroup_changes.value = /*filter*/ ctx[3].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			selectgroup.$set(selectgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(selectgroup);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(10:8) {#if filter.type === 'single-select'}",
    		ctx
    	});

    	return block;
    }

    // (9:4) {#each filters as filter}
    function create_each_block$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_if_block_1$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*filter*/ ctx[3].type === "single-select") return 0;
    		if (/*filter*/ ctx[3].type === "multi-select") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(9:4) {#each filters as filter}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let current;
    	let each_value = /*filters*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "filter-container svelte-p3g5ei");
    			add_location(div, file$8, 7, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*filters*/ 1) {
    				each_value = /*filters*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { filters = [] } = $$props;
    	const writable_props = ["filters"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Filters_component> was created with unknown prop '${key}'`);
    	});

    	function selectgroup_value_binding(value, filter) {
    		filter.value = value;
    		$$invalidate(0, filters);
    	}

    	function selectmultiplegroup_value_binding(value, filter) {
    		filter.value = value;
    		$$invalidate(0, filters);
    	}

    	$$self.$set = $$props => {
    		if ("filters" in $$props) $$invalidate(0, filters = $$props.filters);
    	};

    	$$self.$capture_state = () => ({
    		SelectGroup: SelectGroup_component,
    		SelectMultipleGroup: SelectMultipleGroup_component,
    		filters
    	});

    	$$self.$inject_state = $$props => {
    		if ("filters" in $$props) $$invalidate(0, filters = $$props.filters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [filters, selectgroup_value_binding, selectmultiplegroup_value_binding];
    }

    class Filters_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { filters: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filters_component",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get filters() {
    		throw new Error("<Filters_component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filters(value) {
    		throw new Error("<Filters_component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Table.component.svelte generated by Svelte v3.19.1 */
    const file$9 = "src\\components\\Table.component.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	return child_ctx;
    }

    // (405:0) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "🙊🙉🙈";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Uh-oh, no results found!";
    			attr_dev(h2, "class", "intro-text svelte-vylmxi");
    			add_location(h2, file$9, 406, 1, 10515);
    			attr_dev(p, "class", "intro-text svelte-vylmxi");
    			add_location(p, file$9, 407, 1, 10552);
    			attr_dev(div, "class", "no-results-container svelte-vylmxi");
    			add_location(div, file$9, 405, 0, 10478);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(405:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (360:0) {#if hasData}
    function create_if_block$3(ctx) {
    	let div1;
    	let div0;
    	let table;
    	let tr;
    	let t0;
    	let t1;
    	let div7;
    	let div3;
    	let div2;
    	let t2;
    	let t3_value = /*counter*/ ctx[5] / /*maxEntriesShown*/ ctx[9] + 1 + "";
    	let t3;
    	let t4;
    	let t5_value = Math.ceil(/*filteredResults*/ ctx[7].length / /*maxEntriesShown*/ ctx[9]) + "";
    	let t5;
    	let t6;
    	let div5;
    	let div4;
    	let t7_value = /*counter*/ ctx[5] + 1 + "";
    	let t7;
    	let t8;

    	let t9_value = (/*counter*/ ctx[5] + /*maxEntriesShown*/ ctx[9] > /*filteredResults*/ ctx[7].length
    	? /*filteredResults*/ ctx[7].length
    	: /*counter*/ ctx[5] + /*maxEntriesShown*/ ctx[9]) + "";

    	let t9;
    	let t10;
    	let t11_value = /*filteredResults*/ ctx[7].length + "";
    	let t11;
    	let t12;
    	let t13;
    	let div6;
    	let button0;
    	let t15;
    	let button1;
    	let dispose;
    	let each_value_1 = /*colHeadings*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*rowData*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			table = element("table");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div7 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			t2 = text("Page ");
    			t3 = text(t3_value);
    			t4 = text(" of ");
    			t5 = text(t5_value);
    			t6 = space();
    			div5 = element("div");
    			div4 = element("div");
    			t7 = text(t7_value);
    			t8 = text(" to ");
    			t9 = text(t9_value);
    			t10 = text(" entries out of ");
    			t11 = text(t11_value);
    			t12 = text(" total results");
    			t13 = space();
    			div6 = element("div");
    			button0 = element("button");
    			button0.textContent = "Previous";
    			t15 = space();
    			button1 = element("button");
    			button1.textContent = "Next";
    			attr_dev(tr, "class", "svelte-vylmxi");
    			add_location(tr, file$9, 363, 4, 8889);
    			set_style(table, "width", "100%");
    			attr_dev(table, "class", "svelte-vylmxi");
    			add_location(table, file$9, 362, 3, 8857);
    			attr_dev(div0, "class", "table-div-container-inner svelte-vylmxi");
    			add_location(div0, file$9, 361, 2, 8813);
    			attr_dev(div1, "class", "table-div-container svelte-vylmxi");
    			add_location(div1, file$9, 360, 1, 8754);
    			attr_dev(div2, "class", "table-page-number svelte-vylmxi");
    			add_location(div2, file$9, 394, 3, 9813);
    			attr_dev(div3, "class", "table-page-number-container svelte-vylmxi");
    			add_location(div3, file$9, 393, 2, 9767);
    			attr_dev(div4, "class", "table-results-counter svelte-vylmxi");
    			add_location(div4, file$9, 397, 3, 10005);
    			attr_dev(div5, "class", "table-results-counter-container svelte-vylmxi");
    			add_location(div5, file$9, 396, 2, 9955);
    			attr_dev(button0, "class", "table-button svelte-vylmxi");
    			add_location(button0, file$9, 400, 3, 10246);
    			attr_dev(button1, "class", "table-button svelte-vylmxi");
    			add_location(button1, file$9, 401, 3, 10352);
    			attr_dev(div6, "class", "svelte-vylmxi");
    			add_location(div6, file$9, 399, 2, 10236);
    			attr_dev(div7, "class", "table-button-container svelte-vylmxi");
    			add_location(div7, file$9, 392, 1, 9727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, table);
    			append_dev(table, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			/*div1_binding*/ ctx[25](div1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div3);
    			append_dev(div3, div2);
    			append_dev(div2, t2);
    			append_dev(div2, t3);
    			append_dev(div2, t4);
    			append_dev(div2, t5);
    			append_dev(div7, t6);
    			append_dev(div7, div5);
    			append_dev(div5, div4);
    			append_dev(div4, t7);
    			append_dev(div4, t8);
    			append_dev(div4, t9);
    			append_dev(div4, t10);
    			append_dev(div4, t11);
    			append_dev(div4, t12);
    			append_dev(div7, t13);
    			append_dev(div7, div6);
    			append_dev(div6, button0);
    			/*button0_binding*/ ctx[26](button0);
    			append_dev(div6, t15);
    			append_dev(div6, button1);
    			/*button1_binding*/ ctx[28](button1);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[27], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[29], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*colHeadings*/ 2) {
    				each_value_1 = /*colHeadings*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*openClip, rowData*/ 32772) {
    				each_value = /*rowData*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*counter*/ 32 && t3_value !== (t3_value = /*counter*/ ctx[5] / /*maxEntriesShown*/ ctx[9] + 1 + "")) set_data_dev(t3, t3_value);
    			if (dirty[0] & /*filteredResults*/ 128 && t5_value !== (t5_value = Math.ceil(/*filteredResults*/ ctx[7].length / /*maxEntriesShown*/ ctx[9]) + "")) set_data_dev(t5, t5_value);
    			if (dirty[0] & /*counter*/ 32 && t7_value !== (t7_value = /*counter*/ ctx[5] + 1 + "")) set_data_dev(t7, t7_value);

    			if (dirty[0] & /*counter, filteredResults*/ 160 && t9_value !== (t9_value = (/*counter*/ ctx[5] + /*maxEntriesShown*/ ctx[9] > /*filteredResults*/ ctx[7].length
    			? /*filteredResults*/ ctx[7].length
    			: /*counter*/ ctx[5] + /*maxEntriesShown*/ ctx[9]) + "")) set_data_dev(t9, t9_value);

    			if (dirty[0] & /*filteredResults*/ 128 && t11_value !== (t11_value = /*filteredResults*/ ctx[7].length + "")) set_data_dev(t11, t11_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[25](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div7);
    			/*button0_binding*/ ctx[26](null);
    			/*button1_binding*/ ctx[28](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(360:0) {#if hasData}",
    		ctx
    	});

    	return block;
    }

    // (368:6) {:else}
    function create_else_block(ctx) {
    	let th;
    	let t_value = /*heading*/ ctx[33] + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			attr_dev(th, "class", "svelte-vylmxi");
    			add_location(th, file$9, 368, 7, 9021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*colHeadings*/ 2 && t_value !== (t_value = /*heading*/ ctx[33] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(368:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (366:6) {#if heading === "Filename"}
    function create_if_block_1$3(ctx) {
    	let th;

    	const block = {
    		c: function create() {
    			th = element("th");
    			th.textContent = "View and Edit";
    			attr_dev(th, "class", "svelte-vylmxi");
    			add_location(th, file$9, 366, 7, 8975);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(366:6) {#if heading === \\\"Filename\\\"}",
    		ctx
    	});

    	return block;
    }

    // (365:5) {#each colHeadings as heading}
    function create_each_block_1(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*heading*/ ctx[33] === "Filename") return create_if_block_1$3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(365:5) {#each colHeadings as heading}",
    		ctx
    	});

    	return block;
    }

    // (373:4) {#each rowData as row}
    function create_each_block$6(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[30].View + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*row*/ ctx[30].Quality + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*row*/ ctx[30].Gain + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*row*/ ctx[30].Orientation + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*row*/ ctx[30].Depth + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*row*/ ctx[30].Focus + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12_value = /*row*/ ctx[30].Frequency + "";
    	let t12;
    	let t13;
    	let td7;
    	let t14_value = /*row*/ ctx[30].Physiology + "";
    	let t14;
    	let t15;
    	let td8;
    	let t16_value = /*row*/ ctx[30]["Cardiac Cycles"] + "";
    	let t16;
    	let t17;
    	let td9;
    	let t18_value = /*row*/ ctx[30].Comments + "";
    	let t18;
    	let t19;
    	let td10;
    	let t20_value = /*row*/ ctx[30].Bookmark + "";
    	let t20;
    	let t21;
    	let td11;
    	let button;
    	let t23;
    	let dispose;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td6 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			td7 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td8 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td9 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td10 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td11 = element("td");
    			button = element("button");
    			button.textContent = "Open";
    			t23 = space();
    			attr_dev(td0, "class", "svelte-vylmxi");
    			add_location(td0, file$9, 375, 6, 9214);
    			attr_dev(td1, "class", "svelte-vylmxi");
    			add_location(td1, file$9, 376, 6, 9241);
    			attr_dev(td2, "class", "svelte-vylmxi");
    			add_location(td2, file$9, 377, 6, 9271);
    			attr_dev(td3, "class", "svelte-vylmxi");
    			add_location(td3, file$9, 378, 6, 9298);
    			attr_dev(td4, "class", "svelte-vylmxi");
    			add_location(td4, file$9, 379, 6, 9332);
    			attr_dev(td5, "class", "svelte-vylmxi");
    			add_location(td5, file$9, 380, 6, 9360);
    			attr_dev(td6, "class", "svelte-vylmxi");
    			add_location(td6, file$9, 381, 6, 9388);
    			attr_dev(td7, "class", "svelte-vylmxi");
    			add_location(td7, file$9, 382, 6, 9420);
    			attr_dev(td8, "class", "svelte-vylmxi");
    			add_location(td8, file$9, 383, 6, 9453);
    			attr_dev(td9, "class", "td-long-text svelte-vylmxi");
    			add_location(td9, file$9, 384, 6, 9493);
    			attr_dev(td10, "class", "svelte-vylmxi");
    			add_location(td10, file$9, 385, 6, 9545);
    			attr_dev(button, "class", "td-filename-button svelte-vylmxi");
    			add_location(button, file$9, 386, 10, 9580);
    			attr_dev(td11, "class", "svelte-vylmxi");
    			add_location(td11, file$9, 386, 6, 9576);
    			attr_dev(tr, "class", "svelte-vylmxi");
    			add_location(tr, file$9, 373, 5, 9112);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			append_dev(td5, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td6);
    			append_dev(td6, t12);
    			append_dev(tr, t13);
    			append_dev(tr, td7);
    			append_dev(td7, t14);
    			append_dev(tr, t15);
    			append_dev(tr, td8);
    			append_dev(td8, t16);
    			append_dev(tr, t17);
    			append_dev(tr, td9);
    			append_dev(td9, t18);
    			append_dev(tr, t19);
    			append_dev(tr, td10);
    			append_dev(td10, t20);
    			append_dev(tr, t21);
    			append_dev(tr, td11);
    			append_dev(td11, button);
    			append_dev(tr, t23);

    			dispose = listen_dev(
    				button,
    				"click",
    				function () {
    					if (is_function(/*openClip*/ ctx[15](/*row*/ ctx[30].Filename))) /*openClip*/ ctx[15](/*row*/ ctx[30].Filename).apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*rowData*/ 4 && t0_value !== (t0_value = /*row*/ ctx[30].View + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*rowData*/ 4 && t2_value !== (t2_value = /*row*/ ctx[30].Quality + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*rowData*/ 4 && t4_value !== (t4_value = /*row*/ ctx[30].Gain + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*rowData*/ 4 && t6_value !== (t6_value = /*row*/ ctx[30].Orientation + "")) set_data_dev(t6, t6_value);
    			if (dirty[0] & /*rowData*/ 4 && t8_value !== (t8_value = /*row*/ ctx[30].Depth + "")) set_data_dev(t8, t8_value);
    			if (dirty[0] & /*rowData*/ 4 && t10_value !== (t10_value = /*row*/ ctx[30].Focus + "")) set_data_dev(t10, t10_value);
    			if (dirty[0] & /*rowData*/ 4 && t12_value !== (t12_value = /*row*/ ctx[30].Frequency + "")) set_data_dev(t12, t12_value);
    			if (dirty[0] & /*rowData*/ 4 && t14_value !== (t14_value = /*row*/ ctx[30].Physiology + "")) set_data_dev(t14, t14_value);
    			if (dirty[0] & /*rowData*/ 4 && t16_value !== (t16_value = /*row*/ ctx[30]["Cardiac Cycles"] + "")) set_data_dev(t16, t16_value);
    			if (dirty[0] & /*rowData*/ 4 && t18_value !== (t18_value = /*row*/ ctx[30].Comments + "")) set_data_dev(t18, t18_value);
    			if (dirty[0] & /*rowData*/ 4 && t20_value !== (t20_value = /*row*/ ctx[30].Bookmark + "")) set_data_dev(t20, t20_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(373:4) {#each rowData as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div2;
    	let span0;
    	let t0;
    	let div0;
    	let input;
    	let t1;
    	let div1;
    	let button0;
    	let t3;
    	let div3;
    	let t4;
    	let div4;
    	let span1;
    	let t5;
    	let button1;
    	let t7;
    	let button2;
    	let t9;
    	let if_block_anchor;
    	let current;
    	let dispose;

    	const filters_1 = new Filters_component({
    			props: { filters: /*filters*/ ctx[10] },
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*hasData*/ ctx[0]) return create_if_block$3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			span0 = element("span");
    			t0 = space();
    			div0 = element("div");
    			input = element("input");
    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Clear Search";
    			t3 = space();
    			div3 = element("div");
    			create_component(filters_1.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			span1 = element("span");
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Clear Filters";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "Apply Filters";
    			t9 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(span0, "class", "svelte-vylmxi");
    			add_location(span0, file$9, 343, 1, 8134);
    			attr_dev(input, "class", "searchbar svelte-vylmxi");
    			attr_dev(input, "placeholder", "🔎 Global search");
    			attr_dev(input, "id", "searchbar");
    			attr_dev(input, "name", "searchbar");
    			attr_dev(input, "type", "text");
    			add_location(input, file$9, 345, 2, 8159);
    			attr_dev(div0, "class", "svelte-vylmxi");
    			add_location(div0, file$9, 344, 1, 8150);
    			attr_dev(button0, "class", "clear-search-button svelte-vylmxi");
    			add_location(button0, file$9, 348, 2, 8318);
    			attr_dev(div1, "class", "svelte-vylmxi");
    			add_location(div1, file$9, 347, 1, 8309);
    			attr_dev(div2, "class", "searchbar-container svelte-vylmxi");
    			add_location(div2, file$9, 342, 0, 8098);
    			attr_dev(div3, "class", "filter-container svelte-vylmxi");
    			add_location(div3, file$9, 351, 0, 8417);
    			attr_dev(span1, "class", "filter-button-filler svelte-vylmxi");
    			add_location(span1, file$9, 355, 1, 8528);
    			attr_dev(button1, "class", "filter-button svelte-vylmxi");
    			add_location(button1, file$9, 356, 1, 8573);
    			attr_dev(button2, "class", "filter-button svelte-vylmxi");
    			add_location(button2, file$9, 357, 1, 8652);
    			attr_dev(div4, "class", "filter-button-container svelte-vylmxi");
    			add_location(div4, file$9, 354, 0, 8488);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span0);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*value*/ ctx[6]);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(filters_1, div3, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, span1);
    			append_dev(div4, t5);
    			append_dev(div4, button1);
    			append_dev(div4, t7);
    			append_dev(div4, button2);
    			insert_dev(target, t9, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[24]),
    				listen_dev(input, "keyup", /*handleKeydown*/ ctx[16], false, false, false),
    				listen_dev(button0, "click", /*clearSearch*/ ctx[12], false, false, false),
    				listen_dev(button1, "click", /*clearFilters*/ ctx[14], false, false, false),
    				listen_dev(button2, "click", /*applyFilters*/ ctx[13], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 64 && input.value !== /*value*/ ctx[6]) {
    				set_input_value(input, /*value*/ ctx[6]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filters_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filters_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			destroy_component(filters_1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t9);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $rootDirectory;
    	validate_store(rootDirectory, "rootDirectory");
    	component_subscribe($$self, rootDirectory, $$value => $$invalidate(19, $rootDirectory = $$value));
    	const fs = window.require("fs");

    	// read data folder
    	// this does not scale well!!
    	// my poor RAM
    	const dataDir = $rootDirectory + "/data/";

    	let dataArray = fs.readdirSync(dataDir);

    	// check if there's saved data (or filtered data)
    	let hasData;

    	// for the table
    	let colHeadings;

    	let rowData;
    	let prevButton;
    	let nextButton;
    	let counter = 0;
    	let maxEntriesShown = 30;
    	let value = "";
    	let appliedFilters = [];

    	let filters = [
    		{
    			value: "None",
    			label: "View",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{ label: "4C", value: "4C" },
    				{ label: "5C", value: "5C" },
    				{ label: "PLSX", value: "PLSX" },
    				{ label: "PSAXb", value: "PSAXb" },
    				{ label: "PSAXm", value: "PSAXm" },
    				{ label: "PSAXa", value: "PSAXa" },
    				{ label: "AVSX", value: "AVSX" },
    				{ label: "SC", value: "SC" },
    				{ label: "RISV", value: "RISV" },
    				{ label: "Lung", value: "Lung" },
    				{ label: "Other", value: "Other" }
    			],
    			id: "view-filter",
    			type: "multi-select"
    		},
    		{
    			value: "None",
    			label: "Quality",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{ label: "0", value: 0 },
    				{ label: "1", value: 1 },
    				{ label: "2", value: 2 },
    				{ label: "3", value: 3 }
    			],
    			id: "quality-filter",
    			type: "multi-select"
    		},
    		{
    			value: "None",
    			label: "Gain",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{
    					label: "Under gained",
    					value: "Under gained"
    				},
    				{ label: "Optimal", value: "Optimal" },
    				{ label: "Overgained", value: "Overgained" }
    			],
    			id: "gain-filter",
    			type: "single-select"
    		},
    		{
    			value: "None",
    			label: "Orientation",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{ label: "Correct", value: "Correct" },
    				{ label: "Incorrect", value: "Incorrect" }
    			],
    			id: "orientation-filter",
    			type: "single-select"
    		},
    		{
    			value: "None",
    			label: "Depth",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{
    					label: "Appropriate",
    					value: "Appropriate"
    				},
    				{
    					label: "Inappropriate",
    					value: "Inappropriate"
    				}
    			],
    			id: "depth-filter",
    			type: "single-select"
    		},
    		{
    			value: "None",
    			label: "Focus",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{
    					label: "Appropriate",
    					value: "Appropriate"
    				},
    				{
    					label: "Inappropriate",
    					value: "Inappropriate"
    				}
    			],
    			id: "focus-filter",
    			type: "single-select"
    		},
    		{
    			value: "None",
    			label: "Frequency",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{
    					label: "Appropriate",
    					value: "Appropriate"
    				},
    				{
    					label: "Inappropriate",
    					value: "Inappropriate"
    				}
    			],
    			id: "frequency-filter",
    			type: "single-select"
    		},
    		{
    			value: "None",
    			label: "Physiology",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{ label: "Normal", value: "Normal" },
    				{ label: "Abnormal", value: "Abnormal" }
    			],
    			id: "physiology-filter",
    			type: "single-select"
    		},
    		{
    			value: "None",
    			label: "Cardiac Cycles",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{ label: "0", value: 0 },
    				{ label: "1", value: 1 },
    				{ label: "2", value: 2 },
    				{ label: "3", value: 3 }
    			],
    			id: "cardiac-cycles-filter",
    			type: "multi-select"
    		},
    		{
    			name: "Bookmark",
    			label: "Bookmark",
    			options: [
    				{ label: "Not filtered", value: "None" },
    				{ label: "Yes", value: "Yes" },
    				{ label: "No", value: "No" }
    			],
    			id: "bookmarked-filter",
    			type: "single-select"
    		}
    	];

    	// this is the array we'll store data in when we apply filters/search terms
    	let filteredResults;

    	if (dataArray.length === 0) {
    		hasData = false;
    	} else {
    		// prevButton.disabled = true;
    		hasData = true;

    		// this will be the data we filter through
    		dataArray = dataArray.map(data => JSON.parse(fs.readFileSync(dataDir + data)));

    		filteredResults = dataArray;
    		populateTable();
    	}

    	onMount(() => {
    		$$invalidate(3, prevButton.disabled = true, prevButton);

    		if (filteredResults.length < maxEntriesShown) {
    			$$invalidate(4, nextButton.disabled = true, nextButton);
    		}
    	});

    	function scrollToTop() {
    		container.scrollTo({ top: 0, behavior: "smooth" });
    	}

    	function changePage(modifier) {
    		$$invalidate(5, counter += maxEntriesShown * modifier);
    		scrollToTop();

    		if (counter + maxEntriesShown >= filteredResults.length) {
    			$$invalidate(4, nextButton.disabled = true, nextButton);
    		} else {
    			$$invalidate(4, nextButton.disabled = false, nextButton);
    		}

    		if (counter <= 0) {
    			$$invalidate(3, prevButton.disabled = true, prevButton);
    		} else {
    			$$invalidate(3, prevButton.disabled = false, prevButton);
    		}

    		populateTable();
    	}

    	// this function is so bad
    	function populateTable() {
    		let searchTerms = value;
    		let tempResults = [];

    		// reload data flag when redrawing the table
    		$$invalidate(0, hasData = true);

    		// this has to search for unique terms
    		if (searchTerms != "") {
    			dataArray.forEach(data => {
    				Object.values(data).forEach(v => {
    					v = String(v).toLowerCase();

    					if (v.includes(searchTerms.toLowerCase())) {
    						tempResults = [...tempResults, data];
    					}
    				});
    			});

    			if (tempResults.length > 0) {
    				// need to add this otherwise the array will continue to add on itself
    				$$invalidate(7, filteredResults = tempResults);
    			} else {
    				console.log("no results");
    				$$invalidate(0, hasData = false);
    			}
    		} else {
    			$$invalidate(7, filteredResults = dataArray);
    		}

    		// only called when categorical filters are applied
    		if (appliedFilters.length != 0) {
    			// store filtered results temporarily
    			let localTemp = [];

    			appliedFilters.forEach(filter => {
    				// first check whether the filter is an array
    				if (Array.isArray(filter.value)) {
    					filter.value.forEach(arrayVal => {
    						filteredResults.forEach(v => {
    							console.log(arrayVal);
    							console.log(v[filter.label]);

    							if (v[filter.label] === arrayVal) {
    								localTemp = [...localTemp, v];
    							}
    						});
    					});
    				} else {
    					localTemp = filteredResults.filter(v => {
    						return v[filter.label] === filter.value;
    					});
    				}

    				$$invalidate(7, filteredResults = localTemp);
    			});

    			if (filteredResults == 0) {
    				$$invalidate(0, hasData = false);
    			}
    		}

    		// we only want a subset of the data at a time
    		let shownResults = [];

    		if (filteredResults.length <= maxEntriesShown) {
    			shownResults = filteredResults.slice(0, filteredResults.length);
    		} else {
    			shownResults = filteredResults.slice(counter, counter + maxEntriesShown);
    		}

    		// create columns based on keys on the original unchanging data
    		$$invalidate(1, colHeadings = Object.keys(dataArray[0]));

    		// create rows based on values 
    		$$invalidate(2, rowData = Object.values(shownResults));

    		// add link to video clip to each row
    		console.log(rowData);

    		//truncate length of comments to be displayed
    		rowData.forEach(data => {
    			if (data.Comments.length >= 50) {
    				data.Comments = data.Comments.slice(0, 50) + "...";
    			}
    		});
    	}

    	function clearSearch() {
    		$$invalidate(6, value = "");
    		populateTable();
    	}

    	function applyFilters() {
    		appliedFilters = [];

    		filters.forEach(filter => {
    			if (filter.value != "None") {
    				let label = filter.label;
    				let value = filter.value;
    				let obj = { label, value };
    				appliedFilters.push(obj);
    			}
    		});

    		populateTable();
    	}

    	function clearFilters() {
    		appliedFilters = [];

    		filters.forEach(v => {
    			v.value = "None";
    			v.options.label = "Not filtered";
    			v.options.value = "None";
    		});

    		populateTable();
    	}

    	function openClip(fileName) {
    		currentPage.update(src => src = "viewEditClip");
    		const file = "__anon__" + fileName;
    		const filepath = $rootDirectory + "/done/" + file;
    		videoToEdit.update(src => src = file);
    		videoPathToEdit.update(src => src = filepath);
    		console.log(filepath);
    	}

    	// to reference container for autoscroll
    	let container;

    	function handleKeydown() {
    		populateTable();
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(6, value);
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(8, container = $$value);
    		});
    	}

    	function button0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, prevButton = $$value);
    		});
    	}

    	const click_handler = () => changePage(-1);

    	function button1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, nextButton = $$value);
    		});
    	}

    	const click_handler_1 = () => changePage(1);

    	$$self.$capture_state = () => ({
    		onMount,
    		videoToEdit,
    		videoPathToEdit,
    		rootDirectory,
    		currentPage,
    		Filters: Filters_component,
    		fs,
    		dataDir,
    		dataArray,
    		hasData,
    		colHeadings,
    		rowData,
    		prevButton,
    		nextButton,
    		counter,
    		maxEntriesShown,
    		value,
    		appliedFilters,
    		filters,
    		filteredResults,
    		scrollToTop,
    		changePage,
    		populateTable,
    		clearSearch,
    		applyFilters,
    		clearFilters,
    		openClip,
    		container,
    		handleKeydown,
    		window,
    		$rootDirectory,
    		JSON,
    		Object,
    		String,
    		console,
    		Array
    	});

    	$$self.$inject_state = $$props => {
    		if ("dataArray" in $$props) dataArray = $$props.dataArray;
    		if ("hasData" in $$props) $$invalidate(0, hasData = $$props.hasData);
    		if ("colHeadings" in $$props) $$invalidate(1, colHeadings = $$props.colHeadings);
    		if ("rowData" in $$props) $$invalidate(2, rowData = $$props.rowData);
    		if ("prevButton" in $$props) $$invalidate(3, prevButton = $$props.prevButton);
    		if ("nextButton" in $$props) $$invalidate(4, nextButton = $$props.nextButton);
    		if ("counter" in $$props) $$invalidate(5, counter = $$props.counter);
    		if ("maxEntriesShown" in $$props) $$invalidate(9, maxEntriesShown = $$props.maxEntriesShown);
    		if ("value" in $$props) $$invalidate(6, value = $$props.value);
    		if ("appliedFilters" in $$props) appliedFilters = $$props.appliedFilters;
    		if ("filters" in $$props) $$invalidate(10, filters = $$props.filters);
    		if ("filteredResults" in $$props) $$invalidate(7, filteredResults = $$props.filteredResults);
    		if ("container" in $$props) $$invalidate(8, container = $$props.container);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hasData,
    		colHeadings,
    		rowData,
    		prevButton,
    		nextButton,
    		counter,
    		value,
    		filteredResults,
    		container,
    		maxEntriesShown,
    		filters,
    		changePage,
    		clearSearch,
    		applyFilters,
    		clearFilters,
    		openClip,
    		handleKeydown,
    		dataArray,
    		appliedFilters,
    		$rootDirectory,
    		fs,
    		dataDir,
    		scrollToTop,
    		populateTable,
    		input_input_handler,
    		div1_binding,
    		button0_binding,
    		click_handler,
    		button1_binding,
    		click_handler_1
    	];
    }

    class Table_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table_component",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    let formFields = [
        {
            name: 'View',
            type:'select',
            value: '4C',
            label: '🔭 What view is it?',
            id: 'view',
            options: [
                {label: 'Apical FOUR Chamber', value: '4C'},
                {label: 'Apical FIVE Chamber', value: '5C'},
                {label: 'Parasternal Long Axis', value: 'PLSX'},
                {label: 'Parasternal Short Axis BASAL', value: 'PSAXb'},
                {label: 'Parasternal Short Axis MIDDLE', value: 'PSAXm'},
                {label: 'Parasternal Short Axis APICAL', value: 'PSAXa'},
                {label: 'Aortic Valve Short Axis', value: 'AVSX'},
                {label: 'Subcostal Four Chamber', value: 'SC'},
                {label: 'Right Lateral IVC/SV IVC View', value: 'RISV'},
                {label: 'Lung', value: 'Lung'},
                {label: 'Other', value: 'Other'},
            ]
        },
        {
            name: 'Quality',
            type: 'radio',
            value: 0,
            label: "📸 How's the image quality?",
            id: 'quality',
            options: [
                {label: 'View cannot be identified clearly', value: 0},
                {label: 'View can be identified but diagnosis very difficult/impossible', value: 1},
                {label: 'Most aspects can be diagnosed but image can be clearer', value: 2},
                {label: 'All diagnostic features visible and clear', value: 3},
            ]
        },
        {
            name: 'Gain',
            type: 'radio',
            value: 'NaN',
            label: "☀ How's the gain?",
            id: 'gain',
            options: [
                {label: 'Under gained', value: 'Under gained'},
                {label: 'Optimal', value: 'Optimal'},
                {label: 'Overgained', value: 'Overgained'},
            ]
        },
        {
            name: 'Orientation',
            type: 'radio',
            value: 'NaN',
            label: "🧭 Is the orientation correct?",
            id: 'orientation',
            options: [
                {label: 'Yes', value: 'Correct'},
                {label: 'No', value: 'Incorrect'},
            ]
        },
        {
            name: 'Depth',
            type: 'radio',
            value: 'NaN',
            label: '⛏ Is the depth appropriate?',
            id: 'depth',
            options: [
                {label: 'Yes', value: 'Appropriate'},
                {label: 'No', value: 'Inappropriate'},
            ]
        },
        {
            name: 'Focus',
            type: 'radio',
            value: 'NaN',
            label: '🔬 Is the focus appropriate?',
            id: 'focus',
            options: [
                {label: 'Yes', value: 'Appropriate'},
                {label: 'No', value: 'Inappropriate'},
            ]
        },
        {
            name: 'Frequency',
            type: 'radio',
            value: 'NaN',
            label: '🔊 Is the frequecy appropriate?',
            id: 'frequency',
            options: [
                {label: 'Yes', value: 'Appropriate'},
                {label: 'No', value: 'Inappropriate'},
            ]
        },
        {
            name: 'Physiology',
            type: 'radio',
            value: 'NaN',
            label: '🩺 Is the physiology normal?',
            id: 'normal_physiology',
            options: [
                {label: 'Yes', value: 'Normal'},
                {label: 'No', value: 'Abnormal'},
            ]
        },
        {
            name: 'Cardiac Cycles',
            type: 'radio',
            value: 0,
            label: '💓 How many cardiac cycles?',
            id: 'num_cardiac_cycles',
            options: [
                {label: 0, value: 0},
                {label: 1, value: 1},
                {label: 2, value: 2},
                {label: 3, value: 3},
            ]
        },
        {
            name: 'Comments',
            type: 'text-area',
            id: 'comments',
            value: '',
            label: '📝 Any comments?',
            placeholder: 'Please leave any additional comments you have (optional)...'
        },
        {
            name: 'Bookmark',
            type: 'radio',
            value: 'No',
            label: '📑 Bookmark this clip for future reference?',
            options: [
                {label: 'Yes', value: 'Yes'},
                {label: 'No', value: 'No'},
            ]
        }
    ];

    /* src\App.svelte generated by Svelte v3.19.1 */

    const file$a = "src\\App.svelte";

    // (113:29) 
    function create_if_block_3$1(ctx) {
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const navbar = new NavBar_component({ $$inline: true });

    	const if_block_creators = [
    		create_if_block_4,
    		create_if_block_5,
    		create_if_block_6,
    		create_if_block_7,
    		create_else_block$1
    	];

    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*$videoSource*/ ctx[3] === "done") return 0;
    		if (/*$currentPage*/ ctx[4] === "main") return 1;
    		if (/*$currentPage*/ ctx[4] === "overview") return 2;
    		if (/*$currentPage*/ ctx[4] === "viewEditClip") return 3;
    		return 4;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(113:29) ",
    		ctx
    	});

    	return block;
    }

    // (88:0) {#if isDataSet === false}
    function create_if_block$4(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let div1;

    	function select_block_type_1(ctx, dirty) {
    		if (/*$videoSource*/ ctx[3] === "") return create_if_block_1$4;
    		if (/*$videoSource*/ ctx[3] === "loading") return create_if_block_2$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Echobase";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "svelte-g22xgr");
    			add_location(h1, file$a, 89, 1, 2484);
    			attr_dev(div0, "class", "header svelte-g22xgr");
    			add_location(div0, file$a, 88, 0, 2461);
    			attr_dev(div1, "class", "startup-child svelte-g22xgr");
    			add_location(div1, file$a, 92, 1, 2535);
    			attr_dev(div2, "class", "startup svelte-g22xgr");
    			add_location(div2, file$a, 91, 0, 2511);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(88:0) {#if isDataSet === false}",
    		ctx
    	});

    	return block;
    }

    // (148:2) {:else}
    function create_else_block$1(ctx) {
    	let div_1;
    	let t0;
    	let h2;
    	let t1;
    	let br;
    	let t2;
    	let current;
    	const navbar = new NavBar_component({ $$inline: true });

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h2 = element("h2");
    			t1 = text("Uh-oh, something happened! ");
    			br = element("br");
    			t2 = text("💩");
    			attr_dev(br, "class", "svelte-g22xgr");
    			add_location(br, file$a, 150, 52, 4154);
    			attr_dev(h2, "class", "outro-text svelte-g22xgr");
    			add_location(h2, file$a, 150, 2, 4104);
    			attr_dev(div_1, "class", "svelte-g22xgr");
    			add_location(div_1, file$a, 148, 1, 4081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);
    			mount_component(navbar, div_1, null);
    			append_dev(div_1, t0);
    			append_dev(div_1, h2);
    			append_dev(h2, t1);
    			append_dev(h2, br);
    			append_dev(h2, t2);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);
    			destroy_component(navbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(148:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (134:44) 
    function create_if_block_7(ctx) {
    	let div0;
    	let h2;
    	let t0;
    	let t1;
    	let t2;
    	let main;
    	let div1;
    	let video;
    	let video_src_value;
    	let t3;
    	let div3;
    	let div2;
    	let current;
    	let dispose;

    	const formtemplate = new FormTemplate_components({
    			props: {
    				onSubmit: /*func_1*/ ctx[17],
    				fields: /*fields*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text("Clip: ");
    			t1 = text(/*$videoPathToEdit*/ ctx[5]);
    			t2 = space();
    			main = element("main");
    			div1 = element("div");
    			video = element("video");
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(formtemplate.$$.fragment);
    			attr_dev(h2, "class", "svelte-g22xgr");
    			add_location(h2, file$a, 135, 4, 3701);
    			attr_dev(div0, "class", "svelte-g22xgr");
    			add_location(div0, file$a, 134, 3, 3689);
    			if (video.src !== (video_src_value = /*$videoPathToEdit*/ ctx[5])) attr_dev(video, "src", video_src_value);
    			video.autoplay = true;
    			video.loop = true;
    			video.muted = true;
    			attr_dev(video, "class", "svelte-g22xgr");
    			add_location(video, file$a, 139, 5, 3831);
    			attr_dev(div1, "class", "videoPlayer svelte-g22xgr");
    			add_location(div1, file$a, 138, 4, 3799);
    			attr_dev(div2, "class", "form svelte-g22xgr");
    			add_location(div2, file$a, 142, 5, 3945);
    			attr_dev(div3, "class", "form-div svelte-g22xgr");
    			add_location(div3, file$a, 141, 4, 3900);
    			attr_dev(main, "class", "main svelte-g22xgr");
    			add_location(main, file$a, 137, 3, 3750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, video);
    			append_dev(main, t3);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			mount_component(formtemplate, div2, null);
    			/*div3_binding*/ ctx[18](div3);
    			current = true;
    			dispose = listen_dev(main, "load", /*setFormData*/ ctx[7](), false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$videoPathToEdit*/ 32) set_data_dev(t1, /*$videoPathToEdit*/ ctx[5]);

    			if (!current || dirty & /*$videoPathToEdit*/ 32 && video.src !== (video_src_value = /*$videoPathToEdit*/ ctx[5])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			const formtemplate_changes = {};
    			if (dirty & /*fields*/ 1) formtemplate_changes.fields = /*fields*/ ctx[0];
    			formtemplate.$set(formtemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formtemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formtemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(main);
    			destroy_component(formtemplate);
    			/*div3_binding*/ ctx[18](null);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(134:44) ",
    		ctx
    	});

    	return block;
    }

    // (132:40) 
    function create_if_block_6(ctx) {
    	let current;
    	const table = new Table_component({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(table.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(table, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(table, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(132:40) ",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if $currentPage === 'main'}
    function create_if_block_5(ctx) {
    	let main;
    	let div0;
    	let video;
    	let video_src_value;
    	let t;
    	let div2;
    	let div1;
    	let current;

    	const formtemplate = new FormTemplate_components({
    			props: {
    				onSubmit: /*func*/ ctx[15],
    				fields: /*fields*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			video = element("video");
    			t = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(formtemplate.$$.fragment);
    			if (video.src !== (video_src_value = /*$videoSource*/ ctx[3])) attr_dev(video, "src", video_src_value);
    			video.autoplay = true;
    			video.loop = true;
    			video.muted = true;
    			attr_dev(video, "class", "svelte-g22xgr");
    			add_location(video, file$a, 123, 5, 3350);
    			attr_dev(div0, "class", "videoPlayer svelte-g22xgr");
    			add_location(div0, file$a, 122, 4, 3318);
    			attr_dev(div1, "class", "form svelte-g22xgr");
    			add_location(div1, file$a, 126, 5, 3460);
    			attr_dev(div2, "class", "form-div svelte-g22xgr");
    			add_location(div2, file$a, 125, 4, 3415);
    			attr_dev(main, "class", "main svelte-g22xgr");
    			add_location(main, file$a, 121, 3, 3293);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, video);
    			append_dev(main, t);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			mount_component(formtemplate, div1, null);
    			/*div2_binding*/ ctx[16](div2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$videoSource*/ 8 && video.src !== (video_src_value = /*$videoSource*/ ctx[3])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			const formtemplate_changes = {};
    			if (dirty & /*fields*/ 1) formtemplate_changes.fields = /*fields*/ ctx[0];
    			formtemplate.$set(formtemplate_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formtemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formtemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(formtemplate);
    			/*div2_binding*/ ctx[16](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(121:2) {#if $currentPage === 'main'}",
    		ctx
    	});

    	return block;
    }

    // (115:1) {#if $videoSource === 'done'}
    function create_if_block_4(ctx) {
    	let div_1;
    	let h2;
    	let t0;
    	let br;
    	let t1;
    	let t2;
    	let current;

    	const confetti = new Confetti_component({
    			props: { characters: ["🎊", "🥳", "🎉"] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			h2 = element("h2");
    			t0 = text("You're all done! ");
    			br = element("br");
    			t1 = text("🍾");
    			t2 = space();
    			create_component(confetti.$$.fragment);
    			attr_dev(br, "class", "svelte-g22xgr");
    			add_location(br, file$a, 116, 42, 3177);
    			attr_dev(h2, "class", "outro-text svelte-g22xgr");
    			add_location(h2, file$a, 116, 2, 3137);
    			attr_dev(div_1, "class", "svelte-g22xgr");
    			add_location(div_1, file$a, 115, 1, 3128);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);
    			append_dev(div_1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, br);
    			append_dev(h2, t1);
    			append_dev(div_1, t2);
    			mount_component(confetti, div_1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);
    			destroy_component(confetti);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(115:1) {#if $videoSource === 'done'}",
    		ctx
    	});

    	return block;
    }

    // (104:39) 
    function create_if_block_2$1(ctx) {
    	let div_1;
    	let h2;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let br1;
    	let t3;
    	let p;

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			h2 = element("h2");
    			t0 = text("One second ");
    			br0 = element("br");
    			t1 = text("⏱");
    			t2 = space();
    			br1 = element("br");
    			t3 = space();
    			p = element("p");
    			p.textContent = "We're anonymizing some data for you";
    			attr_dev(br0, "class", "svelte-g22xgr");
    			add_location(br0, file$a, 105, 37, 2928);
    			attr_dev(h2, "class", "intro-text svelte-g22xgr");
    			add_location(h2, file$a, 105, 3, 2894);
    			attr_dev(br1, "class", "svelte-g22xgr");
    			add_location(br1, file$a, 106, 3, 2943);
    			attr_dev(p, "class", "intro-text svelte-g22xgr");
    			add_location(p, file$a, 107, 3, 2952);
    			attr_dev(div_1, "class", "svelte-g22xgr");
    			add_location(div_1, file$a, 104, 2, 2884);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);
    			append_dev(div_1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, br0);
    			append_dev(h2, t1);
    			append_dev(div_1, t2);
    			append_dev(div_1, br1);
    			append_dev(div_1, t3);
    			append_dev(div_1, p);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(104:39) ",
    		ctx
    	});

    	return block;
    }

    // (94:2) {#if $videoSource === ''}
    function create_if_block_1$4(ctx) {
    	let div0;
    	let h2;
    	let t1;
    	let br0;
    	let t2;
    	let p;
    	let t4;
    	let br1;
    	let t5;
    	let div1;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Hi 👋";
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			p = element("p");
    			p.textContent = "We need you to point us to the data folder";
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Take me to the data! 🚀";
    			attr_dev(h2, "class", "intro-text svelte-g22xgr");
    			add_location(h2, file$a, 95, 3, 2605);
    			attr_dev(br0, "class", "svelte-g22xgr");
    			add_location(br0, file$a, 96, 3, 2643);
    			attr_dev(p, "class", "intro-text svelte-g22xgr");
    			add_location(p, file$a, 97, 3, 2652);
    			attr_dev(div0, "class", "svelte-g22xgr");
    			add_location(div0, file$a, 94, 2, 2595);
    			attr_dev(br1, "class", "svelte-g22xgr");
    			add_location(br1, file$a, 99, 2, 2734);
    			attr_dev(button, "class", "load-btn svelte-g22xgr");
    			add_location(button, file$a, 101, 3, 2752);
    			attr_dev(div1, "class", "svelte-g22xgr");
    			add_location(div1, file$a, 100, 2, 2742);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			append_dev(div0, br0);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button);
    			dispose = listen_dev(button, "click", /*loadData*/ ctx[6], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(94:2) {#if $videoSource === ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isDataSet*/ ctx[1] === false) return 0;
    		if (/*isDataSet*/ ctx[1] === true) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $rootDirectory;
    	let $videoSource;
    	let $videoToEdit;
    	let $currentPage;
    	let $videoPathToEdit;
    	validate_store(rootDirectory, "rootDirectory");
    	component_subscribe($$self, rootDirectory, $$value => $$invalidate(10, $rootDirectory = $$value));
    	validate_store(videoSource, "videoSource");
    	component_subscribe($$self, videoSource, $$value => $$invalidate(3, $videoSource = $$value));
    	validate_store(videoToEdit, "videoToEdit");
    	component_subscribe($$self, videoToEdit, $$value => $$invalidate(11, $videoToEdit = $$value));
    	validate_store(currentPage, "currentPage");
    	component_subscribe($$self, currentPage, $$value => $$invalidate(4, $currentPage = $$value));
    	validate_store(videoPathToEdit, "videoPathToEdit");
    	component_subscribe($$self, videoPathToEdit, $$value => $$invalidate(5, $videoPathToEdit = $$value));
    	const { dialog } = require("electron").remote;
    	const fs = window.require("fs");
    	let fields = formFields;
    	let isDataSet = false;
    	let storagePath = "";

    	// set primary page view
    	currentPage.update(src => src = "main");

    	function loadData() {
    		const directory = dialog.showOpenDialogSync({
    			properties: ["openFile", "openDirectory"]
    		});

    		console.log(directory);
    		rootDirectory.update(src => src = directory);
    		vidBlackBar($rootDirectory);
    		storagePath = directory + "/storage";
    		setVideo(storagePath);
    	}

    	function setVideo(storagePath) {
    		if (fs.readdirSync(storagePath).length === 0) {
    			$$invalidate(1, isDataSet = true);
    			videoSource.update(src => src = "done");
    		} else {
    			// sets initial clip to be shown
    			fs.readdir(storagePath, (err, files) => {
    				if (files[0].includes("__anon__")) {
    					videoSource.update(src => src = storagePath + "/" + files[0]);
    					console.log($videoSource);
    					$$invalidate(1, isDataSet = true);
    				} else {
    					videoSource.update(src => src = "loading");
    					console.log("loading");

    					setTimeout(
    						() => {
    							setVideo(storagePath);
    						},
    						1000
    					);
    				}
    			});
    		}
    	}

    	let div;

    	function setFormData() {
    		// load the json db data for the clip being edited
    		const dbData = $rootDirectory + "/data/" + $videoToEdit + ".json";

    		const editClipData = JSON.parse(fs.readFileSync(dbData));
    		let keys = Object.keys(editClipData);

    		for (let i = 0; i < fields.length; i++) {
    			console.log(fields[i].name);
    			$$invalidate(0, fields[i].value = editClipData[keys[i]], fields);
    			console.log(`field value: ${fields[i].name} clip data: ${editClipData[keys[i]]}`);
    		}
    	} // console.log(editableKeys);
    	// console.log(fields[1].value);

    	// console.log(editClipData['Quality']);
    	// fields[1].value = editClipData['Quality'];
    	function scrollToTop() {
    		div.scrollTo({ top: 0, behavior: "smooth" });
    	}

    	const func = () => scrollToTop();

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, div = $$value);
    		});
    	}

    	const func_1 = () => scrollToTop();

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, div = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		videoSource,
    		videoToEdit,
    		videoPathToEdit,
    		rootDirectory,
    		currentPage,
    		FormTemplate: FormTemplate_components,
    		Confetti: Confetti_component,
    		NavBar: NavBar_component,
    		Table: Table_component,
    		formFields,
    		dialog,
    		vidBlackBar,
    		fs,
    		fields,
    		isDataSet,
    		storagePath,
    		loadData,
    		setVideo,
    		div,
    		setFormData,
    		scrollToTop,
    		require,
    		window,
    		console,
    		$rootDirectory,
    		$videoSource,
    		setTimeout,
    		$videoToEdit,
    		JSON,
    		Object,
    		$currentPage,
    		$videoPathToEdit
    	});

    	$$self.$inject_state = $$props => {
    		if ("fields" in $$props) $$invalidate(0, fields = $$props.fields);
    		if ("isDataSet" in $$props) $$invalidate(1, isDataSet = $$props.isDataSet);
    		if ("storagePath" in $$props) storagePath = $$props.storagePath;
    		if ("div" in $$props) $$invalidate(2, div = $$props.div);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fields,
    		isDataSet,
    		div,
    		$videoSource,
    		$currentPage,
    		$videoPathToEdit,
    		loadData,
    		setFormData,
    		scrollToTop,
    		storagePath,
    		$rootDirectory,
    		$videoToEdit,
    		dialog,
    		fs,
    		setVideo,
    		func,
    		div2_binding,
    		func_1,
    		div3_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
