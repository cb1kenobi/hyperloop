/**
 * Copyright (c) 2013 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 * This generated code and related technologies are covered by patents
 * or patents pending by Appcelerator, Inc.
 */
#import <hyperloop.h>

struct HLBlockLiteral {
    void *isa; // initialized to &_NSConcreteStackBlock or &_NSConcreteGlobalBlock
    int flags;
    int reserved;
    void (*invoke)(void *, ...);
    struct block_descriptor {
        unsigned long int reserved;        // NULL
            unsigned long int size;         // sizeof(struct Block_literal_1)
        // optional helper functions
            void (*copy_helper)(void *dst, void *src);     // IFF (1<<25)
            void (*dispose_helper)(void *src);             // IFF (1<<25)
        // required ABI.2010.3.16
        const char *signature;                         // IFF (1<<30)
    } *descriptor;
    // imported variables
};

enum {
    HLBlockDescriptionFlagsHasCopyDispose = (1 << 25),
    HLBlockDescriptionFlagsHasCtor = (1 << 26), // helpers have C++ code
    HLBlockDescriptionFlagsIsGlobal = (1 << 28),
    HLBlockDescriptionFlagsHasStret = (1 << 29), // IFF BLOCK_HAS_SIGNATURE
    HLBlockDescriptionFlagsHasSignature = (1 << 30)
};

/**
 * we make an extended structure that will be replaced in the 
 * instance of the HLBlockLiteral to handle JS cleanup
 */
struct hyperloop_block_descriptor 
{
    // from original struct block_descriptor
    unsigned long int reserved;
    unsigned long int size;
    void (*copy_helper)(void *dst, void *src);
    void (*dispose_helper)(void *src);
    const char *signature;

    // these are added members used to manage JS memory
    JSObjectRef thisObject;
    JSObjectRef function;
    JSContextRef context;
    void (*orig_dispose_helper)(void *src);
};

