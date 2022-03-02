import XCTest
@testable import BagelDB

class Animal: Codable {
    let _id: String
}

final class bageldb_swiftTests: XCTestCase {
    func testExample() {
        struct Animal {
            let _id: String
        }
        let bagelDB = BagelDB(apiToken: "sdsads")
        print("hello")
        bagelDB.collection(collectionID: "sadasd").get() {
            (response: Result<Animal, Error>) in
            switch response {
            case .failure(let error):
                print(error)
            case .success(let res):
                print(res._id)
            }
        }

    }

    static var allTests = [
        ("testExample", testExample),
    ]
}
