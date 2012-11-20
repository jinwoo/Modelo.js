/*global require, define, module, describe, it, xit

*/
(function (factory) {
    "use strict";

    var env = factory.env,
        def = factory.def,
        deps = {
            amd: ['lib/expect', '../modelo/modelo.js'],
            node: ['./lib/expect', '../modelo/modelo.js'],
            browser: ['expect', 'Modelo']
        };

    def.call(this, 'spec/Modelo', deps[env], function (expect, Modelo) {

        describe('The Modelo library', function () {

            it('loads in the current environment (' + env + ')', function () {

                expect(Modelo).to.be.ok();

            });

            it('exports a specification compliant interface', function () {

                expect(typeof Modelo).to.be("function");

                expect(typeof Modelo.define).to.be("function");

            });

            it('supports the basic style of object definition', function () {

                var T = Modelo.define(),
                    i = new T();

                expect(T).to.be.ok();

                expect(T).to.be.a('function');

                expect(T.extend).to.be.a('function');

                expect(i).to.be.a(T);

            });

            it('optionally supports the new keyword', function () {

                var T = new Modelo(),
                    i = new T();

                expect(T).to.be.ok();

                expect(T).to.be.a('function');

                expect(T.extend).to.be.a('function');

                expect(i).to.be.a(T);

            });

            it('supports the constructor style of object definition', function () {

                var T = Modelo.define(function (options) {
                    this.name = options.name || 'Juan Pérez';
                }),
                    i = new T();

                expect(i).to.be.ok();

                expect(i.name).to.be('Juan Pérez');

                i = new T({name: 'Juan Pueblo'});

                expect(i.name).to.be('Juan Pueblo');

            });

            it('supports the mix-in style of object definition', function () {

                var Person,
                    Talker,
                    Walker,
                    Customer,
                    test_customer;

                Person = Modelo.define(function (options) {
                    this.name = options.name || 'Juan Pérez';
                });

                Person.prototype.hello = function () {
                    return "Hello " + this.name + "!";
                };

                Talker = Modelo.define(function (options) {
                    this.language = options.language || 'ES';
                });

                Talker.prototype.speak = function () {
                    if (this.language === 'EN') {
                        return "Hello.";
                    }

                    if (this.language === 'ES') {
                        return "Hola.";
                    }

                    return "...";
                };

                Walker = Modelo.define(function (options) {
                    this.legs = options.legs || 2;
                });

                Walker.prototype.walk = function () {
                    return "These " + this.legs + " boots were made for walkin'.";
                };

                Customer = Modelo.define(Person, Talker, Walker);

                expect(Customer.prototype.hello).to.be.a('function');
                expect(Customer.prototype.speak).to.be.a('function');
                expect(Customer.prototype.walk).to.be.a('function');

                test_customer = new Customer();

                expect(test_customer).to.be.a(Customer);

                expect(test_customer.hello()).to.be('Hello Juan Pérez!');
                expect(test_customer.speak()).to.be('Hola.');
                expect(test_customer.walk()).to.be("These 2 boots were made for walkin'.");

            });

            it('can recognize inhertied objects', function () {

                var Person,
                    Talker,
                    Walker,
                    Customer,
                    Empty_Mixin,
                    Extended_Customer,
                    test_customer,
                    extended_test_customer;

                Person = Modelo.define(function (options) {
                    this.name = options.name || 'Juan Pérez';
                });

                Person.prototype.hello = function () {
                    return "Hello " + this.name + "!";
                };

                Talker = Modelo.define(function (options) {
                    this.language = options.language || 'ES';
                });

                Talker.prototype.speak = function () {
                    if (this.language === 'EN') {
                        return "Hello.";
                    }

                    if (this.language === 'ES') {
                        return "Hola.";
                    }

                    return "...";
                };

                Walker = Modelo.define(function (options) {
                    this.legs = options.legs || 2;
                });

                Walker.prototype.walk = function () {
                    return "These " + this.legs + " boots were made for walkin'.";
                };

                Customer = Modelo.define(Person, Talker, Walker);

                Empty_Mixin = Modelo.define();

                Extended_Customer = Customer.extend(Empty_Mixin);

                test_customer = new Customer();
                extended_test_customer = new Extended_Customer();

                expect(test_customer.isInstance(Customer)).to.be(true);
                expect(test_customer.isInstance(Person)).to.be(true);
                expect(test_customer.isInstance(Talker)).to.be(true);
                expect(test_customer.isInstance(Walker)).to.be(true);
                expect(test_customer.isInstance(function () {})).to.be(false);

                expect(extended_test_customer.isInstance(Customer)).to.be(true);
                expect(extended_test_customer.isInstance(Empty_Mixin)).to.be(true);
                expect(extended_test_customer.isInstance(Person)).to.be(true);
                expect(extended_test_customer.isInstance(Walker)).to.be(true);
                expect(extended_test_customer.isInstance(Talker)).to.be(true);
                expect(extended_test_customer.isInstance(function () {})).to.be(false);

            });

        });

    });

}.call(this, (function () {
    "use strict";

    var currentEnvironment,
        generator;

    // Check the environment to determine the dependency management strategy.

    if (typeof define === "function" && !!define.amd) {

        currentEnvironment = 'amd';

    } else if (typeof require === "function" &&
                        module !== undefined && !!module.exports) {

        currentEnvironment = 'node';

    } else if (this.window !== undefined) {

        currentEnvironment = 'browser';

    }

    generator = (function () {
        switch (currentEnvironment) {

        case 'amd':

            // If RequireJS is used to load this module then return the global
            // define() function.
            return function (name, deps, mod) {
                define(deps, mod);
            };

        case 'node':

            // If this module is loaded in Node, require each of the
            // dependencies and pass them along.
            return function (name, deps, mod) {

                var x,
                    dep_list = [];

                for (x = 0; x < deps.length; x = x + 1) {

                    dep_list.push(require(deps[x]));

                }

                module.exports = mod.apply(this, dep_list);

            };

        case 'browser':

            // If this module is being used in a browser environment first
            // generate a list of dependencies, run the provided definition
            // function with the list of dependencies, and insert the returned
            // object into the global namespace using the provided module name.
            return function (name, deps, mod) {

                var namespaces = name.split('/'),
                    root = this,
                    dep_list = [],
                    current_scope,
                    current_dep,
                    i,
                    x;

                for (i = 0; i < deps.length; i = i + 1) {

                    current_scope = root;
                    current_dep = deps[i].split('/');

                    for (x = 0; x < current_dep.length; x = x + 1) {

                        current_scope = current_scope[current_dep[x]] || {};

                    }

                    dep_list.push(current_scope);

                }

                current_scope = root;
                for (i = 1; i < namespaces.length; i = i + 1) {

                    current_scope = current_scope[namespaces[i - 1]] || {};

                }

                current_scope[namespaces[i - 1]] = mod.apply(this, dep_list);

            };

        default:
            throw new Error("Unrecognized environment.");

        }

    }.call());


    return {
        env: currentEnvironment,
        def: generator
    };

}.call(this))));
