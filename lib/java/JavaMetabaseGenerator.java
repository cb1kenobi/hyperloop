/**
 * Java Metabase Generator
 */
import java.io.*;
import java.util.*;
import java.util.jar.*;
import java.util.zip.*;
import java.util.regex.*;
import org.apache.bcel.util.*;
import org.apache.bcel.classfile.*;
import org.apache.bcel.generic.*;
import org.json.*;

/**
 * Class that will generate a metadatabase from the Java classpath
 */
public class JavaMetabaseGenerator
{
    private static final SyntheticRepository repo = SyntheticRepository.getInstance();
    private static final Pattern isClass = Pattern.compile("\\.class$");

    /**
     * this is a regular expression of packages that we want to blacklist and not include in the output
     */
    private static final Pattern blacklist = Pattern.compile("^(javax\\/|com\\/sun|org\\/apache\\/bcel|sun\\/|com\\/apple|quicktime\\/|apple\\/|com\\/oracle\\/jrockit|oracle\\/jrockit|sunw\\/|org\\/omg|java\\/awt|java\\/applet|junit\\/|edu\\/umd\\/cs\\/findbugs)");

	/**
	 * enumerate over a zip/jar and load up it's classes
	 */
	private static void enumerate (Enumeration<? extends ZipEntry> e, HashMap<String,JavaClass> cache) throws Exception {

		for (;e.hasMoreElements();)
       	{
       		String entry = e.nextElement().toString();
       		if (!blacklist.matcher(entry).find() && isClass.matcher(entry).find()) {
       			String classname = entry.replaceAll("/",".").replace(".class","");
       			JavaClass cls = repo.loadClass(classname);
       			cache.put(classname, cls);
       		}
       	}
	}

	/**
	 * add access modifiers for a field or method
	 */
	private static JSONArray addAttributes(AccessFlags obj)
	{
		JSONArray json = new JSONArray();

		if (obj.isFinal())
		{
			json.put("final");
		}
		if (obj.isAbstract())
		{
			json.put("abstract");
		}
		if (obj.isPrivate())
		{
			json.put("private");
		}
		if (obj.isProtected())
		{
			json.put("protected");
		}
		if (obj.isPublic())
		{
			json.put("public");
		}
		if (obj.isStatic())
		{
			json.put("static");
		}
		if (obj.isNative())
		{
			json.put("native");
		}
		return json;
	}

	/**
	 * this class takes no arguments and returns JSON as System.out
	 */
    public static void main(String[] args) throws Exception
    {

    	ClassPath cp = new ClassPath();
    	String classpath = cp.getClassPath();
    	String tokens [] = classpath.split(File.pathSeparator);
    	HashMap<String,JavaClass> cache = new HashMap<String,JavaClass>();
    	for (String token : tokens)
    	{
    		if (token.endsWith(".jar")) {
    			JarFile jarFile = new JarFile(token);
    			enumerate(jarFile.entries(),cache);
    		}
    		else if (token.endsWith(".zip")) {
    			ZipFile zipFile = new ZipFile(token);
    			enumerate(zipFile.entries(),cache);
    		}
    	}

    	JSONObject json = new JSONObject();
    	JSONObject classes = new JSONObject();
    	json.put("classes",classes);

    	for (String key : cache.keySet())
    	{
    		JavaClass javaClass = cache.get(key);
    		JSONObject classJSON = new JSONObject();
    		classJSON.put("package",javaClass.getPackageName());
    		String interfaces [] = javaClass.getInterfaceNames();
    		JSONArray interfacesJSON = new JSONArray();
    		for (String intfn : interfaces)
    		{
    			interfacesJSON.put(intfn);
    		}
    		classJSON.put("interfaces",interfacesJSON);
    		classJSON.put("superClass",javaClass.getSuperclassName());
    		classJSON.put("attributes",addAttributes(javaClass));
    		classJSON.put("metatype",javaClass.isInterface() ? "interface" : "class");
    		classes.put(key, classJSON);

    		JSONObject methodsJSON = new JSONObject();
    		classJSON.put("methods", methodsJSON);

    		Method methods [] = javaClass.getMethods();
    		for (Method method : methods)
    		{
    			JSONObject methodJSON = new JSONObject();
    			methodJSON.put("attributes",addAttributes(method));
    			methodsJSON.put(method.getName(), methodJSON);
    			JSONArray argumentJSON = new JSONArray();
    			for (Type type : method.getArgumentTypes())
    			{
    				JSONObject obj = new JSONObject();
    				obj.put("type",type);
    				argumentJSON.put(obj);
    			}
    			methodJSON.put("args",argumentJSON);
    			methodJSON.put("returnType",method.getReturnType());
    			JSONArray exceptionsJSON = new JSONArray();
    			ExceptionTable exceptions = method.getExceptionTable();
    			if (exceptions!=null)
    			{
    				for (String exname : exceptions.getExceptionNames())
    				{
    					exceptionsJSON.put(exname);
    				}
    			}
    			methodJSON.put("exceptions",exceptionsJSON);
    		}


    		JSONObject propertiesJSON = new JSONObject();
    		classJSON.put("properties", propertiesJSON);

    		Field fields [] = javaClass.getFields();
    		for (Field field : fields)
    		{
    			JSONObject fieldJSON = new JSONObject();
    			fieldJSON.put("attributes",addAttributes(field));
    			fieldJSON.put("type",field.getType());
    			fieldJSON.put("value",field.getConstantValue());
    			fieldJSON.put("metatype", field.getConstantValue()!=null ? "constant" : "field");
    			fieldJSON.put("attributes",addAttributes(field));
    			propertiesJSON.put(field.getName(), fieldJSON);
    		}

    	}

    	System.out.println(json.toString(3));
    }
}
