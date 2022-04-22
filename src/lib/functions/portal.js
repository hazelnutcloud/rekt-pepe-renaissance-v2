export function portal(node, inject) {
	const target = document.querySelector(inject)
	target.parentElement.replaceChild(node, target);
}