E2.p = E2.plugins["light_type_modulator"] = function(core, node)
{
	this.desc = 'Sets the type of the light source to either point or directional.';
	
	this.input_slots = [ 
		{ name: 'light', dt: core.datatypes.LIGHT, desc: 'Input light.' },
		{ name: 'type', dt: core.datatypes.FLOAT, desc: 'Set the light type. See also Generators/Values/Light type.', def: 'False' } 
	];
	
	this.output_slots = [
		{ name: 'light', dt: core.datatypes.LIGHT, desc: 'The modified light.' }
	];
};

E2.p.prototype.update_input = function(slot, data)
{
	if(slot.index === 0)
		this.light = data;
	else
		this.type = data < 0 ? 0 : data % Light.type.COUNT;
};

E2.p.prototype.connection_changed = function(on, conn, slot)
{
	if(!on && slot.type === E2.slot_type.input && slot.index === 0)
		this.light = new Light();
};

E2.p.prototype.update_state = function(delta_t)
{
	this.light.type = this.type;
};

E2.p.prototype.update_output = function(slot)
{
	return this.light;
};

E2.p.prototype.state_changed = function(ui)
{
	if(!ui)
	{
		this.light = new Light();
		this.type = Light.type.POINT;
	}
};
