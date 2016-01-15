const doc = document;

export default class EventUtils{};

EventUtils.on = (name, cb) => {
	if (!doc.addEventListener && doc.attachEvent) {
		doc.attachEvent("on"+ name, cb);
	} else {
		doc.addEventListener(name, cb);
	}
};

EventUtils.off = (name, cb) => {
	if (!doc.removeEventListener && doc.detachEvent) {
		doc.detachEvent("on" + name, cb);
	} else {
		doc.removeEventListener(name, cb);
	}
};

EventUtils.isOutside = (elements, event) => {
	let eventTarget = (event.target) ? event.target : event.srcElement;
	if(eventTarget.parentElement == null && eventTarget != document.body.parentElement){
		return false;
	}
	while (eventTarget != null) {
		if (elements.indexOf(eventTarget) != -1) return false;
		eventTarget = eventTarget.parentElement;
	}
	return true;
};