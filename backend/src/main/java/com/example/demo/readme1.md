What is JSON?
It is JavaScript object 



What is Serialization?
Serialization means converting an object from its in-memory form into a format that can be stored or transmitted.

Process                             Direction                               Example
Serialization                       Java objs -> JSON                       Sending API Response            
Deserialization                     JSON -> Java objs                       Receiving API Responses


idf i want implement multiple todos then i need an in-memory data store instead of returning a fixed list each time.


understand how collections are represented in JSON.
1. Array [ ] — an ordered list of items
   Square brackets [ ]
   Items separated by commas
   No keys/names — just position (item 0, item 1, item 2...)
   This is how a Java List or array gets serialized
2. Object { } — a single set of key-value pairs
   Curly braces { }
   Every value has a named key
   This is how a single Java object (like one Todo) gets serialized
   A JSON array [ ] = a collection. A JSON object { } = a single item (or a wrapper holding a collection inside it).