// @flow
import {reduce} from 'lodash';

declare var window: Object

class StateManager {
    _hasBeenInitialized: boolean
    _actions: Object
    _wrappedActions: Object
    _wrappedPrivateActions: Object
    _privateActions: Object
    _state: any
    _stateSetCallback: Function

    init(actions: Object, initFunc: (o: Object) => Object, stateSetCallback: Function) {
        // attach stateManager to window for debugging
        if (window) window.stateManager = this;

        try {
            if (!this._hasBeenInitialized) {
                this._hasBeenInitialized = true;

                /* wrap actions */
                const wrappedActions: Object = reduce(actions, this.wrapActions, {});

                this._wrappedActions = {
                    ...wrappedActions
                };

                const allActions = {
                    ...wrappedActions
                }

                this._actions = actions;

                /* Set initial state from init function */
                this._state = initFunc(this._wrappedActions);

                /* set state callback, most likely a setState React method */
                this._stateSetCallback = stateSetCallback;
            }

            else {
                throw new Error("StateManager has already been initialized");
            }
        }

        catch (e) {
            console.error(e);
        }
    }

    getActions(): Object {
        return this._wrappedActions;
    }

    getState(): any {
        return this._state;
    }

    // NOTE: This should never be exposed to the end user.
    setState(newState: any) {
        this._state = newState;
    }

    /* wraps actions with... the actionWrapper */
    wrapActions = (acc: Object, val: any, name: string) => {
        if (typeof val === "function") {
            acc[name] = (...args) => this.actionWrapper(name, val, ...args);
        }
        return acc;
    };

    /* injects state and actions as args into actions that are called. */
    actionWrapper(name: string, func: Function, ...args: any) {
        // call the action function with correct args.
        if (this._loggingEnabled) {
            console.log("action: ", name, this._state);
        }

        const newState = func(() => this._state, this._wrappedActions, ...args);

        return new Promise((resolve, reject) => {
            this.handleActionReturnTypes(newState, resolve);
        })

            // this.callSetStateCallback(ns);
    }

    /* handles standard values, promises (from async functions) and generator function return values */
    handleActionReturnTypes = async (newState: Object, cb: Function) => {
        if (typeof newState.then === 'function') {
            const n = await newState;
            cb(n);
        }

        // Detect if newState is actually a generator function.
        else if (typeof newState.next === 'function') {
            this.generatorHandler(newState, cb);
        }

        // newState should be an immutable object.
        else {
            cb(newState)
        }
    };

    /* A recursive function to handle the output of generator functions. */
    generatorHandler = async (genObject: Object, cb: Function) => {
        const {value, done} = genObject.next();

        if (value) {
            if (typeof value.then === 'function') {
                await value;
            }

            this.handleActionReturnTypes(value, cb);
        }

        if (!done) {
            this.generatorHandler(genObject, cb)
        }
    };

    /* Calls the setState callback */
    callSetStateCallback = (newState: Object) => {
        // call the callback specified in the init method.
        // NOTE: can do a check to see if state has been changed.
        this._state = newState;
        this._stateSetCallback(this._state, this._wrappedActions);
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
