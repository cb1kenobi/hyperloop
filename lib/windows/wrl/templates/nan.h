#pragma once
<%- renderTemplate('jsc/templates/doc.ejs') %>
<% if (options.sdk !== '8.1') { %>
static double NAN = std::numeric_limits<double>::quiet_NaN();
<% } %>

#ifndef isnan
  #define isnan(a) (a != a)
#endif