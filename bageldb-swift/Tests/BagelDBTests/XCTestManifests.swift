import XCTest

#if !canImport(ObjectiveC)
public func allTests() -> [XCTestCaseEntry] {
    return [
        testCase(bageldb_swiftTests.allTests),
    ]
}
#endif
