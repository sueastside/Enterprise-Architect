!INC Local Scripts.EAConstants-JScript
function OnProjectBrowserScript()
{
	//var name = "Transversal Services.Applications.Outbound.Technical design.Logical Components.Outbound Overview";
	var name = Session.Input("Go to Node Path:")

	var split = name.split(".");
	var current = Repository.Models.GetByName(split[0]);
	for (var i = 1; i < split.length-1; i++) {
		var part = split[i];
		Session.Output("at: "+part);
		current = current.Packages.GetByName(part);
	}

	var result = null;
	var stuff = ["Elements", "Packages", "Diagrams"];
	for(var i = 0; i < stuff.length; i++) {
		try {
			result = current[stuff[i]].GetByName(split[split.length-1]);
			if (result) {
				break;
			}
		} catch (e) {
			Session.Output("warning: "+e.message);
		} 
	}
	Session.Output("found "+result.Name);
	Repository.ShowInProjectView(result);
}
OnProjectBrowserScript();
