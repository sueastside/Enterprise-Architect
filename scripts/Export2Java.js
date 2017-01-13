!INC Local Scripts.EAConstants-JScript

var package = "be.project.example";
var maven_path = "\\src\\main\\java\\"
var project_path = "C:\\Local_Data\\Workspaces\\project\\example";


function output(resultsFile, lineContents) {
	if (resultsFile != null){
		resultsFile.WriteLine (lineContents);
	}
	Session.Output (lineContents);
}

function fullPath(file) {
	var re = /\./g;
	return project_path + maven_path + package.replace(re, '\\') + "\\" + file;
}

var TYPES = {
	"string": "String",
	"integer": "Integer",
	"long": "Long",
	"amount": "BigDecimal",
	"boolean": "Boolean",
	"date": "LocalDate",
	"datetime": "Date"
};
 
function writeField(resultsFile, attribute) {
	var currentAttribute as EA.Attribute;
	currentAttribute = attribute;
	var type = currentAttribute.Type;
	if (currentAttribute.Notes != "") {
		output(resultsFile, "	/*TODO: "+currentAttribute.Notes+"\n*/");
	}
	if (currentAttribute.LowerBound == 1 && currentAttribute.LowerBound == currentAttribute.UpperBound) {
		output(resultsFile, "	@NotNull");
	}
	
	var fieldType = TYPES[type]!=undefined?TYPES[type]:type;
	
    if (fieldType.indexOf("string") != -1 ) {
		if (type.indexOf("(") != -1 ) {
			var len = type.substring(type.indexOf("(")+1, type.indexOf(")"));
			output(resultsFile, "	@Size(max = "+len+")");
		}
		fieldType = "String";
	}
	if (TYPES[type]==undefined	&& fieldType.indexOf("Type") == -1 & fieldType.indexOf("Language") == -1) {
		//How to get the type element of an attribute, so we can check primitive and stereotype?
		output(resultsFile, "	@Valid");
	}
	output(resultsFile, "	private " + fieldType + " " + attribute.Name+";");
	output(resultsFile, "");
} 

function writeClass(clazz) {
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var path = fullPath(clazz.Name+".java");
	
	var resultsFile = null;
	try {
		resultsFile = fso.CreateTextFile(path);	
		Session.Output ("Writing to: "+path);
    } catch (e) {
		Session.Output ("!!! WARNING : No access on file " + path);
	}
	
	output(resultsFile, "package "+package+";");
	output(resultsFile, "");
	
	output(resultsFile, "import lombok.Data;");
	
	output(resultsFile, "import java.util.List;");
	output(resultsFile, "import java.util.Date;");
	
	output(resultsFile, "import javax.validation.Valid;");
	output(resultsFile, "import javax.validation.constraints.NotNull;");
	output(resultsFile, "");
	
	var extending = "";
	var baseClasses as EA.Collection;
	baseClasses = clazz.BaseClasses;
	for ( var i = 0 ; i < baseClasses.Count ; i++ )
	{
		var currentBaseClass as EA.Element;
		currentBaseClass = baseClasses.GetAt( i );
		extending += " extends " +  currentBaseClass.Name;
	}
	output(resultsFile, "@Data");
	output(resultsFile, "public class " + clazz.Name + extending + " {");
	var attributes as EA.Collection;
	attributes = clazz.Attributes;
	for ( var i = 0 ; i < attributes.Count ; i++ )
	{
		var currentAttribute as EA.Attribute;
		currentAttribute = attributes.GetAt( i );
		writeField(resultsFile, currentAttribute);
	}
	output(resultsFile, "}");
	
	if (resultsFile != null)
		resultsFile.Close();
}

function writeEnumeration(clazz) {
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var path = fullPath(clazz.Name+".java");
	
	var resultsFile = null;
	try {
		resultsFile = fso.CreateTextFile(path);	
		Session.Output ("Writing to: "+path);
    } catch (e) {
		Session.Output ("!!! WARNING : No access on file " + path);
	}
	
	output(resultsFile, "package "+package+";");
	output(resultsFile, "");
	
	output(resultsFile, "public enum " + clazz.Name + " {");
	var attributes as EA.Collection;
	attributes = clazz.Attributes;
	for ( var i = 0 ; i < attributes.Count ; i++ )
	{
		var currentAttribute as EA.Attribute;
		currentAttribute = attributes.GetAt( i );
		var terminator = attributes.Count-1==i?';':',';
		output(resultsFile, "  "+currentAttribute.Name+"(\"\")"+terminator);
	}
	
	output(resultsFile, "	private final String code;");

	output(resultsFile, "	"+clazz.Name+"(String code) {");
	output(resultsFile, "		this.code = code;");
	output(resultsFile, "	}");
	output(resultsFile, "	public String getCode() {");
	output(resultsFile, "		return code;");
	output(resultsFile, "	}");
	output(resultsFile, "}");
	
	if (resultsFile != null)
		resultsFile.Close();
}

function handleType (objectType, object) {
	switch ( objectType )
	{
		case otElement :
		{
			var currentElement as EA.Element;
			currentElement = object;
			if (currentElement.MetaType == 'Enumeration') {
				writeEnumeration(currentElement);
			} else {
				writeClass(currentElement);
			}
			break;
		}
		default:
		{
			Session.Prompt( "This script does not support items of this type.", promptOK );
		}
	}
}

function OnProjectBrowserScript()
{
	Repository.EnsureOutputVisible( "Script" );
	ClearOutput ("Script");
	
	var objects as EA.Collection;
	objects = Repository.GetTreeSelectedElements();
	for ( var i = 0 ; i < objects.Count ; i++ ) {
		var currentObject = objects.GetAt( i );
		handleType (currentObject.ObjectType, currentObject)
	}
}

OnProjectBrowserScript();

