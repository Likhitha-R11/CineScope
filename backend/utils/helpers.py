from bson import ObjectId

def json_serialize(data):
    if isinstance(data, ObjectId):
        return str(data)
    if isinstance(data, list):
        return [json_serialize(item) for item in data]
    if isinstance(data, dict):
        for key in data:
            data[key] = json_serialize(data[key])
    return data