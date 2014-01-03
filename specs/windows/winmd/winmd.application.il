.class public auto ansi windowsruntime Windows.UI.Xaml.Application
       extends [mscorlib]System.Object
       implements Windows.UI.Xaml.IApplication,
                  Windows.UI.Xaml.IApplicationOverrides
{
  .custom instance void Windows.Foundation.Metadata.WebHostHiddenAttribute::.ctor() = ( 01 00 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.MarshalingBehaviorAttribute::.ctor(valuetype Windows.Foundation.Metadata.MarshalingType) = ( 01 00 02 00 00 00 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.StaticAttribute::.ctor(class [mscorlib]System.Type,
                                                                           uint32) = ( 01 00 23 57 69 6E 64 6F 77 73 2E 55 49 2E 58 61   // ..#Windows.UI.Xa
                                                                                       6D 6C 2E 49 41 70 70 6C 69 63 61 74 69 6F 6E 53   // ml.IApplicationS
                                                                                       74 61 74 69 63 73 00 00 02 06 00 00 )             // tatics......
  .custom instance void Windows.Foundation.Metadata.ComposableAttribute::.ctor(class [mscorlib]System.Type,
                                                                               valuetype Windows.Foundation.Metadata.CompositionType,
                                                                               uint32) = ( 01 00 23 57 69 6E 64 6F 77 73 2E 55 49 2E 58 61   // ..#Windows.UI.Xa
                                                                                           6D 6C 2E 49 41 70 70 6C 69 63 61 74 69 6F 6E 46   // ml.IApplicationF
                                                                                           61 63 74 6F 72 79 02 00 00 00 00 00 02 06 00 00 ) // actory..........
  .custom instance void Windows.Foundation.Metadata.ThreadingAttribute::.ctor(valuetype Windows.Foundation.Metadata.ThreadingModel) = ( 01 00 03 00 00 00 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.VersionAttribute::.ctor(uint32) = ( 01 00 00 00 02 06 00 00 ) 
  .interfaceimpl type Windows.UI.Xaml.IApplication
  .custom instance void Windows.Foundation.Metadata.DefaultAttribute::.ctor() = ( 01 00 00 00 ) 
  .interfaceimpl type Windows.UI.Xaml.IApplicationOverrides
  .custom instance void Windows.Foundation.Metadata.OverridableAttribute::.ctor() = ( 01 00 00 00 ) 
  .method public hidebysig specialname rtspecialname 
          instance void  .ctor() runtime managed
  {
  } // end of method Application::.ctor

  .method public hidebysig newslot specialname virtual final 
          instance class Windows.UI.Xaml.ResourceDictionary 
          get_Resources() runtime managed
  {
    .override Windows.UI.Xaml.IApplication::get_Resources
  } // end of method Application::get_Resources

  .method public hidebysig newslot specialname virtual final 
          instance void  put_Resources([in] class Windows.UI.Xaml.ResourceDictionary 'value') runtime managed
  {
    .override Windows.UI.Xaml.IApplication::put_Resources
  } // end of method Application::put_Resources

  .method public hidebysig newslot specialname virtual final 
          instance class Windows.UI.Xaml.DebugSettings 
          get_DebugSettings() runtime managed
  {
    .override Windows.UI.Xaml.IApplication::get_DebugSettings
  } // end of method Application::get_DebugSettings

  .method public hidebysig newslot specialname virtual final 
          instance valuetype Windows.UI.Xaml.ApplicationTheme 
          get_RequestedTheme() runtime managed
  {
    .override Windows.UI.Xaml.IApplication::get_RequestedTheme
  } // end of method Application::get_RequestedTheme

  .method public hidebysig newslot specialname virtual final 
          instance void  put_RequestedTheme([in] valuetype Windows.UI.Xaml.ApplicationTheme 'value') runtime managed
  {
    .override Windows.UI.Xaml.IApplication::put_RequestedTheme
  } // end of method Application::put_RequestedTheme

  .method public hidebysig newslot specialname virtual final 
          instance valuetype Windows.Foundation.EventRegistrationToken 
          add_UnhandledException([in] class Windows.UI.Xaml.UnhandledExceptionEventHandler 'value') runtime managed
  {
    .override Windows.UI.Xaml.IApplication::add_UnhandledException
  } // end of method Application::add_UnhandledException

  .method public hidebysig newslot specialname virtual final 
          instance void  remove_UnhandledException([in] valuetype Windows.Foundation.EventRegistrationToken token) runtime managed
  {
    .override Windows.UI.Xaml.IApplication::remove_UnhandledException
  } // end of method Application::remove_UnhandledException

  .method public hidebysig newslot specialname virtual final 
          instance valuetype Windows.Foundation.EventRegistrationToken 
          add_Suspending([in] class Windows.UI.Xaml.SuspendingEventHandler 'value') runtime managed
  {
    .override Windows.UI.Xaml.IApplication::add_Suspending
  } // end of method Application::add_Suspending

  .method public hidebysig newslot specialname virtual final 
          instance void  remove_Suspending([in] valuetype Windows.Foundation.EventRegistrationToken token) runtime managed
  {
    .override Windows.UI.Xaml.IApplication::remove_Suspending
  } // end of method Application::remove_Suspending

  .method public hidebysig newslot specialname virtual final 
          instance valuetype Windows.Foundation.EventRegistrationToken 
          add_Resuming([in] class Windows.Foundation.EventHandler`1<object> 'value') runtime managed
  {
    .override Windows.UI.Xaml.IApplication::add_Resuming
  } // end of method Application::add_Resuming

  .method public hidebysig newslot specialname virtual final 
          instance void  remove_Resuming([in] valuetype Windows.Foundation.EventRegistrationToken token) runtime managed
  {
    .override Windows.UI.Xaml.IApplication::remove_Resuming
  } // end of method Application::remove_Resuming

  .method public hidebysig newslot virtual final 
          instance void  Exit() runtime managed
  {
    .override Windows.UI.Xaml.IApplication::Exit
  } // end of method Application::Exit

  .method family hidebysig newslot virtual 
          instance void  OnActivated([in] class Windows.ApplicationModel.Activation.IActivatedEventArgs args) runtime managed
  {
    .override Windows.UI.Xaml.IApplicationOverrides::OnActivated
  } // end of method Application::OnActivated

  .method family hidebysig newslot virtual 
          instance void  OnLaunched([in] class Windows.ApplicationModel.Activation.LaunchActivatedEventArgs args) runtime managed
  {
    .override Windows.UI.Xaml.IApplicationOverrides::OnLaunched
  } // end of method Application::OnLaunched

  .method family hidebysig newslot virtual 
          instance void  OnFileActivated([in] class Windows.ApplicationModel.Activation.FileActivatedEventArgs args) runtime managed
  {
    .override Windows.UI.Xaml.IApplicationOverrides::OnFileActivated
  } // end of method Application::OnFileActivated

  .method family hidebysig newslot virtual 
          instance void  OnSearchActivated([in] class Windows.ApplicationModel.Activation.SearchActivatedEventArgs args) runtime managed
  {
    .override Windows.UI.Xaml.IApplicationOverrides::OnSearchActivated
  } // end of method Application::OnSearchActivated

  .method family hidebysig newslot virtual 
          instance void  OnShareTargetActivated([in] class Windows.ApplicationModel.Activation.ShareTargetActivatedEventArgs args) runtime managed
  {
    .override Windows.UI.Xaml.IApplicationOverrides::OnShareTargetActivated
  } // end of method Application::OnShareTargetActivated

  .method family hidebysig newslot virtual 
          instance void  OnFileOpenPickerActivated([in] class Windows.ApplicationModel.Activation.FileOpenPickerActivatedEventArgs args) runtime managed
  {
    .override Windows.UI.Xaml.IApplicationOverrides::OnFileOpenPickerActivated
  } // end of method Application::OnFileOpenPickerActivated

  .method family hidebysig newslot virtual 
          instance void  OnFileSavePickerActivated([in] class Windows.ApplicationModel.Activation.FileSavePickerActivatedEventArgs args) runtime managed
  {
    .override Windows.UI.Xaml.IApplicationOverrides::OnFileSavePickerActivated
  } // end of method Application::OnFileSavePickerActivated

  .method family hidebysig newslot virtual 
          instance void  OnCachedFileUpdaterActivated([in] class Windows.ApplicationModel.Activation.CachedFileUpdaterActivatedEventArgs args) runtime managed
  {
    .override Windows.UI.Xaml.IApplicationOverrides::OnCachedFileUpdaterActivated
  } // end of method Application::OnCachedFileUpdaterActivated

  .method family hidebysig newslot virtual 
          instance void  OnWindowCreated([in] class Windows.UI.Xaml.WindowCreatedEventArgs args) runtime managed
  {
    .override Windows.UI.Xaml.IApplicationOverrides::OnWindowCreated
  } // end of method Application::OnWindowCreated

  .method public hidebysig specialname static 
          class Windows.UI.Xaml.Application 
          get_Current() runtime managed
  {
  } // end of method Application::get_Current

  .method public hidebysig static void  Start([in] class Windows.UI.Xaml.ApplicationInitializationCallback callback) runtime managed
  {
  } // end of method Application::Start

  .method public hidebysig static void  LoadComponent([in] object component,
                                                      [in] class Windows.Foundation.Uri resourceLocator) runtime managed
  {
    .custom instance void Windows.Foundation.Metadata.OverloadAttribute::.ctor(string) = ( 01 00 0D 4C 6F 61 64 43 6F 6D 70 6F 6E 65 6E 74   // ...LoadComponent
                                                                                           00 00 ) 
  } // end of method Application::LoadComponent

  .method public hidebysig static void  LoadComponent([in] object component,
                                                      [in] class Windows.Foundation.Uri resourceLocator,
                                                      [in] valuetype Windows.UI.Xaml.Controls.Primitives.ComponentResourceLocation componentResourceLocation) runtime managed
  {
    .custom instance void Windows.Foundation.Metadata.OverloadAttribute::.ctor(string) = ( 01 00 21 4C 6F 61 64 43 6F 6D 70 6F 6E 65 6E 74   // ..!LoadComponent
                                                                                           57 69 74 68 52 65 73 6F 75 72 63 65 4C 6F 63 61   // WithResourceLoca
                                                                                           74 69 6F 6E 00 00 )                               // tion..
  } // end of method Application::LoadComponent

  .event class Windows.Foundation.EventHandler`1<object> Resuming
  {
    .removeon instance void Windows.UI.Xaml.Application::remove_Resuming(valuetype Windows.Foundation.EventRegistrationToken)
    .addon instance valuetype Windows.Foundation.EventRegistrationToken Windows.UI.Xaml.Application::add_Resuming(class Windows.Foundation.EventHandler`1<object>)
  } // end of event Application::Resuming
  .event Windows.UI.Xaml.SuspendingEventHandler Suspending
  {
    .addon instance valuetype Windows.Foundation.EventRegistrationToken Windows.UI.Xaml.Application::add_Suspending(class Windows.UI.Xaml.SuspendingEventHandler)
    .removeon instance void Windows.UI.Xaml.Application::remove_Suspending(valuetype Windows.Foundation.EventRegistrationToken)
  } // end of event Application::Suspending
  .event Windows.UI.Xaml.UnhandledExceptionEventHandler UnhandledException
  {
    .addon instance valuetype Windows.Foundation.EventRegistrationToken Windows.UI.Xaml.Application::add_UnhandledException(class Windows.UI.Xaml.UnhandledExceptionEventHandler)
    .removeon instance void Windows.UI.Xaml.Application::remove_UnhandledException(valuetype Windows.Foundation.EventRegistrationToken)
  } // end of event Application::UnhandledException
  .property instance class Windows.UI.Xaml.DebugSettings
          DebugSettings()
  {
    .get instance class Windows.UI.Xaml.DebugSettings Windows.UI.Xaml.Application::get_DebugSettings()
  } // end of property Application::DebugSettings
  .property instance valuetype Windows.UI.Xaml.ApplicationTheme
          RequestedTheme()
  {
    .set instance void Windows.UI.Xaml.Application::put_RequestedTheme(valuetype Windows.UI.Xaml.ApplicationTheme)
    .get instance valuetype Windows.UI.Xaml.ApplicationTheme Windows.UI.Xaml.Application::get_RequestedTheme()
  } // end of property Application::RequestedTheme
  .property instance class Windows.UI.Xaml.ResourceDictionary
          Resources()
  {
    .set instance void Windows.UI.Xaml.Application::put_Resources(class Windows.UI.Xaml.ResourceDictionary)
    .get instance class Windows.UI.Xaml.ResourceDictionary Windows.UI.Xaml.Application::get_Resources()
  } // end of property Application::Resources
  .property class Windows.UI.Xaml.Application
          Current()
  {
    .get class Windows.UI.Xaml.Application Windows.UI.Xaml.Application::get_Current()
  } // end of property Application::Current
} // end of class Windows.UI.Xaml.Application