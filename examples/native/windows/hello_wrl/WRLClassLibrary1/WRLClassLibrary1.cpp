#include "pch.h"

#include "WRLClassLibrary1_h.h"
#include <wrl.h>

using namespace Microsoft::WRL;
using namespace Windows::Foundation;

namespace WRLClassLibrary1
{
    class WinRTClass: public RuntimeClass<IWinRTClass>
    {
        InspectableClass(L"WRLClassLibrary1.WinRTClass", BaseTrust)

        public:
        WinRTClass()
        {
        }
    };

    ActivatableClass(WinRTClass);
}