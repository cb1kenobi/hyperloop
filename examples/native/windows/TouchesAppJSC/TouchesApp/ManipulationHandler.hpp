#pragma once
#include "Headers.h"

using namespace Windows::UI;
using namespace Windows::UI::Xaml::Media;
using namespace Windows::UI::Xaml;
using namespace Windows::UI::Xaml::Input;
using namespace Windows::Foundation;

ref class ManipulationHandler_UID sealed : public ::Object
{
public:
	ManipulationHandler_UID();
	void ManipulationDelta(Object^ sender, ManipulationDeltaRoutedEventArgs^ e);

private:
	float angle_;
	Point translation_;
};

ManipulationHandler_UID::ManipulationHandler_UID()
	: angle_(0.0), translation_(0.0, 0.0) {}

void ManipulationHandler_UID::ManipulationDelta(Object^ sender, ManipulationDeltaRoutedEventArgs^ e)
{
    Canvas^ view = (Canvas^)e->OriginalSource;

	view->RenderTransformOrigin = Point(.5, .5);
	RotateTransform^ rotateTransform = ref new RotateTransform();
	//((ManipulationHandler^)sender)->angle_ +=  e->Delta.Rotation;
	angle_ +=  e->Delta.Rotation;
	rotateTransform->Angle = angle_;
	
	TranslateTransform^ translateTransform = ref new TranslateTransform();
	translation_.X += e->Delta.Translation.X;
	translation_.Y += e->Delta.Translation.Y;
	translateTransform->X = translation_.X;
	translateTransform->Y = translation_.Y;

	// Scale easier to set size properties directly
	view->Width += e->Delta.Expansion;
	view->Height += e->Delta.Expansion;

	TransformGroup^ transformGroup = ref new TransformGroup(); 
	transformGroup->Children->Append(rotateTransform);  
	transformGroup->Children->Append(translateTransform);
	view->RenderTransform = transformGroup;

	e->Handled = true;
}

class  ManipulationHandler
{
public:
	static void create(JSContextRef ctx, JSObjectRef global) {
		// Create our class.
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		classDefinition.callAsConstructor = classConstructor;
		classDefinition.finalize = classDestructor;
		JSObjectRef classDef = JSObjectMakeConstructor(ctx, NULL, classConstructor);

		// Register it in the global ctx as a constructor.
		JSStringRef className = JSStringCreateWithUTF8CString("ManipulationHandler");
		JSObjectSetProperty(ctx, global, className, classDef, kJSPropertyAttributeNone, NULL);
		JSStringRelease(className);

		// Set the prototype.
		JSObjectRef prototype = JSValueToObject(ctx, JSObjectGetPrototype(ctx, classDef), NULL);
		JSObjectSetPrototype(ctx, classDef, prototype);

		// ... property: name.
		JSStringRef nameProperty = JSStringCreateWithUTF8CString("name"),
		valueProperty = JSStringCreateWithUTF8CString("ManipulationHandler");
		JSValueRef valueRef = JSValueMakeString(ctx, valueProperty);
		JSObjectSetProperty(ctx, prototype, nameProperty, valueRef, kJSPropertyAttributeDontEnum, NULL);
		JSStringRelease(nameProperty);
		JSStringRelease(valueProperty);
	}

	static JSObjectRef classConstructor(JSContextRef ctx, JSObjectRef constructor, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
		PrivateObjectContainer* poc = new PrivateObjectContainer();
		ManipulationHandler_UID^ obj = ref new ManipulationHandler_UID();
		JSClassDefinition classDefinition = kJSClassDefinitionEmpty;
		JSClassRef classDef = JSClassCreate(&classDefinition);
		poc->set(obj);
		return JSObjectMake(ctx, classDef, poc);
	}

	static void classDestructor(JSObjectRef object) {
		void* raw = JSObjectGetPrivate(object);
		reinterpret_cast<PrivateObjectContainer*>(raw)->clean();
	}
};