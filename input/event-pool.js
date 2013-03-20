var document = require("global/document")

var signal = require("../signal/signal")
var TransformStorage = require("./transform-storage")

var ENTER = 13

module.exports = EventPool

/*
String -> {
    signal: Signal<Any>,
    on: Element -> String -> (EventTarget -> Any) -> Element,
    submit: Element -> (valueof EventTarget -> Any) -> Element,
    change: Element -> (valueof EventTarget -> Any) -> Element
}
*/
function EventPool(name){
    var storage = TransformStorage(name)
    var events = {}
    var _next

    return {
        signal: signal(function (next) {
            handleSubmit(next)
            handleChange(next)

            Object.keys(events).forEach(function (event) {
                handleEvent(event, next)
            })

            _next = next
        }),
        submit: function (elem, transform) {
            return storage.set("submit", elem, transform)
        },
        change: function (elem, transform) {
            return storage.set("change", elem, transform)
        },
        on: function (elem, event, transform) {
            if (!events[event]) {
                events[event] = true

                if (_next) {
                    handleEvent(event, _next)
                }
            }

            return storage.set(event, elem, transform)
        }
    }

    function handleSubmit(next) {
        document.addEventListener("keypress", function (ev) {
            var target = ev.target
            var fn = storage.get("submit", target)

            var validEvent = fn && target.type === "text" &&
                ev.keyCode === ENTER && !ev.shiftKey

            if (!validEvent) {
                return
            }

            var item = fn(target.value)
            target.value = ""
            next(item)
        })

        document.addEventListener("click", function (ev) {
            var target = ev.target
            var fn = storage.get("submit", target)

            if (!fn || target.tagName !== "BUTTON") {
                return
            }

            var item = fn()
            next(item)
        })
    }

    function handleChange(next) {
        document.addEventListener("keypress", function (ev) {
            var target = ev.target
            var fn = storage.get("change", target)

            if (!fn || target.type !== "text") {
                return
            }

            var item = fn(target.value)
            next(item)
        })

        document.addEventListener("change", function (ev) {
            var target = ev.target
            var fn = storage.get("change", target)

            if (!fn || target.type !== "checkbox") {
                return
            }

            var item = fn(target.checked)
            next(item)
        })
    }

    function handleEvent(event, next) {
        document.addEventListener(event, function (ev) {
            var target = ev.target
            var fn = storage.get(event, target)

            if (fn) {
                next(fn(target))
            }
        }, true)
    }
}