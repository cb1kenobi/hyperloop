.class public auto ansi windowsruntime Windows.UI.Xaml.Media.GeneralTransform
       extends Windows.UI.Xaml.DependencyObject
       implements Windows.UI.Xaml.Media.IGeneralTransform,
                  Windows.UI.Xaml.Media.IGeneralTransformOverrides
{
  .custom instance void Windows.Foundation.Metadata.ThreadingAttribute::.ctor(valuetype Windows.Foundation.Metadata.ThreadingModel) = ( 01 00 03 00 00 00 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.VersionAttribute::.ctor(uint32) = ( 01 00 00 00 02 06 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.ComposableAttribute::.ctor(class [mscorlib]System.Type,
                                                                               valuetype Windows.Foundation.Metadata.CompositionType,
                                                                               uint32) = ( 01 00 2E 57 69 6E 64 6F 77 73 2E 55 49 2E 58 61   // ...Windows.UI.Xa
                                                                                           6D 6C 2E 4D 65 64 69 61 2E 49 47 65 6E 65 72 61   // ml.Media.IGenera
                                                                                           6C 54 72 61 6E 73 66 6F 72 6D 46 61 63 74 6F 72   // lTransformFactor
                                                                                           79 01 00 00 00 00 00 02 06 00 00 )                // y..........
  .custom instance void Windows.Foundation.Metadata.WebHostHiddenAttribute::.ctor() = ( 01 00 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.MarshalingBehaviorAttribute::.ctor(valuetype Windows.Foundation.Metadata.MarshalingType) = ( 01 00 02 00 00 00 00 00 ) 
  .interfaceimpl type Windows.UI.Xaml.Media.IGeneralTransform
  .custom instance void Windows.Foundation.Metadata.DefaultAttribute::.ctor() = ( 01 00 00 00 ) 
  .interfaceimpl type Windows.UI.Xaml.Media.IGeneralTransformOverrides
  .custom instance void Windows.Foundation.Metadata.OverridableAttribute::.ctor() = ( 01 00 00 00 ) 
  .method family hidebysig specialname rtspecialname 
          instance void  .ctor() runtime managed
  {
  } // end of method GeneralTransform::.ctor

  .method public hidebysig newslot specialname virtual final 
          instance class Windows.UI.Xaml.Media.GeneralTransform 
          get_Inverse() runtime managed
  {
    .override Windows.UI.Xaml.Media.IGeneralTransform::get_Inverse
  } // end of method GeneralTransform::get_Inverse

  .method public hidebysig newslot virtual final 
          instance valuetype Windows.Foundation.Point 
          TransformPoint([in] valuetype Windows.Foundation.Point point) runtime managed
  {
    .override Windows.UI.Xaml.Media.IGeneralTransform::TransformPoint
  } // end of method GeneralTransform::TransformPoint

  .method public hidebysig newslot virtual final 
          instance bool  TryTransform([in] valuetype Windows.Foundation.Point inPoint,
                                      [out] valuetype Windows.Foundation.Point& outPoint) runtime managed
  {
    .override Windows.UI.Xaml.Media.IGeneralTransform::TryTransform
  } // end of method GeneralTransform::TryTransform

  .method public hidebysig newslot virtual final 
          instance valuetype Windows.Foundation.Rect 
          TransformBounds([in] valuetype Windows.Foundation.Rect rect) runtime managed
  {
    .override Windows.UI.Xaml.Media.IGeneralTransform::TransformBounds
  } // end of method GeneralTransform::TransformBounds

  .method family hidebysig newslot specialname virtual 
          instance class Windows.UI.Xaml.Media.GeneralTransform 
          get_InverseCore() runtime managed
  {
    .override Windows.UI.Xaml.Media.IGeneralTransformOverrides::get_InverseCore
  } // end of method GeneralTransform::get_InverseCore

  .method family hidebysig newslot virtual 
          instance bool  TryTransformCore([in] valuetype Windows.Foundation.Point inPoint,
                                          [out] valuetype Windows.Foundation.Point& outPoint) runtime managed
  {
    .override Windows.UI.Xaml.Media.IGeneralTransformOverrides::TryTransformCore
  } // end of method GeneralTransform::TryTransformCore

  .method family hidebysig newslot virtual 
          instance valuetype Windows.Foundation.Rect 
          TransformBoundsCore([in] valuetype Windows.Foundation.Rect rect) runtime managed
  {
    .override Windows.UI.Xaml.Media.IGeneralTransformOverrides::TransformBoundsCore
  } // end of method GeneralTransform::TransformBoundsCore

  .property instance class Windows.UI.Xaml.Media.GeneralTransform
          Inverse()
  {
    .get instance class Windows.UI.Xaml.Media.GeneralTransform Windows.UI.Xaml.Media.GeneralTransform::get_Inverse()
  } // end of property GeneralTransform::Inverse
  .property instance class Windows.UI.Xaml.Media.GeneralTransform
          InverseCore()
  {
    .get instance class Windows.UI.Xaml.Media.GeneralTransform Windows.UI.Xaml.Media.GeneralTransform::get_InverseCore()
  } // end of property GeneralTransform::InverseCore
} // end of class Windows.UI.Xaml.Media.GeneralTransform