.class public auto ansi windowsruntime sealed Windows.UI.Xaml.DependencyProperty
       extends [mscorlib]System.Object
       implements Windows.UI.Xaml.IDependencyProperty
{
  .custom instance void Windows.Foundation.Metadata.WebHostHiddenAttribute::.ctor() = ( 01 00 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.ThreadingAttribute::.ctor(valuetype Windows.Foundation.Metadata.ThreadingModel) = ( 01 00 03 00 00 00 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.MarshalingBehaviorAttribute::.ctor(valuetype Windows.Foundation.Metadata.MarshalingType) = ( 01 00 02 00 00 00 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.StaticAttribute::.ctor(class [mscorlib]System.Type,
                                                                           uint32) = ( 01 00 2A 57 69 6E 64 6F 77 73 2E 55 49 2E 58 61   // ..*Windows.UI.Xa
                                                                                       6D 6C 2E 49 44 65 70 65 6E 64 65 6E 63 79 50 72   // ml.IDependencyPr
                                                                                       6F 70 65 72 74 79 53 74 61 74 69 63 73 00 00 02   // opertyStatics...
                                                                                       06 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.VersionAttribute::.ctor(uint32) = ( 01 00 00 00 02 06 00 00 ) 
  .interfaceimpl type Windows.UI.Xaml.IDependencyProperty
  .custom instance void Windows.Foundation.Metadata.DefaultAttribute::.ctor() = ( 01 00 00 00 ) 
  .method public hidebysig newslot virtual final 
          instance class Windows.UI.Xaml.PropertyMetadata 
          GetMetadata([in] valuetype Windows.UI.Xaml.Interop.TypeName forType) runtime managed
  {
    .override Windows.UI.Xaml.IDependencyProperty::GetMetadata
  } // end of method DependencyProperty::GetMetadata

  .method public hidebysig specialname static 
          object  get_UnsetValue() runtime managed
  {
  } // end of method DependencyProperty::get_UnsetValue

  .method public hidebysig static class Windows.UI.Xaml.DependencyProperty 
          Register([in] string name,
                   [in] valuetype Windows.UI.Xaml.Interop.TypeName propertyType,
                   [in] valuetype Windows.UI.Xaml.Interop.TypeName ownerType,
                   [in] class Windows.UI.Xaml.PropertyMetadata typeMetadata) runtime managed
  {
  } // end of method DependencyProperty::Register

  .method public hidebysig static class Windows.UI.Xaml.DependencyProperty 
          RegisterAttached([in] string name,
                           [in] valuetype Windows.UI.Xaml.Interop.TypeName propertyType,
                           [in] valuetype Windows.UI.Xaml.Interop.TypeName ownerType,
                           [in] class Windows.UI.Xaml.PropertyMetadata defaultMetadata) runtime managed
  {
  } // end of method DependencyProperty::RegisterAttached

  .property object UnsetValue()
  {
    .get object Windows.UI.Xaml.DependencyProperty::get_UnsetValue()
  } // end of property DependencyProperty::UnsetValue
} // end of class Windows.UI.Xaml.DependencyProperty
