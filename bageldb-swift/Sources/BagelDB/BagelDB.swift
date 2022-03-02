import Foundation

final class BagelDB {
    
    var apiToken: String
    
    init(apiToken: String) {
        self.apiToken = apiToken
    }
    
    func collection(collectionID: String) -> BagelDBRequest {
        return BagelDBRequest(bagelDB: self, collectionID: collectionID)
    }
}

class BagelDBRequest {
    var collectionID: String
    var pageNumber = 1
    var perPage = 50
    var _everything = false
    var itemID = ""
    var _query = Array<String>()
    var sortField = "", sortOrder = ""
    
    let baseURL = URL(string: "https://api.bagelstudio.co/api/public")!

    
    init(bagelDB: BagelDB, collectionID: String) {
        self.collectionID = collectionID
    }
    
    func pageNumber(pageNumber: Int) -> BagelDBRequest {
        self.pageNumber = pageNumber
        return self
    }
    
    func perPage(perPage: Int) -> BagelDBRequest {
        self.perPage = perPage
        return self
    }
    
    func everything() -> BagelDBRequest {
        self._everything = true
        return self
    }
    
    func item(itemID: String) -> BagelDBRequest {
        self.itemID = itemID
        return self
    }
    
    func query(key: String, operator: String, value: String) -> BagelDBRequest {
        let queryValue = String(key + ":" + `operator` + ":" + value)
        print(queryValue)
        _query.append(queryValue)
        return self
    }
    
    func sort(field: String, order: String) -> BagelDBRequest {
        self.sortOrder = order
        self.sortField = field
        return self
    }
    
    func get<T: Codable>(completion: @escaping (Result<T, Error>) -> Void) {
        var getURL = baseURL.appendingPathComponent("/collection/\(self.collectionID)")
        var request = URLRequest(url: getURL)
        request.httpMethod = "GET"
        request.setValue("v1", forHTTPHeaderField: "Accept-Version")
        URLSession.shared.dataTask(with: request) { (data, _, error) in
            print("request complete")
            if let error = error {
                DispatchQueue.main.async {
                    completion(.failure(error))
                }
                return
            }
            
                do {
                    let response = try JSONDecoder().decode(T.self, from: data!)
                    print(response)
                } catch let err {
                    completion(.failure(err))
                }
        }.resume()
    }
}
