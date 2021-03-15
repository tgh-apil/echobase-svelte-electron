
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
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    const currentPage = writable('');

    /* src\components\VideoPlayer.component.svelte generated by Svelte v3.19.1 */
    const file = "src\\components\\VideoPlayer.component.svelte";

    // (7:0) {:else}
    function create_else_block(ctx) {
    	let video;
    	let video_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			if (video.src !== (video_src_value = /*$videoSource*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			video.autoplay = true;
    			video.loop = true;
    			video.muted = true;
    			attr_dev(video, "class", "svelte-1m7w1h8");
    			add_location(video, file, 7, 0, 143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$videoSource*/ 1 && video.src !== (video_src_value = /*$videoSource*/ ctx[0])) {
    				attr_dev(video, "src", video_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(7:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (5:0) {#if $videoSource === 'done'}
    function create_if_block(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "🎉🎉 All Clips Rated! 🎉🎉";
    			attr_dev(h1, "class", "svelte-1m7w1h8");
    			add_location(h1, file, 5, 0, 97);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(5:0) {#if $videoSource === 'done'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$videoSource*/ ctx[0] === "done") return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
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
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let $videoSource;
    	validate_store(videoSource, "videoSource");
    	component_subscribe($$self, videoSource, $$value => $$invalidate(0, $videoSource = $$value));
    	$$self.$capture_state = () => ({ videoSource, $videoSource });
    	return [$videoSource];
    }

    class VideoPlayer_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VideoPlayer_component",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\RadioButtonGroup.components.svelte generated by Svelte v3.19.1 */

    const file$1 = "src\\components\\RadioButtonGroup.components.svelte";

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
    			attr_dev(input, "class", "svelte-i4sq47");
    			/*$$binding_groups*/ ctx[5][0].push(input);
    			add_location(input, file$1, 10, 8, 207);
    			attr_dev(span, "class", "checkmark svelte-i4sq47");
    			add_location(span, file$1, 12, 8, 299);
    			attr_dev(label_1, "class", "container svelte-i4sq47");
    			add_location(label_1, file$1, 9, 4, 172);
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

    function create_fragment$1(ctx) {
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
    			add_location(h3, file$1, 7, 0, 114);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { options: 1, id: 2, label: 3, group: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RadioButtonGroup_components",
    			options,
    			id: create_fragment$1.name
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

    const file$2 = "src\\components\\SelectGroup.component.svelte";

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
    			add_location(option, file$2, 10, 8, 206);
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

    function create_fragment$2(ctx) {
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
    			add_location(h3, file$2, 7, 0, 114);
    			attr_dev(select, "id", /*id*/ ctx[1]);
    			attr_dev(select, "class", "svelte-ojcvm3");
    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$2, 8, 0, 141);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0, id: 1, options: 2, label: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectGroup_component",
    			options,
    			id: create_fragment$2.name
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

    const file$3 = "src\\components\\TextInput.component.svelte";

    function create_fragment$3(ctx) {
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
    			add_location(h3, file$3, 8, 0, 140);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			attr_dev(input, "name", /*name*/ ctx[4]);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-1r9dav");
    			add_location(input, file$3, 9, 0, 167);
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

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
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
    			id: create_fragment$3.name
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

    const file$4 = "src\\components\\TextArea.component.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(h3, file$4, 8, 0, 140);
    			attr_dev(textarea, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(textarea, "id", /*id*/ ctx[2]);
    			attr_dev(textarea, "name", /*name*/ ctx[4]);
    			attr_dev(textarea, "type", "text-area");
    			attr_dev(textarea, "class", "svelte-5k6yq0");
    			add_location(textarea, file$4, 9, 0, 167);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
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
    			id: create_fragment$4.name
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
            const dbFilePath = filePath + '/data/' + fileName + '.json';

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

            const depth_obj = {'Depth (cm)': depth};

            jsonUpdater(root_path, file_name, depth_obj);
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

    const file$5 = "src\\components\\FormTemplate.components.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[15] = list;
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (56:49) 
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
    		source: "(56:49) ",
    		ctx
    	});

    	return block;
    }

    // (54:44) 
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
    		source: "(54:44) ",
    		ctx
    	});

    	return block;
    }

    // (52:46) 
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
    		source: "(52:46) ",
    		ctx
    	});

    	return block;
    }

    // (50:12) {#if field.type === 'radio'}
    function create_if_block$1(ctx) {
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(50:12) {#if field.type === 'radio'}",
    		ctx
    	});

    	return block;
    }

    // (49:8) {#each fields as field}
    function create_each_block$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1, create_if_block_2, create_if_block_3];
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
    		source: "(49:8) {#each fields as field}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
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
    			add_location(div0, file$5, 47, 4, 1959);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$5, 61, 8, 2797);
    			add_location(div1, file$5, 60, 4, 2782);
    			add_location(form, file$5, 46, 0, 1893);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    	}

    	// When submitting, turn our fields representation into a JSON body
    	const handleSubmit = () => onSubmit(saveData(fieldsToObject(fields)), nextClip(storagePath, donePath));

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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { fields: 0, onSubmit: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormTemplate_components",
    			options,
    			id: create_fragment$5.name
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
    const file$6 = "src\\components\\Confetti.component.svelte";

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
    			add_location(span, file$6, 49, 1, 873);
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

    function create_fragment$6(ctx) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { characters: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Confetti_component",
    			options,
    			id: create_fragment$6.name
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
    const file$7 = "src\\components\\NavBar.component.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let div0;
    	let button0;
    	let t0;
    	let button0_class_value;
    	let t1;
    	let button1;
    	let t2;
    	let button1_class_value;
    	let t3;
    	let div1;
    	let p;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			button0 = element("button");
    			t0 = text("Main");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("Overview");
    			t3 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Echobase";

    			attr_dev(button0, "class", button0_class_value = "" + (null_to_empty(/*currentButton*/ ctx[0] === "main"
    			? "selected"
    			: "not-selected") + " svelte-16ytbcc"));

    			add_location(button0, file$7, 14, 8, 341);

    			attr_dev(button1, "class", button1_class_value = "" + (null_to_empty(/*currentButton*/ ctx[0] === "overview"
    			? "selected"
    			: "not-selected") + " svelte-16ytbcc"));

    			add_location(button1, file$7, 15, 8, 475);
    			attr_dev(div0, "class", "button-container");
    			add_location(div0, file$7, 13, 4, 301);
    			attr_dev(p, "class", "nav-logo svelte-16ytbcc");
    			add_location(p, file$7, 18, 8, 667);
    			attr_dev(div1, "class", "logo-container");
    			add_location(div1, file$7, 17, 4, 629);
    			attr_dev(main, "class", "nav-top svelte-16ytbcc");
    			add_location(main, file$7, 12, 0, 273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, button0);
    			append_dev(button0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, button1);
    			append_dev(button1, t2);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			append_dev(div1, p);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentButton*/ 1 && button0_class_value !== (button0_class_value = "" + (null_to_empty(/*currentButton*/ ctx[0] === "main"
    			? "selected"
    			: "not-selected") + " svelte-16ytbcc"))) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (dirty & /*currentButton*/ 1 && button1_class_value !== (button1_class_value = "" + (null_to_empty(/*currentButton*/ ctx[0] === "overview"
    			? "selected"
    			: "not-selected") + " svelte-16ytbcc"))) {
    				attr_dev(button1, "class", button1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			run_all(dispose);
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
    	let $currentPage;
    	validate_store(currentPage, "currentPage");
    	component_subscribe($$self, currentPage, $$value => $$invalidate(2, $currentPage = $$value));
    	let currentButton = "main";

    	function changeView(pageView) {
    		currentPage.update(src => src = pageView);
    		console.log($currentPage);
    		$$invalidate(0, currentButton = pageView);
    	}

    	const click_handler = () => changeView("main");
    	const click_handler_1 = () => changeView("overview");

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

    	return [currentButton, changeView, $currentPage, click_handler, click_handler_1];
    }

    class NavBar_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar_component",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\Table.component.svelte generated by Svelte v3.19.1 */
    const file$8 = "src\\components\\Table.component.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (116:0) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "nah";
    			add_location(div, file$8, 116, 0, 2942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(116:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (87:0) {#if hasData}
    function create_if_block$2(ctx) {
    	let div0;
    	let table;
    	let tr;
    	let t0;
    	let t1;
    	let div1;
    	let button0;
    	let t3;
    	let button1;
    	let dispose;
    	let each_value_1 = /*colHeadings*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*rowData*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
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
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Previous";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Next";
    			attr_dev(tr, "class", "svelte-lcub5y");
    			add_location(tr, file$8, 89, 3, 2214);
    			set_style(table, "width", "100%");
    			add_location(table, file$8, 88, 2, 2183);
    			attr_dev(div0, "class", "table-div-container svelte-lcub5y");
    			add_location(div0, file$8, 87, 1, 2146);
    			add_location(button0, file$8, 112, 2, 2763);
    			add_location(button1, file$8, 113, 2, 2847);
    			add_location(div1, file$8, 111, 1, 2754);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, table);
    			append_dev(table, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			/*button0_binding*/ ctx[14](button0);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			/*button1_binding*/ ctx[16](button1);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[15], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[17], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*colHeadings*/ 1) {
    				each_value_1 = /*colHeadings*/ ctx[0];
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

    			if (dirty & /*rowData*/ 2) {
    				each_value = /*rowData*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			/*button0_binding*/ ctx[14](null);
    			/*button1_binding*/ ctx[16](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(87:0) {#if hasData}",
    		ctx
    	});

    	return block;
    }

    // (91:4) {#each colHeadings as heading}
    function create_each_block_1(ctx) {
    	let th;
    	let t_value = /*heading*/ ctx[21] + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			attr_dev(th, "class", "svelte-lcub5y");
    			add_location(th, file$8, 91, 5, 2261);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*colHeadings*/ 1 && t_value !== (t_value = /*heading*/ ctx[21] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(91:4) {#each colHeadings as heading}",
    		ctx
    	});

    	return block;
    }

    // (95:3) {#each rowData as row}
    function create_each_block$4(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[18].View + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*row*/ ctx[18]["Quality (0-4)"] + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*row*/ ctx[18].Gain + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = /*row*/ ctx[18].Orientation + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*row*/ ctx[18].Depth + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10_value = /*row*/ ctx[18].Focus + "";
    	let t10;
    	let t11;
    	let td6;
    	let t12_value = /*row*/ ctx[18].Frequency + "";
    	let t12;
    	let t13;
    	let td7;
    	let t14_value = /*row*/ ctx[18].Physiology + "";
    	let t14;
    	let t15;
    	let td8;
    	let t16_value = /*row*/ ctx[18]["Cardiac Cycles (#)"] + "";
    	let t16;
    	let t17;
    	let td9;
    	let t18_value = /*row*/ ctx[18].Comments + "";
    	let t18;
    	let t19;
    	let td10;
    	let t20_value = /*row*/ ctx[18]["Depth (cm)"] + "";
    	let t20;
    	let t21;

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
    			add_location(td0, file$8, 96, 5, 2346);
    			add_location(td1, file$8, 97, 5, 2372);
    			add_location(td2, file$8, 98, 5, 2410);
    			add_location(td3, file$8, 99, 5, 2436);
    			add_location(td4, file$8, 100, 5, 2469);
    			add_location(td5, file$8, 101, 5, 2496);
    			add_location(td6, file$8, 102, 5, 2523);
    			add_location(td7, file$8, 103, 5, 2554);
    			add_location(td8, file$8, 104, 5, 2586);
    			attr_dev(td9, "class", "td-comments svelte-lcub5y");
    			add_location(td9, file$8, 105, 5, 2629);
    			add_location(td10, file$8, 106, 5, 2679);
    			attr_dev(tr, "class", "svelte-lcub5y");
    			add_location(tr, file$8, 95, 4, 2335);
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
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rowData*/ 2 && t0_value !== (t0_value = /*row*/ ctx[18].View + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*rowData*/ 2 && t2_value !== (t2_value = /*row*/ ctx[18]["Quality (0-4)"] + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*rowData*/ 2 && t4_value !== (t4_value = /*row*/ ctx[18].Gain + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*rowData*/ 2 && t6_value !== (t6_value = /*row*/ ctx[18].Orientation + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*rowData*/ 2 && t8_value !== (t8_value = /*row*/ ctx[18].Depth + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*rowData*/ 2 && t10_value !== (t10_value = /*row*/ ctx[18].Focus + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*rowData*/ 2 && t12_value !== (t12_value = /*row*/ ctx[18].Frequency + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*rowData*/ 2 && t14_value !== (t14_value = /*row*/ ctx[18].Physiology + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*rowData*/ 2 && t16_value !== (t16_value = /*row*/ ctx[18]["Cardiac Cycles (#)"] + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*rowData*/ 2 && t18_value !== (t18_value = /*row*/ ctx[18].Comments + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*rowData*/ 2 && t20_value !== (t20_value = /*row*/ ctx[18]["Depth (cm)"] + "")) set_data_dev(t20, t20_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(95:3) {#each rowData as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*hasData*/ ctx[2]) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
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
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let $rootDirectory;
    	validate_store(rootDirectory, "rootDirectory");
    	component_subscribe($$self, rootDirectory, $$value => $$invalidate(7, $rootDirectory = $$value));
    	const fs = window.require("fs");

    	// read data folder
    	const dataDir = $rootDirectory + "/data/";

    	const dataArray = fs.readdirSync(dataDir);
    	let dataParse = [];
    	let colHeadings = [];
    	let rowData = [];

    	// check if there's saved data
    	let hasData;

    	let prevButton;
    	let nextButton;
    	let counter = 0;
    	let maxEntriesShown = 20;

    	onMount(() => {
    		$$invalidate(3, prevButton.disabled = true, prevButton);
    		console.log(dataArray.length);
    	});

    	if (dataArray.length === 0) {
    		hasData = false;
    	} else {
    		hasData = true;
    		populateTable();
    	}

    	// add a next page button --> load next 100 entries
    	function changePage(modifier) {
    		if (counter === maxEntriesShown) {
    			$$invalidate(3, prevButton.disabled = true, prevButton);
    		} else {
    			$$invalidate(3, prevButton.disabled = false, prevButton);
    		}

    		if (counter >= dataArray.length) {
    			$$invalidate(4, nextButton.disabled = true, nextButton);
    		} else {
    			$$invalidate(4, nextButton.disabled = false, nextButton);
    		}

    		counter += maxEntriesShown * modifier;
    		console.log(counter);
    		populateTable();
    	}

    	function populateTable() {
    		// parse data from json
    		if (dataArray.length <= maxEntriesShown) {
    			dataArray.forEach(fileData => {
    				dataParse.push(JSON.parse(fs.readFileSync(dataDir + fileData)));
    			});
    		} else {
    			for (let i = 0 + counter; i < maxEntriesShown + counter; i++) {
    				dataParse.push(JSON.parse(fs.readFileSync(dataDir + dataArray[i])));
    			}
    		}

    		// create columns based on keys
    		$$invalidate(0, colHeadings = Object.keys(dataParse[0]));

    		// create rows based on values
    		$$invalidate(1, rowData = Object.values(dataParse));

    		// truncate the data: clip name (limit to 20 chars), comments (limit 50 chars)
    		for (let i = 0; i < rowData.length; i++) {
    			// let fileName = dataArray[i].slice(8, dataArray[i].length - 9)
    			// rowData.unshift(fileName);
    			if (rowData[i].Comments.length > 30) {
    				$$invalidate(1, rowData[i].Comments = rowData[i].Comments.slice(0, 31) + "...", rowData);
    				console.log(rowData[i].Comments);
    			}
    		}
    	} // if click on cell 'edit labels', insert new video player + ratings form to edit the form

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
    		rootDirectory,
    		fs,
    		dataDir,
    		dataArray,
    		dataParse,
    		colHeadings,
    		rowData,
    		hasData,
    		prevButton,
    		nextButton,
    		counter,
    		maxEntriesShown,
    		changePage,
    		populateTable,
    		window,
    		$rootDirectory,
    		console,
    		JSON,
    		Object
    	});

    	$$self.$inject_state = $$props => {
    		if ("dataParse" in $$props) dataParse = $$props.dataParse;
    		if ("colHeadings" in $$props) $$invalidate(0, colHeadings = $$props.colHeadings);
    		if ("rowData" in $$props) $$invalidate(1, rowData = $$props.rowData);
    		if ("hasData" in $$props) $$invalidate(2, hasData = $$props.hasData);
    		if ("prevButton" in $$props) $$invalidate(3, prevButton = $$props.prevButton);
    		if ("nextButton" in $$props) $$invalidate(4, nextButton = $$props.nextButton);
    		if ("counter" in $$props) counter = $$props.counter;
    		if ("maxEntriesShown" in $$props) maxEntriesShown = $$props.maxEntriesShown;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		colHeadings,
    		rowData,
    		hasData,
    		prevButton,
    		nextButton,
    		changePage,
    		counter,
    		$rootDirectory,
    		fs,
    		dataDir,
    		dataArray,
    		dataParse,
    		maxEntriesShown,
    		populateTable,
    		button0_binding,
    		click_handler,
    		button1_binding,
    		click_handler_1
    	];
    }

    class Table_component extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table_component",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.1 */

    const file$9 = "src\\App.svelte";

    // (208:29) 
    function create_if_block_3$1(ctx) {
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const navbar = new NavBar_component({ $$inline: true });
    	const if_block_creators = [create_if_block_4, create_if_block_5, create_if_block_6, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*$videoSource*/ ctx[2] === "done") return 0;
    		if (/*$currentPage*/ ctx[3] === "main") return 1;
    		if (/*$currentPage*/ ctx[3] === "overview") return 2;
    		return 3;
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
    		source: "(208:29) ",
    		ctx
    	});

    	return block;
    }

    // (183:0) {#if isDataSet === false}
    function create_if_block$3(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let div2;
    	let div1;

    	function select_block_type_1(ctx, dirty) {
    		if (/*$videoSource*/ ctx[2] === "") return create_if_block_1$1;
    		if (/*$videoSource*/ ctx[2] === "loading") return create_if_block_2$1;
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
    			attr_dev(h1, "class", "svelte-1qye0pk");
    			add_location(h1, file$9, 184, 1, 4887);
    			attr_dev(div0, "class", "header svelte-1qye0pk");
    			add_location(div0, file$9, 183, 0, 4864);
    			attr_dev(div1, "class", "startup-child svelte-1qye0pk");
    			add_location(div1, file$9, 187, 1, 4938);
    			attr_dev(div2, "class", "startup svelte-1qye0pk");
    			add_location(div2, file$9, 186, 0, 4914);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(183:0) {#if isDataSet === false}",
    		ctx
    	});

    	return block;
    }

    // (229:2) {:else}
    function create_else_block$2(ctx) {
    	let div_1;
    	let h2;
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			div_1 = element("div");
    			h2 = element("h2");
    			t0 = text("Uh-oh, something happened! ");
    			br = element("br");
    			t1 = text("💩");
    			attr_dev(br, "class", "svelte-1qye0pk");
    			add_location(br, file$9, 230, 52, 6097);
    			attr_dev(h2, "class", "outro-text svelte-1qye0pk");
    			add_location(h2, file$9, 230, 2, 6047);
    			attr_dev(div_1, "class", "svelte-1qye0pk");
    			add_location(div_1, file$9, 229, 1, 6038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div_1, anchor);
    			append_dev(div_1, h2);
    			append_dev(h2, t0);
    			append_dev(h2, br);
    			append_dev(h2, t1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(229:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (227:40) 
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
    		source: "(227:40) ",
    		ctx
    	});

    	return block;
    }

    // (216:2) {#if $currentPage === 'main'}
    function create_if_block_5(ctx) {
    	let main;
    	let div0;
    	let t;
    	let div2;
    	let div1;
    	let current;

    	const videoplayer = new VideoPlayer_component({
    			props: { $videoSource: /*$videoSource*/ ctx[2] },
    			$$inline: true
    		});

    	const formtemplate = new FormTemplate_components({
    			props: {
    				onSubmit: /*func*/ ctx[12],
    				fields: /*fields*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(videoplayer.$$.fragment);
    			t = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(formtemplate.$$.fragment);
    			attr_dev(div0, "class", "videoPlayer svelte-1qye0pk");
    			add_location(div0, file$9, 217, 4, 5721);
    			attr_dev(div1, "class", "form svelte-1qye0pk");
    			add_location(div1, file$9, 221, 5, 5846);
    			attr_dev(div2, "class", "form-div svelte-1qye0pk");
    			add_location(div2, file$9, 220, 4, 5801);
    			attr_dev(main, "class", "main svelte-1qye0pk");
    			add_location(main, file$9, 216, 3, 5696);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(videoplayer, div0, null);
    			append_dev(main, t);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			mount_component(formtemplate, div1, null);
    			/*div2_binding*/ ctx[13](div2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const videoplayer_changes = {};
    			if (dirty & /*$videoSource*/ 4) videoplayer_changes.$videoSource = /*$videoSource*/ ctx[2];
    			videoplayer.$set(videoplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(videoplayer.$$.fragment, local);
    			transition_in(formtemplate.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(videoplayer.$$.fragment, local);
    			transition_out(formtemplate.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(videoplayer);
    			destroy_component(formtemplate);
    			/*div2_binding*/ ctx[13](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(216:2) {#if $currentPage === 'main'}",
    		ctx
    	});

    	return block;
    }

    // (210:1) {#if $videoSource === 'done'}
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
    			attr_dev(br, "class", "svelte-1qye0pk");
    			add_location(br, file$9, 211, 42, 5580);
    			attr_dev(h2, "class", "outro-text svelte-1qye0pk");
    			add_location(h2, file$9, 211, 2, 5540);
    			attr_dev(div_1, "class", "svelte-1qye0pk");
    			add_location(div_1, file$9, 210, 1, 5531);
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
    		source: "(210:1) {#if $videoSource === 'done'}",
    		ctx
    	});

    	return block;
    }

    // (199:39) 
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
    			attr_dev(br0, "class", "svelte-1qye0pk");
    			add_location(br0, file$9, 200, 37, 5331);
    			attr_dev(h2, "class", "intro-text svelte-1qye0pk");
    			add_location(h2, file$9, 200, 3, 5297);
    			attr_dev(br1, "class", "svelte-1qye0pk");
    			add_location(br1, file$9, 201, 3, 5346);
    			attr_dev(p, "class", "intro-text svelte-1qye0pk");
    			add_location(p, file$9, 202, 3, 5355);
    			attr_dev(div_1, "class", "svelte-1qye0pk");
    			add_location(div_1, file$9, 199, 2, 5287);
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
    		source: "(199:39) ",
    		ctx
    	});

    	return block;
    }

    // (189:2) {#if $videoSource === ''}
    function create_if_block_1$1(ctx) {
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
    			attr_dev(h2, "class", "intro-text svelte-1qye0pk");
    			add_location(h2, file$9, 190, 3, 5008);
    			attr_dev(br0, "class", "svelte-1qye0pk");
    			add_location(br0, file$9, 191, 3, 5046);
    			attr_dev(p, "class", "intro-text svelte-1qye0pk");
    			add_location(p, file$9, 192, 3, 5055);
    			attr_dev(div0, "class", "svelte-1qye0pk");
    			add_location(div0, file$9, 189, 2, 4998);
    			attr_dev(br1, "class", "svelte-1qye0pk");
    			add_location(br1, file$9, 194, 2, 5137);
    			attr_dev(button, "class", "load-btn svelte-1qye0pk");
    			add_location(button, file$9, 196, 3, 5155);
    			attr_dev(div1, "class", "svelte-1qye0pk");
    			add_location(div1, file$9, 195, 2, 5145);
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
    			dispose = listen_dev(button, "click", /*loadData*/ ctx[5], false, false, false);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(189:2) {#if $videoSource === ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isDataSet*/ ctx[0] === false) return 0;
    		if (/*isDataSet*/ ctx[0] === true) return 1;
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $rootDirectory;
    	let $videoSource;
    	let $currentPage;
    	validate_store(rootDirectory, "rootDirectory");
    	component_subscribe($$self, rootDirectory, $$value => $$invalidate(8, $rootDirectory = $$value));
    	validate_store(videoSource, "videoSource");
    	component_subscribe($$self, videoSource, $$value => $$invalidate(2, $videoSource = $$value));
    	validate_store(currentPage, "currentPage");
    	component_subscribe($$self, currentPage, $$value => $$invalidate(3, $currentPage = $$value));
    	const { dialog } = require("electron").remote;
    	const fs = window.require("fs");

    	// form options
    	let fields = [
    		{
    			name: "View",
    			type: "select",
    			value: "Apical Four Chamber",
    			label: "🔭 What view is it?",
    			id: "view",
    			options: [
    				{
    					label: "Apical FOUR Chamber",
    					value: "4C"
    				},
    				{
    					label: "Apical FIVE Chamber",
    					value: "5C"
    				},
    				{
    					label: "Parasternal Long Axis",
    					value: "PLSX"
    				},
    				{
    					label: "Parasternal Short Axis BASAL",
    					value: "PSAXb"
    				},
    				{
    					label: "Parasternal Short Axis MIDDLE",
    					value: "PSAXm"
    				},
    				{
    					label: "Parasternal Short Axis APICAL",
    					value: "PSAXa"
    				},
    				{
    					label: "Aortic Valve Short Axis",
    					value: "AVSX"
    				},
    				{
    					label: "Subcostal Four Chamber",
    					value: "SC"
    				},
    				{
    					label: "Right Lateral IVC/SV IVC View",
    					value: "RISV"
    				},
    				{ label: "Lung", value: "Lung" },
    				{ label: "Other", value: "Other" }
    			]
    		},
    		{
    			name: "Quality (0-4)",
    			type: "radio",
    			value: 0,
    			label: "📸 How's the image quality?",
    			id: "quality",
    			options: [
    				{
    					label: "View cannot be identified clearly",
    					value: 0
    				},
    				{
    					label: "View can be identified but diagnosis very difficult/impossible",
    					value: 1
    				},
    				{
    					label: "Most aspects can be diagnosed but image can be clearer",
    					value: 3
    				},
    				{
    					label: "All diagnostic features visible and clear",
    					value: 4
    				}
    			]
    		},
    		{
    			name: "Gain",
    			type: "radio",
    			value: "NaN",
    			label: "☀ How's the gain?",
    			id: "gain",
    			options: [
    				{
    					label: "Under gained",
    					value: "Under gained"
    				},
    				{ label: "Optimal", value: "Optimal" },
    				{ label: "Overgained", value: "Overgained" }
    			]
    		},
    		{
    			name: "Orientation",
    			type: "radio",
    			value: "NaN",
    			label: "🧭 Is the orientation correct?",
    			id: "orientation",
    			options: [{ label: "Yes", value: "Correct" }, { label: "No", value: "Incorrect" }]
    		},
    		{
    			name: "Depth",
    			type: "radio",
    			value: "NaN",
    			label: "⛏ Is the depth appropriate?",
    			id: "depth",
    			options: [
    				{ label: "Yes", value: "Appropriate" },
    				{ label: "No", value: "Inappropriate" }
    			]
    		},
    		{
    			name: "Focus",
    			type: "radio",
    			value: "NaN",
    			label: "🔬 Is the focus appropriate?",
    			id: "focus",
    			options: [
    				{ label: "Yes", value: "Appropriate" },
    				{ label: "No", value: "Inappropriate" }
    			]
    		},
    		{
    			name: "Frequency",
    			type: "radio",
    			value: "NaN",
    			label: "🔊 Is the frequecy appropriate?",
    			id: "frequency",
    			options: [
    				{ label: "Yes", value: "Appropriate" },
    				{ label: "No", value: "Inappropriate" }
    			]
    		},
    		{
    			name: "Physiology",
    			type: "radio",
    			value: "NaN",
    			label: "🩺 Is the physiology normal?",
    			id: "normal_physiology",
    			options: [{ label: "Yes", value: "Normal" }, { label: "No", value: "Abnormal" }]
    		},
    		{
    			name: "Cardiac Cycles (#)",
    			type: "text",
    			id: "num_cardiac_cycles",
    			value: "",
    			label: "💓 How many cardiac cycles?",
    			placeholder: "# Cardiac cycles..."
    		},
    		{
    			name: "Comments",
    			type: "text-area",
    			id: "comments",
    			value: "",
    			label: "📝 Any comments?",
    			placeholder: "Please leave any additional comments you have (optional)..."
    		}
    	];

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
    			$$invalidate(0, isDataSet = true);
    			videoSource.update(src => src = "done");
    		} else {
    			// sets initial clip to be shown
    			fs.readdir(storagePath, (err, files) => {
    				if (files[0].includes("__anon__")) {
    					videoSource.update(src => src = storagePath + "/" + files[0]);
    					console.log($videoSource);
    					$$invalidate(0, isDataSet = true);
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

    	function scrollToTop() {
    		div.scrollTo({ top: 0, behavior: "smooth" });
    	}

    	const func = () => scrollToTop();

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, div = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		VideoPlayer: VideoPlayer_component,
    		videoSource,
    		rootDirectory,
    		currentPage,
    		FormTemplate: FormTemplate_components,
    		Confetti: Confetti_component,
    		NavBar: NavBar_component,
    		Table: Table_component,
    		dialog,
    		vidBlackBar,
    		fs,
    		fields,
    		isDataSet,
    		storagePath,
    		loadData,
    		setVideo,
    		div,
    		scrollToTop,
    		require,
    		window,
    		console,
    		$rootDirectory,
    		$videoSource,
    		setTimeout,
    		$currentPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("fields" in $$props) $$invalidate(4, fields = $$props.fields);
    		if ("isDataSet" in $$props) $$invalidate(0, isDataSet = $$props.isDataSet);
    		if ("storagePath" in $$props) storagePath = $$props.storagePath;
    		if ("div" in $$props) $$invalidate(1, div = $$props.div);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isDataSet,
    		div,
    		$videoSource,
    		$currentPage,
    		fields,
    		loadData,
    		scrollToTop,
    		storagePath,
    		$rootDirectory,
    		dialog,
    		fs,
    		setVideo,
    		func,
    		div2_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
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
