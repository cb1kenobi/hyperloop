.class interface private abstract auto ansi windowsruntime Windows.UI.ApplicationSettings.ISettingsCommandFactory
{
  .custom instance void Windows.Foundation.Metadata.GuidAttribute::.ctor(uint32,
                                                                         uint16,
                                                                         uint16,
                                                                         uint8,
                                                                         uint8,
                                                                         uint8,
                                                                         uint8,
                                                                         uint8,
                                                                         uint8,
                                                                         uint8,
                                                                         uint8) = ( 01 00 33 5B E1 68 83 1C 3A 43 AA 5A CE EE A5 BD   // ..3[.h..:C.Z....
                                                                                    47 64 00 00 )                                     // Gd..
  .custom instance void Windows.Foundation.Metadata.VersionAttribute::.ctor(uint32) = ( 01 00 00 00 02 06 00 00 ) 
  .custom instance void Windows.Foundation.Metadata.ExclusiveToAttribute::.ctor(class [mscorlib]System.Type) = ( 01 00 2E 57 69 6E 64 6F 77 73 2E 55 49 2E 41 70   // ...Windows.UI.Ap
                                                                                                                 70 6C 69 63 61 74 69 6F 6E 53 65 74 74 69 6E 67   // plicationSetting
                                                                                                                 73 2E 53 65 74 74 69 6E 67 73 43 6F 6D 6D 61 6E   // s.SettingsComman
                                                                                                                 64 00 00 )                                        // d..
  .method public hidebysig newslot abstract virtual 
          instance class Windows.UI.ApplicationSettings.SettingsCommand 
          Create([in] object settingsCommandId,
                 [in] string label,
                 [in] class Windows.UI.Popups.UICommandInvokedHandler 'handler') cil managed
  {
    .custom instance void Windows.Foundation.Metadata.OverloadAttribute::.ctor(string) = ( 01 00 15 43 72 65 61 74 65 53 65 74 74 69 6E 67   // ...CreateSetting
                                                                                           73 43 6F 6D 6D 61 6E 64 00 00 )                   // sCommand..
    .param [1]
    .custom instance void Windows.Foundation.Metadata.VariantAttribute::.ctor() = ( 01 00 00 00 ) 
  } // end of method ISettingsCommandFactory::Create

} // end of class Windows.UI.ApplicationSettings.ISettingsCommandFactory
