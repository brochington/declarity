import {reduce} from 'lodash';

const _state = Symbol("state");
const _actions = Symbol("actions");
const _wrappedActions = Symbol("wrappedActions");
const _stateSetCallback = Symbol("stateSetCallback");
const _hasBeenInitialized = Symbol("hasBeenInitialized");

class StateManager {
    init(actions, initFunc, stateSetCallback) {
        // attach stateManager to window for debugging
        if (window) window.stateManager = this;

        try {
            if (!this[_hasBeenInitialized]) {
                this[_hasBeenInitialized] = true;

                /* wrap actions */
                const wrappedActions = reduce(actions, this.wrapActions, {});

                this[_wrappedActions] = {
                    ...wrappedActions
                };

                this[_actions] = actions;

                /* Set initial state from init function */
                this[_state] = initFunc(this[_wrappedActions]);

                /* set state callback, most likely a setState React method */
                this[_stateSetCallback] = stateSetCallback;
            }

            else {
                throw new Error("StateManager has already been initialized");
            }
        }

        catch (e) {
            console.error(e);
        }
    }

    get actions() {
        return this[_wrappedActions];
    }

    get state() {
        return this[_state];
    }

    /* wraps actions with... the actionWrapper */
    wrapActions = (acc, val, name) => {
        if (typeof val === "function") {
            acc[name] = (...args) => this.actionWrapper(name, val, ...args);
        }
        return acc;
    };

    /* injects state and actions as args into actions that are called. */
    actionWrapper(name, func, ...args) {
        // call the action function with correct args.
        if (this._loggingEnabled) {
            console.log("action: ", name, this[_state]);
        }

        const newState = func(() => this[_state], this[_wrappedActions], ...args);

        this.handleActionReturnTypes(newState);

        return this[_state];
    }

    /* handles standard values, promises (from async functions) and generator function return values */
    handleActionReturnTypes = async (newState) => {
        if (typeof newState.then === 'function') {
            const n = await newState;
            this.callSetStateCallback(n);
        }

        // Detect if newState is actually a generator function.
        else if (typeof newState.next === 'function') {
            this.generatorHandler(newState);
        }

        // newState should be an immutable object.
        else {
            this.callSetStateCallback(newState);
        }
    };

    /* A recursive function to handle the output of generator functions. */
    generatorHandler = async (genObject) => {
        const {value, done} = genObject.next();

        if (value) {
            if (typeof value.then === 'function') {
                await value;
            }

            this.handleActionReturnTypes(value);
        }

        if (!done) {
            this.generatorHandler(genObject)
        }
    };

    /* Calls the setState callback */
    callSetStateCallback = (newState) => {
        // call the callback specified in the init method.
        // NOTE: can do a check to see if state has been changed.
        this[_state] = newState;
        this[_stateSetCallback](this[_state], this[_wrappedActions]);
    };

    // _loggingEnabled = process.env.NODE_ENV == 'development' ? true : false;
    _loggingEnabled = true;

    /* Debugging assist methods */
    enableLogging = () => {
        this._loggingEnabled = true;
        return `stateManager logging is enabled`;
    }

    disableLogging = () => {
        this._loggingEnabled = false;
        return `stateManager logging is disabled`;
    }
}

export default StateManager;
