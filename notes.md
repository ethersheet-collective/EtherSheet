ETHERSHEET
==========================================================================================

## Models
*User
*Selection
*Sheet
*Expression
*CellValue

##Views
*Table
*ExpressionEditor
*TableControls
*ConnectedUsers
*SettingsEditor

#Transport
*SocketConnection

Implementation Notes
- Inefficient to have event listeners on each cell, better to have a single table listener that inspects the element
- Likewise, keeping a model around for each CellValue is also bad
- After every cell edit, check whether the value is a number or a string, make a note of it
- Might be better to store text and number values in separate arrays, more efficient and will make expressions easier to deal with

