export function obj_is_empty(obj: object) {
	return JSON.stringify(obj) === '{}';
}
