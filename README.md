volvox-art-basel
================

iOS controller and node.js applications

iOS9 update:

- add the following to `platforms/ios/Portfolio/Portfolio-info.plist` after generating and building ios project

```
    <key>NSAppTransportSecurity</key>
    <dict>
    <!--Include to allow all connections-->
    <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
```